/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import LoaderWorker from "worker-loader?inline=no-fallback!../workers/LoaderWorker.js";
import InputWorker from "worker-loader?inline=no-fallback!../workers/InputWorker.mjs";
import Utils, {debounce} from "../../core/Utils.mjs";
import {toBase64} from "../../core/lib/Base64.mjs";
import cptable from "codepage";

import {
    EditorView, keymap, highlightSpecialChars, drawSelection, rectangularSelection, crosshairCursor, dropCursor
} from "@codemirror/view";
import {EditorState, Compartment} from "@codemirror/state";
import {defaultKeymap, insertTab, insertNewline, history, historyKeymap} from "@codemirror/commands";
import {bracketMatching} from "@codemirror/language";
import {search, searchKeymap, highlightSelectionMatches} from "@codemirror/search";

import {statusBar} from "../utils/statusBar.mjs";
import {fileDetailsPanel} from "../utils/fileDetails.mjs";
import {renderSpecialChar} from "../utils/editorUtils.mjs";


/**
 * Waiter to handle events related to the input.
 */
class InputWaiter {

    /**
     * InputWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.inputTextEl = document.getElementById("input-text");
        this.inputChrEnc = 0;
        this.initEditor();

        this.inputWorker = null;
        this.loaderWorkers = [];
        this.workerId = 0;
        this.maxTabs = this.manager.tabs.calcMaxTabs();
        this.callbacks = {};
        this.callbackID = 0;

        this.maxWorkers = 1;
        if (navigator.hardwareConcurrency !== undefined &&
            navigator.hardwareConcurrency > 1) {
            // Subtract 1 from hardwareConcurrency value to avoid using
            // the entire available resources
            this.maxWorkers = navigator.hardwareConcurrency - 1;
        }
    }

    /**
     * Sets up the CodeMirror Editor and returns the view
     */
    initEditor() {
        this.inputEditorConf = {
            eol: new Compartment,
            lineWrapping: new Compartment,
            fileDetailsPanel: new Compartment
        };

        const initialState = EditorState.create({
            doc: null,
            extensions: [
                // Editor extensions
                history(),
                highlightSpecialChars({render: renderSpecialChar}),
                drawSelection(),
                rectangularSelection(),
                crosshairCursor(),
                dropCursor(),
                bracketMatching(),
                highlightSelectionMatches(),
                search({top: true}),
                EditorState.allowMultipleSelections.of(true),

                // Custom extensions
                statusBar({
                    label: "Input",
                    eolHandler: this.eolChange.bind(this),
                    chrEncHandler: this.chrEncChange.bind(this),
                    chrEncGetter: this.getChrEnc.bind(this)
                }),

                // Mutable state
                this.inputEditorConf.fileDetailsPanel.of([]),
                this.inputEditorConf.lineWrapping.of(EditorView.lineWrapping),
                this.inputEditorConf.eol.of(EditorState.lineSeparator.of("\n")),

                // Keymap
                keymap.of([
                    // Explicitly insert a tab rather than indenting the line
                    { key: "Tab", run: insertTab },
                    // Explicitly insert a new line (using the current EOL char) rather
                    // than messing around with indenting, which does not respect EOL chars
                    { key: "Enter", run: insertNewline },
                    ...historyKeymap,
                    ...defaultKeymap,
                    ...searchKeymap
                ]),

                // Event listeners
                EditorView.updateListener.of(e => {
                    if (e.selectionSet)
                        this.manager.highlighter.selectionChange("input", e);
                    if (e.docChanged)
                        this.inputChange(e);
                })
            ]
        });

        this.inputEditorView = new EditorView({
            state: initialState,
            parent: this.inputTextEl
        });
    }

    /**
     * Handler for EOL change events
     * Sets the line separator
     * @param {string} eolVal
     */
    eolChange(eolVal) {
        const oldInputVal = this.getInput();

        // Update the EOL value
        this.inputEditorView.dispatch({
            effects: this.inputEditorConf.eol.reconfigure(EditorState.lineSeparator.of(eolVal))
        });

        // Reset the input so that lines are recalculated, preserving the old EOL values
        this.setInput(oldInputVal);
    }

    /**
     * Handler for Chr Enc change events
     * Sets the input character encoding
     * @param {number} chrEncVal
     */
    chrEncChange(chrEncVal) {
        if (typeof chrEncVal !== "number") return;
        this.inputChrEnc = chrEncVal;
        this.inputChange();
    }

    /**
     * Getter for the input character encoding
     * @returns {number}
     */
    getChrEnc() {
        return this.inputChrEnc;
    }

    /**
     * Sets word wrap on the input editor
     * @param {boolean} wrap
     */
    setWordWrap(wrap) {
        this.inputEditorView.dispatch({
            effects: this.inputEditorConf.lineWrapping.reconfigure(
                wrap ? EditorView.lineWrapping : []
            )
        });
    }

    /**
     * Gets the value of the current input
     * @returns {string}
     */
    getInput() {
        const doc = this.inputEditorView.state.doc;
        const eol = this.inputEditorView.state.lineBreak;
        return doc.sliceString(0, doc.length, eol);
    }

    /**
     * Sets the value of the current input
     * @param {string} data
     */
    setInput(data) {
        this.inputEditorView.dispatch({
            changes: {
                from: 0,
                to: this.inputEditorView.state.doc.length,
                insert: data
            }
        });
    }

    /**
     * Calculates the maximum number of tabs to display
     */
    calcMaxTabs() {
        const numTabs = this.manager.tabs.calcMaxTabs();
        if (this.inputWorker && this.maxTabs !== numTabs) {
            this.maxTabs = numTabs;
            this.inputWorker.postMessage({
                action: "updateMaxTabs",
                data: {
                    maxTabs: numTabs,
                    activeTab: this.manager.tabs.getActiveTab("input")
                }
            });
        }
    }

    /**
     * Terminates any existing workers and sets up a new InputWorker and LoaderWorker
     */
    setupInputWorker() {
        if (this.inputWorker !== null) {
            this.inputWorker.terminate();
            this.inputWorker = null;
        }

        for (let i = this.loaderWorkers.length - 1; i >= 0; i--) {
            this.removeLoaderWorker(this.loaderWorkers[i]);
        }

        log.debug("Adding new InputWorker");
        this.inputWorker = new InputWorker();
        this.inputWorker.postMessage({
            action: "updateMaxWorkers",
            data: this.maxWorkers
        });
        this.inputWorker.postMessage({
            action: "updateMaxTabs",
            data: {
                maxTabs: this.maxTabs,
                activeTab: this.manager.tabs.getActiveTab("input")
            }
        });
        this.inputWorker.postMessage({
            action: "setLogLevel",
            data: log.getLevel()
        });
        this.inputWorker.addEventListener("message", this.handleInputWorkerMessage.bind(this));
    }

    /**
     * Activates a loaderWorker and sends it to the InputWorker
     */
    activateLoaderWorker() {
        const workerIdx = this.addLoaderWorker();
        if (workerIdx === -1) return;

        const workerObj = this.loaderWorkers[workerIdx];
        this.inputWorker.postMessage({
            action: "loaderWorkerReady",
            data: {
                id: workerObj.id
            }
        });
    }

    /**
     * Adds a new loaderWorker
     *
     * @returns {number} - The index of the created worker
     */
    addLoaderWorker() {
        if (this.loaderWorkers.length === this.maxWorkers) {
            return -1;
        }
        log.debug("Adding new LoaderWorker.");
        const newWorker = new LoaderWorker();
        const workerId = this.workerId++;
        newWorker.addEventListener("message", this.handleLoaderMessage.bind(this));
        newWorker.postMessage({id: workerId});
        const newWorkerObj = {
            worker: newWorker,
            id: workerId
        };
        this.loaderWorkers.push(newWorkerObj);
        return this.loaderWorkers.indexOf(newWorkerObj);
    }

    /**
     * Removes a loaderworker
     *
     * @param {Object} workerObj - Object containing the loaderWorker and its id
     * @param {LoaderWorker} workerObj.worker - The actual loaderWorker
     * @param {number} workerObj.id - The ID of the loaderWorker
     */
    removeLoaderWorker(workerObj) {
        const idx = this.loaderWorkers.indexOf(workerObj);
        if (idx === -1) {
            return;
        }
        log.debug(`Terminating worker ${this.loaderWorkers[idx].id}`);
        this.loaderWorkers[idx].worker.terminate();
        this.loaderWorkers.splice(idx, 1);
    }

    /**
     * Finds and returns the object for the loaderWorker of a given id
     *
     * @param {number} id - The ID of the loaderWorker to find
     * @returns {object}
     */
    getLoaderWorker(id) {
        const idx = this.getLoaderWorkerIndex(id);
        if (idx === -1) return;
        return this.loaderWorkers[idx];
    }

    /**
     * Gets the index for the loaderWorker of a given id
     *
     * @param {number} id - The ID of hte loaderWorker to find
     * @returns {number} The current index of the loaderWorker in the array
     */
    getLoaderWorkerIndex(id) {
        for (let i = 0; i < this.loaderWorkers.length; i++) {
            if (this.loaderWorkers[i].id === id) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Sends an input to be loaded to the loaderWorker
     *
     * @param {object} inputData - Object containing the input to be loaded
     * @param {File} inputData.file - The actual file object to load
     * @param {number} inputData.inputNum - The inputNum for the file object
     * @param {number} inputData.workerId - The ID of the loaderWorker that will load it
     */
    loadInput(inputData) {
        const idx = this.getLoaderWorkerIndex(inputData.workerId);
        if (idx === -1) return;
        this.loaderWorkers[idx].worker.postMessage({
            file: inputData.file,
            inputNum: inputData.inputNum
        });
    }

    /**
     * Handler for messages sent back by the loaderWorker
     * Sends the message straight to the inputWorker to be handled there.
     *
     * @param {MessageEvent} e
     */
    handleLoaderMessage(e) {
        const r = e.data;

        if (Object.prototype.hasOwnProperty.call(r, "progress") &&
            Object.prototype.hasOwnProperty.call(r, "inputNum")) {
            this.manager.tabs.updateTabProgress(r.inputNum, r.progress, 100, "input");
        }

        const transferable = Object.prototype.hasOwnProperty.call(r, "fileBuffer") ? [r.fileBuffer] : undefined;
        this.inputWorker.postMessage({
            action: "loaderWorkerMessage",
            data: r
        }, transferable);
    }


    /**
     * Handler for messages sent back by the inputWorker
     *
     * @param {MessageEvent} e
     */
    handleInputWorkerMessage(e) {
        const r = e.data;

        if (!("action" in r)) {
            log.error("A message was received from the InputWorker with no action property. Ignoring message.");
            return;
        }

        log.debug(`Receiving ${r.action} from InputWorker.`);

        switch (r.action) {
            case "activateLoaderWorker":
                this.activateLoaderWorker();
                break;
            case "loadInput":
                this.loadInput(r.data);
                break;
            case "terminateLoaderWorker":
                this.removeLoaderWorker(this.getLoaderWorker(r.data));
                break;
            case "refreshTabs":
                this.refreshTabs(r.data.nums, r.data.activeTab, r.data.tabsLeft, r.data.tabsRight);
                break;
            case "changeTab":
                this.changeTab(r.data, this.app.options.syncTabs);
                break;
            case "updateTabHeader":
                this.manager.tabs.updateTabHeader(r.data.inputNum, r.data.input, "input");
                break;
            case "loadingInfo":
                this.showLoadingInfo(r.data, true);
                break;
            case "setInput":
                this.set(r.data.inputNum, r.data.inputObj, r.data.silent);
                break;
            case "inputAdded":
                this.inputAdded(r.data.changeTab, r.data.inputNum);
                break;
            case "queueInput":
                this.manager.worker.queueInput(r.data);
                break;
            case "queueInputError":
                this.manager.worker.queueInputError(r.data);
                break;
            case "bakeAllInputs":
                this.manager.worker.bakeAllInputs(r.data);
                break;
            case "displayTabSearchResults":
                this.displayTabSearchResults(r.data);
                break;
            case "filterTabError":
                this.app.handleError(r.data);
                break;
            case "setUrl":
                this.app.updateURL(r.data.includeInput, r.data.input);
                break;
            case "getInput":
            case "getInputNums":
                this.callbacks[r.data.id](r.data);
                break;
            case "removeChefWorker":
                this.removeChefWorker();
                break;
            case "fileLoaded":
                this.fileLoaded(r.data.inputNum);
                break;
            default:
                log.error(`Unknown action ${r.action}.`);
        }
    }

    /**
     * Sends a message to the inputWorker to bake all inputs
     */
    bakeAll() {
        this.app.progress = 0;
        debounce(this.manager.controls.toggleBakeButtonFunction, 20, "toggleBakeButton", this, ["loading"]);
        this.inputWorker.postMessage({
            action: "bakeAll"
        });
    }

    /**
     * Sets the input in the input area
     *
     * @param {number} inputNum
     * @param {Object} inputData - Object containing the input and its metadata
     *     @param {string} type
     *     @param {ArrayBuffer} buffer
     *     @param {string} stringSample
     *     @param {Object} file
     *         @param {string} file.name
     *         @param {number} file.size
     *         @param {string} file.type
     *     @param {string} status
     *     @param {number} progress
     *     @param {number} encoding
     * @param {boolean} [silent=false] - If false, fires the manager statechange event
     */
    async set(inputNum, inputData, silent=false) {
        return new Promise(function(resolve, reject) {
            const activeTab = this.manager.tabs.getActiveTab("input");
            if (inputNum !== activeTab) return;

            this.inputChrEnc = inputData.encoding;

            if (inputData.file) {
                this.setFile(inputNum, inputData);
            } else {
                this.clearFile(inputNum);
            }

            let inputVal;
            if (this.inputChrEnc > 0) {
                inputVal = cptable.utils.decode(this.inputChrEnc, new Uint8Array(inputData.buffer));
            } else {
                inputVal = Utils.arrayBufferToStr(inputData.buffer);
            }

            this.setInput(inputVal);

            // Set URL to current input
            if (inputVal.length >= 0 && inputVal.length <= 51200) {
                const inputStr = toBase64(inputVal, "A-Za-z0-9+/");
                this.app.updateURL(true, inputStr);
            }

            if (!silent) window.dispatchEvent(this.manager.statechange);

        }.bind(this));
    }

    /**
     * Displays file details
     *
     * @param {number} inputNum
     * @param {Object} inputData - Object containing the input and its metadata
     *     @param {string} type
     *     @param {ArrayBuffer} buffer
     *     @param {string} stringSample
     *     @param {Object} file
     *         @param {string} file.name
     *         @param {number} file.size
     *         @param {string} file.type
     *     @param {string} status
     *     @param {number} progress
     */
    setFile(inputNum, inputData) {
        const activeTab = this.manager.tabs.getActiveTab("input");
        if (inputNum !== activeTab) return;

        // Create file details panel
        this.inputEditorView.dispatch({
            effects: this.inputEditorConf.fileDetailsPanel.reconfigure(
                fileDetailsPanel({
                    fileDetails: inputData.file,
                    progress: inputData.progress,
                    status: inputData.status,
                    buffer: inputData.buffer,
                    renderPreview: this.app.options.imagePreview
                })
            )
        });
    }

    /**
     * Clears the file details panel
     *
     * @param {number} inputNum
     */
    clearFile(inputNum) {
        const activeTab = this.manager.tabs.getActiveTab("input");
        if (inputNum !== activeTab) return;

        // Clear file details panel
        this.inputEditorView.dispatch({
            effects: this.inputEditorConf.fileDetailsPanel.reconfigure([])
        });
    }

    /**
     * Update file details when a file completes loading
     *
     * @param {number} inputNum - The inputNum of the input which has finished loading
     */
    fileLoaded(inputNum) {
        this.manager.tabs.updateTabProgress(inputNum, 100, 100, "input");

        const activeTab = this.manager.tabs.getActiveTab("input");
        if (activeTab !== inputNum) return;

        this.inputWorker.postMessage({
            action: "setInput",
            data: {
                inputNum: inputNum,
                silent: false
            }
        });

        this.updateFileProgress(inputNum, 100);
    }

    /**
     * Updates the displayed load progress for a file
     *
     * @param {number} inputNum
     * @param {number | string} progress - Either a number or "error"
     */
    updateFileProgress(inputNum, progress) {
        // const activeTab = this.manager.tabs.getActiveTab("input");
        // if (inputNum !== activeTab) return;

        // TODO

        // const fileLoaded = document.getElementById("input-file-loaded");
        // if (progress === "error") {
        //     fileLoaded.textContent = "Error";
        //     fileLoaded.style.color = "#FF0000";
        // } else {
        //     fileLoaded.textContent = progress + "%";
        //     fileLoaded.style.color = "";
        // }
    }

    /**
     * Updates the stored value for the specified inputNum
     *
     * @param {number} inputNum
     * @param {string | ArrayBuffer} value
     */
    updateInputValue(inputNum, value, force=false) {
        // Prepare the value as a buffer (full value) and a string sample (up to 4096 bytes)
        let buffer;
        let stringSample = "";

        // If value is a string, interpret it using the specified character encoding
        if (typeof value === "string") {
            stringSample = value.slice(0, 4096);
            if (this.getChrEnc() > 0) {
                buffer = cptable.utils.encode(this.getChrEnc(), value);
                buffer = new Uint8Array(buffer).buffer;
            } else {
                buffer = Utils.strToArrayBuffer(value);
            }
        } else {
            buffer = value;
            stringSample = Utils.arrayBufferToStr(value.slice(0, 4096));
        }


        const recipeStr = buffer.byteLength < 51200 ? toBase64(buffer, "A-Za-z0-9+/") : ""; // B64 alphabet with no padding
        const includeInput = recipeStr.length > 0 && buffer.byteLength < 51200;
        this.app.updateURL(includeInput, recipeStr);

        const transferable = [buffer];
        this.inputWorker.postMessage({
            action: "updateInputValue",
            data: {
                inputNum: inputNum,
                buffer: buffer,
                stringSample: stringSample,
                encoding: this.getChrEnc()
            }
        }, transferable);
    }

    /**
     * Get the input value for the specified input
     *
     * @param {number} inputNum - The inputNum of the input to retrieve from the inputWorker
     * @returns {ArrayBuffer | string}
     */
    async getInputValue(inputNum) {
        return await new Promise(resolve => {
            this.getInputFromWorker(inputNum, false, r => {
                resolve(r.data);
            });
        });
    }

    /**
     * Get the input object for the specified input
     *
     * @param {number} inputNum - The inputNum of the input to retrieve from the inputWorker
     * @returns {object}
     */
    async getInputObj(inputNum) {
        return await new Promise(resolve => {
            this.getInputFromWorker(inputNum, true, r => {
                resolve(r.data);
            });
        });
    }

    /**
     * Gets the specified input from the inputWorker
     *
     * @param {number} inputNum - The inputNum of the data to get
     * @param {boolean} getObj - If true, get the actual data object of the input instead of just the value
     * @param {Function} callback - The callback to execute when the input is returned
     * @returns {ArrayBuffer | string | object}
     */
    getInputFromWorker(inputNum, getObj, callback) {
        const id = this.callbackID++;

        this.callbacks[id] = callback;

        this.inputWorker.postMessage({
            action: "getInput",
            data: {
                inputNum: inputNum,
                getObj: getObj,
                id: id
            }
        });
    }

    /**
     * Gets the number of inputs from the inputWorker
     *
     * @returns {object}
     */
    async getInputNums() {
        return await new Promise(resolve => {
            this.getNums(r => {
                resolve(r);
            });
        });
    }

    /**
     * Gets a list of inputNums from the inputWorker, and sends
     * them back to the specified callback
     */
    getNums(callback) {
        const id = this.callbackID++;

        this.callbacks[id] = callback;

        this.inputWorker.postMessage({
            action: "getInputNums",
            data: id
        });
    }

    /**
     * Handler for input change events.
     * Updates the value stored in the inputWorker
     * Debounces the input so we don't call autobake too often.
     *
     * @param {event} e
     *
     * @fires Manager#statechange
     */
    inputChange(e) {
        debounce(function(e) {
            const value = this.getInput();
            const activeTab = this.manager.tabs.getActiveTab("input");

            this.updateInputValue(activeTab, value);
            this.manager.tabs.updateTabHeader(activeTab, value.slice(0, 100).replace(/[\n\r]/g, ""), "input");

            // Fire the statechange event as the input has been modified
            window.dispatchEvent(this.manager.statechange);
        }, 20, "inputChange", this, [e])();
    }

    /**
     * Handler for input dragover events.
     * Gives the user a visual cue to show that items can be dropped here.
     *
     * @param {event} e
     */
    inputDragover(e) {
        // This will be set if we're dragging an operation
        if (e.dataTransfer.effectAllowed === "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        e.target.closest("#input-text").classList.add("dropping-file");
    }

    /**
     * Handler for input dragleave events.
     * Removes the visual cue.
     *
     * @param {event} e
     */
    inputDragleave(e) {
        e.stopPropagation();
        e.preventDefault();
        // Dragleave often fires when moving between lines in the editor.
        // If the target element is within the input-text element, we are still on target.
        if (!this.inputTextEl.contains(e.target))
            e.target.closest("#input-text").classList.remove("dropping-file");
    }

    /**
     * Handler for input drop events.
     * Loads the dragged data.
     *
     * @param {event} e
     */
    inputDrop(e) {
        // This will be set if we're dragging an operation
        if (e.dataTransfer.effectAllowed === "move")
            return false;

        e.stopPropagation();
        e.preventDefault();
        e.target.closest("#input-text").classList.remove("dropping-file");

        // Dropped text is handled by the editor itself
        if (e.dataTransfer.getData("Text")) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            this.loadUIFiles(e.dataTransfer.files);
        }
    }

    /**
     * Handler for open input button events
     * Loads the opened data into the input textarea
     *
     * @param {event} e
     */
    inputOpen(e) {
        e.preventDefault();

        if (e.target.files.length > 0) {
            this.loadUIFiles(e.target.files);
            e.target.value = "";
        }
    }

    /**
     * Load files from the UI into the inputWorker
     *
     * @param {FileList} files - The list of files to be loaded
     */
    loadUIFiles(files) {
        const numFiles = files.length;
        const activeTab = this.manager.tabs.getActiveTab("input");
        log.debug(`Loading ${numFiles} files.`);

        // Display the number of files as pending so the user
        // knows that we've received the files.
        this.showLoadingInfo({
            pending: numFiles,
            loading: 0,
            loaded: 0,
            total: numFiles,
            activeProgress: {
                inputNum: activeTab,
                progress: 0
            }
        }, false);

        this.inputWorker.postMessage({
            action: "loadUIFiles",
            data: {
                files: files,
                activeTab: activeTab
            }
        });
    }

    /**
     * Handler for open input button click.
     * Opens the open file dialog.
     */
    inputOpenClick() {
        document.getElementById("open-file").click();
    }

    /**
     * Handler for open folder button click
     * Opens the open folder dialog.
     */
    folderOpenClick() {
        document.getElementById("open-folder").click();
    }

    /**
     * Display the loaded files information in the input header.
     * Also, sets the background of the Input header to be a progress bar
     * @param {object} loadedData - Object containing the loading information
     * @param {number} loadedData.pending - How many files are pending (not loading / loaded)
     * @param {number} loadedData.loading - How many files are being loaded
     * @param {number} loadedData.loaded - How many files have been loaded
     * @param {number} loadedData.total - The total number of files
     * @param {object} loadedData.activeProgress - Object containing data about the active tab
     * @param {number} loadedData.activeProgress.inputNum - The inputNum of the input the progress is for
     * @param {number} loadedData.activeProgress.progress - The loading progress of the active input
     * @param {boolean} autoRefresh - If true, automatically refreshes the loading info by sending a message to the inputWorker after 100ms
     */
    showLoadingInfo(loadedData, autoRefresh) {
        const pending = loadedData.pending;
        const loading = loadedData.loading;
        const loaded = loadedData.loaded;
        const total = loadedData.total;

        let width = total.toLocaleString().length;
        width = width < 2 ? 2 : width;

        const totalStr = total.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
        let msg = "total: " + totalStr;

        const loadedStr = loaded.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
        msg += "<br>loaded: " + loadedStr;

        if (pending > 0) {
            const pendingStr = pending.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>pending: " + pendingStr;
        } else if (loading > 0) {
            const loadingStr = loading.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>loading: " + loadingStr;
        }

        const inFiles = document.getElementById("input-files-info");
        if (total > 1) {
            inFiles.innerHTML = msg;
            inFiles.style.display = "";
        } else {
            inFiles.style.display = "none";
        }

        this.updateFileProgress(loadedData.activeProgress.inputNum, loadedData.activeProgress.progress);

        const inputTitle = document.getElementById("input").firstElementChild;
        if (loaded < total) {
            const percentComplete = loaded / total * 100;
            inputTitle.style.background = `linear-gradient(to right, var(--title-background-colour) ${percentComplete}%, var(--primary-background-colour) ${percentComplete}%)`;
        } else {
            inputTitle.style.background = "";
        }

        if (loaded < total && autoRefresh) {
            setTimeout(function() {
                this.inputWorker.postMessage({
                    action: "getLoadProgress",
                    data: this.manager.tabs.getActiveTab("input")
                });
            }.bind(this), 100);
        }
    }

    /**
     * Change to a different tab.
     *
     * @param {number} inputNum - The inputNum of the tab to change to
     * @param {boolean} [changeOutput=false] - If true, also changes the output
     */
    changeTab(inputNum, changeOutput=false) {
        if (this.manager.tabs.getTabItem(inputNum, "input") !== null) {
            this.manager.tabs.changeTab(inputNum, "input");
            this.inputWorker.postMessage({
                action: "setInput",
                data: {
                    inputNum: inputNum,
                    silent: true
                }
            });
        } else {
            const minNum = Math.min(...this.manager.tabs.getTabList("input"));
            let direction = "right";
            if (inputNum < minNum) {
                direction = "left";
            }
            this.inputWorker.postMessage({
                action: "refreshTabs",
                data: {
                    inputNum: inputNum,
                    direction: direction
                }
            });
        }

        if (changeOutput) {
            this.manager.output.changeTab(inputNum, false);
        }
    }

    /**
     * Handler for clicking on a tab
     *
     * @param {event} mouseEvent
     */
    changeTabClick(mouseEvent) {
        if (!mouseEvent.target) return;

        const tabNum = mouseEvent.target.parentElement.getAttribute("inputNum");
        if (tabNum >= 0) {
            this.changeTab(parseInt(tabNum, 10), this.app.options.syncTabs);
        }
    }

    /**
     * Handler for clear all IO events.
     * Resets the input, output and info areas, and creates a new inputWorker
     */
    clearAllIoClick() {
        this.manager.worker.cancelBake(true, true);
        this.manager.worker.loaded = false;
        this.manager.output.removeAllOutputs();
        this.manager.output.terminateZipWorker();

        const tabsList = document.getElementById("input-tabs");
        const tabsListChildren = tabsList.children;

        tabsList.classList.remove("tabs-left");
        tabsList.classList.remove("tabs-right");
        for (let i = tabsListChildren.length - 1; i >= 0; i--) {
            tabsListChildren.item(i).remove();
        }

        this.showLoadingInfo({
            pending: 0,
            loading: 0,
            loaded: 1,
            total: 1,
            activeProgress: {
                inputNum: 1,
                progress: 100
            }
        });

        this.setupInputWorker();
        this.manager.worker.setupChefWorker();
        this.addInput(true);

        // Fire the statechange event as the input has been modified
        window.dispatchEvent(this.manager.statechange);
    }

    /**
     * Sets the console log level in the worker.
     *
     * @param {string} level
     */
    setLogLevel(level) {
        if (!this.inputWorker) return;
        this.inputWorker.postMessage({
            action: "setLogLevel",
            data: log.getLevel()
        });
    }

    /**
     * Sends a message to the inputWorker to add a new input.
     * @param {boolean} [changeTab=false] - If true, changes the tab to the new input
     */
    addInput(changeTab=false) {
        if (!this.inputWorker) return;
        this.inputWorker.postMessage({
            action: "addInput",
            data: changeTab
        });
    }

    /**
     * Handler for add input button clicked.
     */
    addInputClick() {
        this.addInput(true);
    }

    /**
     * Handler for when the inputWorker adds a new input
     *
     * @param {boolean} changeTab - Whether or not to change to the new input tab
     * @param {number} inputNum - The new inputNum
     */
    inputAdded(changeTab, inputNum) {
        this.addTab(inputNum, changeTab);

        this.manager.output.addOutput(inputNum, changeTab);
        this.manager.worker.addChefWorker();
    }

    /**
     * Remove a chefWorker from the workerWaiter if we remove an input
     */
    removeChefWorker() {
        const workerIdx = this.manager.worker.getInactiveChefWorker(true);
        const worker = this.manager.worker.chefWorkers[workerIdx];
        this.manager.worker.removeChefWorker(worker);
    }

    /**
     * Adds a new input tab.
     *
     * @param {number} inputNum - The inputNum of the new tab
     * @param {boolean} [changeTab=true] - If true, changes to the new tab once it's been added
     */
    addTab(inputNum, changeTab = true) {
        const tabsWrapper = document.getElementById("input-tabs"),
            numTabs = tabsWrapper.children.length;

        if (!this.manager.tabs.getTabItem(inputNum, "input") && numTabs < this.maxTabs) {
            const newTab = this.manager.tabs.createTabElement(inputNum, changeTab, "input");
            tabsWrapper.appendChild(newTab);

            if (numTabs > 0) {
                this.manager.tabs.showTabBar();
            } else {
                this.manager.tabs.hideTabBar();
            }

            this.inputWorker.postMessage({
                action: "updateTabHeader",
                data: inputNum
            });
        } else if (numTabs === this.maxTabs) {
            // Can't create a new tab
            document.getElementById("input-tabs").lastElementChild.classList.add("tabs-right");
        }

        if (changeTab) this.changeTab(inputNum, false);
    }

    /**
     * Refreshes the input tabs, and changes to activeTab
     *
     * @param {number[]} nums - The inputNums to be displayed as tabs
     * @param {number} activeTab - The tab to change to
     * @param {boolean} tabsLeft - True if there are input tabs to the left of the displayed tabs
     * @param {boolean} tabsRight - True if there are input tabs to the right of the displayed tabs
     */
    refreshTabs(nums, activeTab, tabsLeft, tabsRight) {
        this.manager.tabs.refreshTabs(nums, activeTab, tabsLeft, tabsRight, "input");

        this.inputWorker.postMessage({
            action: "setInput",
            data: {
                inputNum: activeTab,
                silent: true
            }
        });
    }

    /**
     * Sends a message to the inputWorker to remove an input.
     * If the input tab is on the screen, refreshes the tabs
     *
     * @param {number} inputNum - The inputNum of the tab to be removed
     */
    removeInput(inputNum) {
        let refresh = false;
        if (this.manager.tabs.getTabItem(inputNum, "input") !== null) {
            refresh = true;
        }
        this.inputWorker.postMessage({
            action: "removeInput",
            data: {
                inputNum: inputNum,
                refreshTabs: refresh,
                removeChefWorker: true
            }
        });

        this.manager.output.removeTab(inputNum);
    }

    /**
     * Handler for clicking on a remove tab button
     *
     * @param {event} mouseEvent
     */
    removeTabClick(mouseEvent) {
        if (!mouseEvent.target) {
            return;
        }
        const tabNum = mouseEvent.target.closest("button").parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.removeInput(parseInt(tabNum, 10));
        }
    }

    /**
     * Handler for scrolling on the input tabs area
     *
     * @param {event} wheelEvent
     */
    scrollTab(wheelEvent) {
        wheelEvent.preventDefault();

        if (wheelEvent.deltaY > 0) {
            this.changeTabLeft();
        } else if (wheelEvent.deltaY < 0) {
            this.changeTabRight();
        }
    }

    /**
     * Handler for mouse down on the next tab button
     */
    nextTabClick() {
        this.mousedown = true;
        this.changeTabRight();
        const time = 200;
        const func = function(time) {
            if (this.mousedown) {
                this.changeTabRight();
                const newTime = (time > 50) ? time - 10 : 50;
                setTimeout(func.bind(this, [newTime]), newTime);
            }
        };
        this.tabTimeout = setTimeout(func.bind(this, [time]), time);
    }

    /**
     * Handler for mouse down on the previous tab button
     */
    previousTabClick() {
        this.mousedown = true;
        this.changeTabLeft();
        const time = 200;
        const func = function(time) {
            if (this.mousedown) {
                this.changeTabLeft();
                const newTime = (time > 50) ? time - 10 : 50;
                setTimeout(func.bind(this, [newTime]), newTime);
            }
        };
        this.tabTimeout = setTimeout(func.bind(this, [time]), time);
    }

    /**
     * Handler for mouse up event on the tab buttons
     */
    tabMouseUp() {
        this.mousedown = false;

        clearTimeout(this.tabTimeout);
        this.tabTimeout = null;
    }

    /**
     * Changes to the next (right) tab
     */
    changeTabRight() {
        const activeTab = this.manager.tabs.getActiveTab("input");
        if (activeTab === -1) return;
        this.inputWorker.postMessage({
            action: "changeTabRight",
            data: {
                activeTab: activeTab
            }
        });
    }

    /**
     * Changes to the previous (left) tab
     */
    changeTabLeft() {
        const activeTab = this.manager.tabs.getActiveTab("input");
        if (activeTab === -1) return;
        this.inputWorker.postMessage({
            action: "changeTabLeft",
            data: {
                activeTab: activeTab
            }
        });
    }

    /**
     * Handler for go to tab button clicked
     */
    async goToTab() {
        const inputNums = await this.getInputNums();
        let tabNum = window.prompt(`Enter tab number (${inputNums.min} - ${inputNums.max}):`, this.manager.tabs.getActiveTab("input").toString());

        if (tabNum === null) return;
        tabNum = parseInt(tabNum, 10);

        this.changeTab(tabNum, this.app.options.syncTabs);
    }

    /**
     * Handler for find tab button clicked
     */
    findTab() {
        this.filterTabSearch();
        $("#input-tab-modal").modal();
    }

    /**
     * Sends a message to the inputWorker to search the inputs
     */
    filterTabSearch() {
        const showPending = document.getElementById("input-show-pending").checked;
        const showLoading = document.getElementById("input-show-loading").checked;
        const showLoaded = document.getElementById("input-show-loaded").checked;

        const filter = document.getElementById("input-filter").value;
        const filterType = document.getElementById("input-filter-button").innerText;
        const numResults = parseInt(document.getElementById("input-num-results").value, 10);

        this.inputWorker.postMessage({
            action: "filterTabs",
            data: {
                showPending: showPending,
                showLoading: showLoading,
                showLoaded: showLoaded,
                filter: filter,
                filterType: filterType,
                numResults: numResults
            }
        });
    }

    /**
     * Handle when an option in the filter drop down box is clicked
     *
     * @param {event} mouseEvent
     */
    filterOptionClick(mouseEvent) {
        document.getElementById("input-filter-button").innerText = mouseEvent.target.innerText;
        this.filterTabSearch();
    }

    /**
     * Displays the results of a tab search in the find tab box
     *
     * @param {object[]} results - List of results objects
     *
     */
    displayTabSearchResults(results) {
        const resultsList = document.getElementById("input-search-results");

        for (let i = resultsList.children.length - 1; i >= 0; i--) {
            resultsList.children.item(i).remove();
        }

        for (let i = 0; i < results.length; i++) {
            const newListItem = document.createElement("li");
            newListItem.classList.add("input-filter-result");
            newListItem.setAttribute("inputNum", results[i].inputNum);
            newListItem.innerText = `${results[i].inputNum}: ${results[i].textDisplay}`;

            resultsList.appendChild(newListItem);
        }
    }

    /**
     * Handler for clicking on a filter result
     *
     * @param {event} e
     */
    filterItemClick(e) {
        if (!e.target) return;
        const inputNum = parseInt(e.target.getAttribute("inputNum"), 10);
        if (inputNum <= 0) return;

        $("#input-tab-modal").modal("hide");
        this.changeTab(inputNum, this.app.options.syncTabs);
    }

}

export default InputWaiter;
