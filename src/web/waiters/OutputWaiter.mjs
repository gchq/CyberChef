/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils, {debounce} from "../../core/Utils.mjs";
import Dish from "../../core/Dish.mjs";
import {detectFileType} from "../../core/lib/FileType.mjs";
import FileSaver from "file-saver";
import ZipWorker from "worker-loader?inline=no-fallback!../workers/ZipWorker.mjs";

import {
    EditorView,
    keymap,
    highlightSpecialChars,
    drawSelection,
    rectangularSelection,
    crosshairCursor
} from "@codemirror/view";
import {
    EditorState,
    Compartment
} from "@codemirror/state";
import {
    defaultKeymap
} from "@codemirror/commands";
import {
    bracketMatching
} from "@codemirror/language";
import {
    search,
    searchKeymap,
    highlightSelectionMatches
} from "@codemirror/search";

import {statusBar} from "../utils/statusBar.mjs";
import {htmlPlugin} from "../utils/htmlWidget.mjs";
import {copyOverride} from "../utils/copyOverride.mjs";
import {renderSpecialChar} from "../utils/editorUtils.mjs";


/**
  * Waiter to handle events related to the output
  */
class OutputWaiter {

    /**
     * OutputWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.outputTextEl = document.getElementById("output-text");
        // Object to handle output HTML state - used by htmlWidget extension
        this.htmlOutput = {
            html: "",
            changed: false
        };
        // Hold a copy of the currently displayed output so that we don't have to update it unnecessarily
        this.currentOutputCache = null;
        this.initEditor();

        this.outputs = {};
        this.zipWorker = null;
        this.maxTabs = this.manager.tabs.calcMaxTabs();
        this.tabTimeout = null;
    }

    /**
     * Sets up the CodeMirror Editor
     */
    initEditor() {
        // Mutable extensions
        this.outputEditorConf = {
            eol: new Compartment,
            lineWrapping: new Compartment,
            drawSelection: new Compartment
        };

        const initialState = EditorState.create({
            doc: null,
            extensions: [
                // Editor extensions
                EditorState.readOnly.of(true),
                highlightSpecialChars({
                    render: renderSpecialChar, // Custom character renderer to handle special cases
                    addSpecialChars: /[\ue000-\uf8ff]/g // Add the Unicode Private Use Area which we use for some whitespace chars
                }),
                rectangularSelection(),
                crosshairCursor(),
                bracketMatching(),
                highlightSelectionMatches(),
                search({top: true}),
                EditorState.allowMultipleSelections.of(true),

                // Custom extensions
                statusBar({
                    label: "Output",
                    timing: this.manager.timing,
                    tabNumGetter: function() {
                        return this.manager.tabs.getActiveTab("output");
                    }.bind(this),
                    eolHandler: this.eolChange.bind(this),
                    chrEncHandler: this.chrEncChange.bind(this),
                    chrEncGetter: this.getChrEnc.bind(this),
                    htmlOutput: this.htmlOutput
                }),
                htmlPlugin(this.htmlOutput),
                copyOverride(),

                // Mutable state
                this.outputEditorConf.lineWrapping.of(EditorView.lineWrapping),
                this.outputEditorConf.eol.of(EditorState.lineSeparator.of("\n")),
                this.outputEditorConf.drawSelection.of(drawSelection()),

                // Keymap
                keymap.of([
                    ...defaultKeymap,
                    ...searchKeymap
                ]),

                // Event listeners
                EditorView.updateListener.of(e => {
                    if (e.selectionSet)
                        this.manager.highlighter.selectionChange("output", e);
                    if (e.docChanged || this.docChanging) {
                        this.docChanging = false;
                        this.toggleLoader(false);
                    }
                })
            ]
        });

        this.outputEditorView = new EditorView({
            state: initialState,
            parent: this.outputTextEl
        });
    }

    /**
     * Handler for EOL change events
     * Sets the line separator
     * @param {string} eolVal
     */
    async eolChange(eolVal) {
        const currentTabNum = this.manager.tabs.getActiveTab("output");
        if (currentTabNum >= 0) {
            this.outputs[currentTabNum].eolSequence = eolVal;
        } else {
            throw new Error(`Cannot change output ${currentTabNum} EOL sequence to ${eolVal}`);
        }

        // Update the EOL value
        this.outputEditorView.dispatch({
            effects: this.outputEditorConf.eol.reconfigure(EditorState.lineSeparator.of(eolVal))
        });

        // Reset the output so that lines are recalculated, preserving the old EOL values
        await this.setOutput(this.currentOutputCache, true);
        // Update the URL manually since we aren't firing a statechange event
        this.app.updateURL(true);
    }

    /**
     * Getter for the output EOL sequence
     * Prefer reading value from `this.outputs` since the editor may not have updated yet.
     * @returns {string}
     */
    getEOLSeq() {
        const currentTabNum = this.manager.tabs.getActiveTab("output");
        if (currentTabNum < 0) {
            return this.outputEditorConf.state?.lineBreak || "\n";
        }
        return this.outputs[currentTabNum].eolSequence;
    }

    /**
     * Handler for Chr Enc change events
     * Sets the output character encoding
     * @param {number} chrEncVal
     */
    async chrEncChange(chrEncVal) {
        if (typeof chrEncVal !== "number") return;

        const currentTabNum = this.manager.tabs.getActiveTab("output");
        if (currentTabNum >= 0) {
            this.outputs[currentTabNum].encoding = chrEncVal;
        } else {
            throw new Error(`Cannot change output ${currentTabNum} chrEnc to ${chrEncVal}`);
        }

        // Reset the output, forcing it to re-decode the data with the new character encoding
        await this.setOutput(this.currentOutputCache, true);
        // Update the URL manually since we aren't firing a statechange event
        this.app.updateURL(true);
    }

    /**
     * Getter for the output character encoding
     * @returns {number}
     */
    getChrEnc() {
        const currentTabNum = this.manager.tabs.getActiveTab("output");
        if (currentTabNum < 0) {
            return 0;
        }
        return this.outputs[currentTabNum].encoding;
    }

    /**
     * Sets word wrap on the output editor
     * @param {boolean} wrap
     */
    setWordWrap(wrap) {
        this.outputEditorView.dispatch({
            effects: this.outputEditorConf.lineWrapping.reconfigure(
                wrap ? EditorView.lineWrapping : []
            )
        });
    }

    /**
     * Sets the value of the current output
     * @param {string|ArrayBuffer} data
     * @param {boolean} [force=false]
     */
    async setOutput(data, force=false) {
        // Don't do anything if the output hasn't changed
        if (!force && data === this.currentOutputCache) {
            this.manager.controls.hideStaleIndicator();
            this.toggleLoader(false);
            return;
        }

        this.currentOutputCache = data;
        this.toggleLoader(true);

        // Remove class to #output-text to change display settings
        this.outputTextEl.classList.remove("html-output");

        // If data is an ArrayBuffer, convert to a string in the correct character encoding
        const tabNum = this.manager.tabs.getActiveTab("output");
        this.manager.timing.recordTime("outputDecodingStart", tabNum);
        if (data instanceof ArrayBuffer) {
            data = await this.bufferToStr(data);
        }
        this.manager.timing.recordTime("outputDecodingEnd", tabNum);

        // Turn drawSelection back on
        this.outputEditorView.dispatch({
            effects: this.outputEditorConf.drawSelection.reconfigure(
                drawSelection()
            )
        });

        // Ensure we're not exceeding the maximum line length
        let wrap = this.app.options.wordWrap;
        const lineLengthThreshold = 131072; // 128KB
        if (data.length > lineLengthThreshold) {
            const lines = data.split(this.getEOLSeq());
            const longest = lines.reduce((a, b) =>
                a > b.length ? a : b.length, 0
            );
            if (longest > lineLengthThreshold) {
                // If we are exceeding the max line length, turn off word wrap
                wrap = false;
            }
        }

        // If turning word wrap off, do it before we populate the editor for performance reasons
        if (!wrap) this.setWordWrap(wrap);

        // We use setTimeout here to delay the editor dispatch until the next event cycle,
        // ensuring all async actions have completed before attempting to set the contents
        // of the editor. This is mainly with the above call to setWordWrap() in mind.
        setTimeout(() => {
            this.docChanging = true;
            // Insert data into editor, overwriting any previous contents
            this.outputEditorView.dispatch({
                changes: {
                    from: 0,
                    to: this.outputEditorView.state.doc.length,
                    insert: data
                }
            });

            // If turning word wrap on, do it after we populate the editor
            if (wrap)
                setTimeout(() => {
                    this.setWordWrap(wrap);
                });
        });
    }

    /**
     * Sets the value of the current output to a rendered HTML value
     * @param {string} html
     */
    async setHTMLOutput(html) {
        this.htmlOutput.html = html;
        this.htmlOutput.changed = true;
        // This clears the text output, but also fires a View update which
        // triggers the htmlWidget to render the HTML. We set the force flag
        // to ensure the loader gets removed and HTML is rendered.
        await this.setOutput("", true);

        // Turn off drawSelection
        this.outputEditorView.dispatch({
            effects: this.outputEditorConf.drawSelection.reconfigure([])
        });

        // Add class to #output-text to change display settings
        this.outputTextEl.classList.add("html-output");

        // Execute script sections
        const outputHTML = document.getElementById("output-html");
        const scriptElements = outputHTML ? outputHTML.querySelectorAll("script") : [];
        for (let i = 0; i < scriptElements.length; i++) {
            try {
                eval(scriptElements[i].innerHTML); // eslint-disable-line no-eval
            } catch (err) {
                log.error(err);
            }
        }
    }

    /**
     * Clears the HTML output
     */
    clearHTMLOutput() {
        this.htmlOutput.html = "";
        this.htmlOutput.changed = true;
        // Fire a blank change to force the htmlWidget to update and remove any HTML
        this.outputEditorView.dispatch({
            changes: {
                from: 0,
                insert: ""
            }
        });
    }

    /**
     * Calculates the maximum number of tabs to display
     */
    calcMaxTabs() {
        const numTabs = this.manager.tabs.calcMaxTabs();
        if (numTabs !== this.maxTabs) {
            this.maxTabs = numTabs;
            this.refreshTabs(this.manager.tabs.getActiveTab("output"), "right");
        }
    }

    /**
     * Gets the dish object for an output.
     *
     * @param inputNum - The inputNum of the output to get the dish of
     * @returns {Dish}
     */
    getOutputDish(inputNum) {
        if (this.outputExists(inputNum) &&
            this.outputs[inputNum].data &&
            this.outputs[inputNum].data.dish) {
            return this.outputs[inputNum].data.dish;
        }
        return null;
    }

    /**
     * Checks if an output exists in the output dictionary
     *
     * @param {number} inputNum - The number of the output we're looking for
     * @returns {boolean}
     */
    outputExists(inputNum) {
        if (this.outputs[inputNum] === undefined ||
            this.outputs[inputNum] === null) {
            return false;
        }
        return true;
    }

    /**
     * Adds a new output to the output array.
     * Creates a new tab if we have less than maxtabs tabs open
     *
     * @param {number} inputNum - The inputNum of the new output
     * @param {boolean} [changeTab=true] - If true, change to the new output
     */
    addOutput(inputNum, changeTab = true) {
        // Remove the output (will only get removed if it already exists)
        this.removeOutput(inputNum);

        const newOutput = {
            data: null,
            inputNum: inputNum,
            statusMessage: `Input ${inputNum} has not been baked yet.`,
            error: null,
            status: "inactive",
            bakeId: -1,
            progress: false,
            encoding: 0,
            eolSequence: "\u000a"
        };

        this.outputs[inputNum] = newOutput;

        this.addTab(inputNum, changeTab);
    }

    /**
     * Updates the value for the output in the output array.
     * If this is the active output tab, updates the output textarea
     *
     * @param {ArrayBuffer | String} data
     * @param {number} inputNum
     * @param {boolean} set
     */
    updateOutputValue(data, inputNum, set=true) {
        if (!this.outputExists(inputNum)) {
            this.addOutput(inputNum);
        }

        if (Object.prototype.hasOwnProperty.call(data, "dish")) {
            data.dish = new Dish(data.dish);
        }

        this.outputs[inputNum].data = data;

        const tabItem = this.manager.tabs.getTabItem(inputNum, "output");
        if (tabItem) tabItem.style.background = "";

        if (set) this.set(inputNum);
    }

    /**
     * Updates the status message for the output in the output array.
     * If this is the active output tab, updates the output textarea
     *
     * @param {string} statusMessage
     * @param {number} inputNum
     * @param {boolean} [set=true]
     */
    updateOutputMessage(statusMessage, inputNum, set=true) {
        if (!this.outputExists(inputNum)) return;
        this.outputs[inputNum].statusMessage = statusMessage;
        if (set) this.set(inputNum);
    }

    /**
     * Updates the error value for the output in the output array.
     * If this is the active output tab, calls app.handleError.
     * Otherwise, the error will be handled when the output is switched to
     *
     * @param {Error} error
     * @param {number} inputNum
     * @param {number} [progress=0]
     */
    updateOutputError(error, inputNum, progress=0) {
        if (!this.outputExists(inputNum)) return;

        const errorString = error.displayStr || error.toString();

        this.outputs[inputNum].error = errorString;
        this.outputs[inputNum].progress = progress;
        this.updateOutputStatus("error", inputNum);
    }

    /**
     * Updates the status value for the output in the output array
     *
     * @param {string} status
     * @param {number} inputNum
     */
    updateOutputStatus(status, inputNum) {
        if (!this.outputExists(inputNum)) return;
        this.outputs[inputNum].status = status;

        if (status !== "error") {
            delete this.outputs[inputNum].error;
        }

        this.displayTabInfo(inputNum);
        this.set(inputNum);
    }

    /**
     * Updates the stored bake ID for the output in the output array
     *
     * @param {number} bakeId
     * @param {number} inputNum
     */
    updateOutputBakeId(bakeId, inputNum) {
        if (!this.outputExists(inputNum)) return;
        this.outputs[inputNum].bakeId = bakeId;
    }

    /**
     * Updates the stored progress value for the output in the output array
     *
     * @param {number} progress
     * @param {number} total
     * @param {number} inputNum
     */
    updateOutputProgress(progress, total, inputNum) {
        if (!this.outputExists(inputNum)) return;
        this.outputs[inputNum].progress = progress;

        if (progress !== false) {
            this.manager.tabs.updateTabProgress(inputNum, progress, total, "output");
        }

    }

    /**
     * Removes an output from the output array.
     *
     * @param {number} inputNum
     */
    removeOutput(inputNum) {
        if (!this.outputExists(inputNum)) return;

        delete this.outputs[inputNum];
    }

    /**
     * Removes all output tabs
     */
    removeAllOutputs() {
        this.outputs = {};

        const tabsList = document.getElementById("output-tabs");
        const tabsListChildren = tabsList.children;

        tabsList.classList.remove("tabs-left");
        tabsList.classList.remove("tabs-right");
        for (let i = tabsListChildren.length - 1; i >= 0; i--) {
            tabsListChildren.item(i).remove();
        }
    }

    /**
     * Sets the output in the output pane.
     *
     * @param {number} inputNum
     */
    async set(inputNum) {
        inputNum = parseInt(inputNum, 10);
        if (inputNum !== this.manager.tabs.getActiveTab("output") ||
            !this.outputExists(inputNum)) return;
        this.toggleLoader(true);

        return new Promise(async function(resolve, reject) {
            const output = this.outputs[inputNum];
            this.manager.timing.recordTime("settingOutput", inputNum);

            // Update the EOL value
            this.outputEditorView.dispatch({
                effects: this.outputEditorConf.eol.reconfigure(
                    EditorState.lineSeparator.of(output.eolSequence)
                )
            });

            // If pending or baking, show loader and status message
            // If error, style the tab and handle the error
            // If done, display the output if it's the active tab
            // If inactive, show the last bake value (or blank)
            if (output.status === "inactive" ||
                output.status === "stale" ||
                (output.status === "baked" && output.bakeId < this.manager.worker.bakeId)) {
                this.manager.controls.showStaleIndicator();
            } else {
                this.manager.controls.hideStaleIndicator();
            }

            if (output.progress !== undefined && !this.app.baking) {
                this.manager.recipe.updateBreakpointIndicator(output.progress);
            } else {
                this.manager.recipe.updateBreakpointIndicator(false);
            }

            if (output.status === "pending" || output.status === "baking") {
                // show the loader and the status message if it's being shown
                // otherwise don't do anything
                document.querySelector("#output-loader .loading-msg").textContent = output.statusMessage;
            } else if (output.status === "error") {
                this.clearHTMLOutput();

                if (output.error) {
                    await this.setOutput(output.error);
                } else {
                    await this.setOutput(output.data.result);
                }
            } else if (output.status === "baked" || output.status === "inactive") {
                document.querySelector("#output-loader .loading-msg").textContent = `Loading output ${inputNum}`;

                if (output.data === null) {
                    this.clearHTMLOutput();
                    await this.setOutput("");
                    return;
                }

                switch (output.data.type) {
                    case "html":
                        await this.setHTMLOutput(output.data.result);
                        break;
                    case "ArrayBuffer":
                    case "string":
                    default:
                        this.clearHTMLOutput();
                        await this.setOutput(output.data.result);
                        break;
                }
                this.manager.timing.recordTime("complete", inputNum);

                // Trigger an update so that the status bar recalculates timings
                this.outputEditorView.dispatch({
                    changes: {
                        from: 0,
                        to: 0
                    }
                });

                debounce(this.backgroundMagic, 50, "backgroundMagic", this, [])();
            }
        }.bind(this));
    }

    /**
     * Retrieves the dish as a string
     *
     * @param {Dish} dish
     * @returns {string}
     */
    async getDishStr(dish) {
        return await new Promise(resolve => {
            this.manager.worker.getDishAs(dish, "string", r => {
                resolve(r.value);
            });
        });
    }

    /**
     * Retrieves the dish as an ArrayBuffer
     *
     * @param {Dish} dish
     * @returns {ArrayBuffer}
     */
    async getDishBuffer(dish) {
        return await new Promise(resolve => {
            this.manager.worker.getDishAs(dish, "ArrayBuffer", r => {
                resolve(r.value);
            });
        });
    }

    /**
     * Retrieves the title of the Dish as a string
     *
     * @param {Dish} dish
     * @param {number} maxLength
     * @returns {string}
     */
    async getDishTitle(dish, maxLength) {
        return await new Promise(resolve => {
            this.manager.worker.getDishTitle(dish, maxLength, r => {
                resolve(r.value);
            });
        });
    }

    /**
     * Asks a worker to translate an ArrayBuffer into a certain character encoding
     *
     * @param {ArrrayBuffer} buffer
     * @returns {string}
     */
    async bufferToStr(buffer) {
        const encoding = this.getChrEnc();

        if (buffer.byteLength === 0) return "";
        return await new Promise(resolve => {
            this.manager.worker.bufferToStr(buffer, encoding, r => {
                resolve(r.value);
            });
        });
    }

    /**
     * Save bombe object then remove it from the DOM so that it does not cause performance issues.
     */
    saveBombe() {
        this.bombeEl = document.getElementById("bombe");
        this.bombeEl.parentNode.removeChild(this.bombeEl);
    }

    /**
     * Shows or hides the output loading screen.
     * The animated Bombe SVG, whilst quite aesthetically pleasing, is reasonably CPU
     * intensive, so we remove it from the DOM when not in use. We only show it if the
     * recipe is taking longer than 200ms. We add it to the DOM just before that so that
     * it is ready to fade in without stuttering.
     *
     * @param {boolean} value - If true, show the loader
     */
    toggleLoader(value) {
        const outputLoader = document.getElementById("output-loader"),
            animation = document.getElementById("output-loader-animation");

        if (value) {
            this.manager.controls.hideStaleIndicator();
            // Don't add the bombe if it's already there or scheduled to be loaded
            if (animation.children.length === 0 && !this.appendBombeTimeout) {
                // Start a timer to add the Bombe to the DOM just before we make it
                // visible so that there is no stuttering
                this.appendBombeTimeout = setTimeout(function() {
                    this.appendBombeTimeout = null;
                    animation.appendChild(this.bombeEl);
                }.bind(this), 150);
            }

            if (outputLoader.style.visibility !== "visible" && !this.outputLoaderTimeout) {
                // Show the loading screen
                this.outputLoaderTimeout = setTimeout(function() {
                    this.outputLoaderTimeout = null;
                    outputLoader.style.visibility = "visible";
                    outputLoader.style.opacity = 1;
                }, 200);
            }
        } else if (outputLoader.style.visibility !== "hidden" || this.appendBombeTimeout || this.outputLoaderTimeout) {
            clearTimeout(this.appendBombeTimeout);
            clearTimeout(this.outputLoaderTimeout);
            this.appendBombeTimeout = null;
            this.outputLoaderTimeout = null;

            // Remove the Bombe from the DOM to save resources
            this.outputLoaderTimeout = setTimeout(function () {
                this.outputLoaderTimeout = null;
                if (animation.children.length > 0)
                    animation.removeChild(this.bombeEl);
            }.bind(this), 500);
            outputLoader.style.opacity = 0;
            outputLoader.style.visibility = "hidden";
        }
    }

    /**
     * Handler for save click events.
     * Saves the current output to a file.
     */
    saveClick() {
        this.downloadFile();
    }

    /**
     * Handler for file download events.
     */
    async downloadFile() {
        const dish = this.getOutputDish(this.manager.tabs.getActiveTab("output"));
        if (dish === null) {
            this.app.alert("Could not find any output data to download. Has this output been baked?", 3000);
            return;
        }

        const data = await dish.get(Dish.ARRAY_BUFFER);
        let ext = ".dat";

        // Detect file type automatically
        const types = detectFileType(data);
        if (types.length) {
            ext = `.${types[0].extension.split(",", 1)[0]}`;
        }

        const fileName = window.prompt("Please enter a filename: ", `download${ext}`);

        // Assume if the user clicks cancel they don't want to download
        if (fileName === null) return;

        const file = new File([data], fileName);
        FileSaver.saveAs(file, fileName, {autoBom: false});
    }

    /**
     * Handler for save all click event
     * Saves all outputs to a single archive file
     */
    async saveAllClick() {
        const downloadButton = document.getElementById("save-all-to-file");
        if (downloadButton.firstElementChild.innerHTML === "archive") {
            this.downloadAllFiles();
        } else {
            const cancel = await new Promise(function(resolve, reject) {
                this.app.confirm(
                    "Cancel zipping?",
                    "The outputs are currently being zipped for download.<br>Cancel zipping?",
                    "Continue zipping",
                    "Cancel zipping",
                    resolve, this);
            }.bind(this));
            if (!cancel) {
                this.terminateZipWorker();
            }
        }
    }

    /**
     * Spawns a new ZipWorker and sends it the outputs so that they can
     * be zipped for download
     */
    async downloadAllFiles() {
        const inputNums = Object.keys(this.outputs);
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = inputNums[i];
            if (this.outputs[iNum].status !== "baked" ||
            this.outputs[iNum].bakeId !== this.manager.worker.bakeId) {
                const continueDownloading = await new Promise(function(resolve, reject) {
                    this.app.confirm(
                        "Incomplete outputs",
                        "Not all outputs have been baked yet. Continue downloading outputs?",
                        "Download", "Cancel", resolve, this);
                }.bind(this));
                if (continueDownloading) {
                    break;
                } else {
                    return;
                }
            }
        }

        let fileName = window.prompt("Please enter a filename: ", "download.zip");

        if (fileName === null || fileName === "") {
            // Don't zip the files if there isn't a filename
            this.app.alert("No filename was specified.", 3000);
            return;
        }

        if (!fileName.match(/.zip$/)) {
            fileName += ".zip";
        }

        let fileExt = window.prompt("Please enter a file extension for the files, or leave blank to detect automatically.", "");

        if (fileExt === null) fileExt = "";

        if (this.zipWorker !== null) {
            this.terminateZipWorker();
        }

        const downloadButton = document.getElementById("save-all-to-file");

        downloadButton.classList.add("spin");
        downloadButton.title = `Zipping ${inputNums.length} files...`;
        downloadButton.setAttribute("data-original-title", `Zipping ${inputNums.length} files...`);

        downloadButton.firstElementChild.innerHTML = "autorenew";

        log.debug("Creating ZipWorker");
        this.zipWorker = new ZipWorker();
        this.zipWorker.postMessage({
            action: "setLogLevel",
            data: log.getLevel()
        });
        this.zipWorker.postMessage({
            action: "zipFiles",
            data: {
                outputs: this.outputs,
                filename: fileName,
                fileExtension: fileExt
            }
        });
        this.zipWorker.addEventListener("message", this.handleZipWorkerMessage.bind(this));
    }

    /**
     * Terminate the ZipWorker
     */
    terminateZipWorker() {
        if (this.zipWorker === null) return; // Already terminated

        log.debug("Terminating ZipWorker.");

        this.zipWorker.terminate();
        this.zipWorker = null;

        const downloadButton = document.getElementById("save-all-to-file");
        downloadButton.classList.remove("spin");
        downloadButton.title = "Save all outputs to a zip file";
        downloadButton.setAttribute("data-original-title", "Save all outputs to a zip file");
        downloadButton.firstElementChild.innerHTML = "archive";
    }

    /**
     * Handle messages sent back by the ZipWorker
     */
    handleZipWorkerMessage(e) {
        const r = e.data;
        if (!("zippedFile" in r)) {
            log.error("No zipped file was sent in the message.");
            this.terminateZipWorker();
            return;
        }
        if (!("filename" in r)) {
            log.error("No filename was sent in the message.");
            this.terminateZipWorker();
            return;
        }

        const file = new File([r.zippedFile], r.filename);
        FileSaver.saveAs(file, r.filename, {autoBom: false});

        this.terminateZipWorker();
    }

    /**
     * Adds a new output tab.
     *
     * @param {number} inputNum
     * @param {boolean} [changeTab=true]
     */
    addTab(inputNum, changeTab = true) {
        const tabsWrapper = document.getElementById("output-tabs");
        const numTabs = tabsWrapper.children.length;

        if (!this.manager.tabs.getTabItem(inputNum, "output") && numTabs < this.maxTabs) {
            // Create a new tab element
            const newTab = this.manager.tabs.createTabElement(inputNum, changeTab, "output");
            tabsWrapper.appendChild(newTab);
        } else if (numTabs === this.maxTabs) {
            // Can't create a new tab
            document.getElementById("output-tabs").lastElementChild.classList.add("tabs-right");
        }

        this.displayTabInfo(inputNum);

        if (changeTab) {
            this.changeTab(inputNum, false);
        }
    }

    /**
     * Changes the active tab
     *
     * @param {number} inputNum
     * @param {boolean} [changeInput = false]
     */
    changeTab(inputNum, changeInput = false) {
        if (!this.outputExists(inputNum)) return;
        const currentNum = this.manager.tabs.getActiveTab("output");

        this.hideMagicButton();

        if (!this.manager.tabs.changeTab(inputNum, "output")) {
            let direction = "right";
            if (currentNum > inputNum) {
                direction = "left";
            }
            const newOutputs = this.getNearbyNums(inputNum, direction);

            const tabsLeft = (newOutputs[0] !== this.getSmallestInputNum());
            const tabsRight = (newOutputs[newOutputs.length - 1] !== this.getLargestInputNum());

            this.manager.tabs.refreshTabs(newOutputs, inputNum, tabsLeft, tabsRight, "output");

            for (let i = 0; i < newOutputs.length; i++) {
                this.displayTabInfo(newOutputs[i]);
            }
        }

        this.set(inputNum);

        if (changeInput) {
            this.manager.input.changeTab(inputNum, false);
        }
    }

    /**
     * Handler for changing tabs event
     *
     * @param {event} mouseEvent
     */
    changeTabClick(mouseEvent) {
        if (!mouseEvent.target) return;

        const tabNum = mouseEvent.target.parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.changeTab(parseInt(tabNum, 10), this.app.options.syncTabs);
        }
    }

    /**
     * Handler for scrolling on the output tabs area
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
     * Handler for changing to the left tab
     */
    changeTabLeft() {
        const currentTab = this.manager.tabs.getActiveTab("output");
        this.changeTab(this.getPreviousInputNum(currentTab), this.app.options.syncTabs);
    }

    /**
     * Handler for changing to the right tab
     */
    changeTabRight() {
        const currentTab = this.manager.tabs.getActiveTab("output");
        this.changeTab(this.getNextInputNum(currentTab), this.app.options.syncTabs);
    }

    /**
     * Handler for go to tab button clicked
     */
    goToTab() {
        const min = this.getSmallestInputNum(),
            max = this.getLargestInputNum();

        let tabNum = window.prompt(`Enter tab number (${min} - ${max}):`, this.manager.tabs.getActiveTab("output").toString());
        if (tabNum === null) return;
        tabNum = parseInt(tabNum, 10);

        if (this.outputExists(tabNum)) {
            this.changeTab(tabNum, this.app.options.syncTabs);
        }
    }

    /**
     * Generates a list of the nearby inputNums
     * @param inputNum
     * @param direction
     */
    getNearbyNums(inputNum, direction) {
        const nums = [];
        for (let i = 0; i < this.maxTabs; i++) {
            let newNum;
            if (i === 0 && this.outputs[inputNum] !== undefined) {
                newNum = inputNum;
            } else {
                switch (direction) {
                    case "left":
                        newNum = this.getNextInputNum(nums[i - 1]);
                        if (newNum === nums[i - 1]) {
                            direction = "right";
                            newNum = this.getPreviousInputNum(nums[0]);
                        }
                        break;
                    case "right":
                        newNum = this.getPreviousInputNum(nums[i - 1]);
                        if (newNum === nums[i - 1]) {
                            direction = "left";
                            newNum = this.getNextInputNum(nums[0]);
                        }
                }
            }
            if (!nums.includes(newNum) && (newNum > 0)) {
                nums.push(newNum);
            }
        }
        nums.sort((a, b) => a - b); // Forces the sort function to treat a and b as numbers
        return nums;
    }

    /**
     * Gets the largest inputNum
     *
     * @returns {number}
     */
    getLargestInputNum() {
        const inputNums = Object.keys(this.outputs);
        if (inputNums.length === 0) return -1;
        return Math.max(...inputNums);
    }

    /**
     * Gets the smallest inputNum
     *
     * @returns {number}
     */
    getSmallestInputNum() {
        const inputNums = Object.keys(this.outputs);
        if (inputNums.length === 0) return -1;
        return Math.min(...inputNums);
    }

    /**
     * Gets the previous inputNum
     *
     * @param {number} inputNum - The current input number
     * @returns {number}
     */
    getPreviousInputNum(inputNum) {
        const inputNums = Object.keys(this.outputs);
        if (inputNums.length === 0) return -1;
        let num = Math.min(...inputNums);
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = parseInt(inputNums[i], 10);
            if (iNum < inputNum) {
                if (iNum > num) {
                    num = iNum;
                }
            }
        }
        return num;
    }

    /**
     * Gets the next inputNum
     *
     * @param {number} inputNum - The current input number
     * @returns {number}
     */
    getNextInputNum(inputNum) {
        const inputNums = Object.keys(this.outputs);
        if (inputNums.length === 0) return -1;
        let num = Math.max(...inputNums);
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = parseInt(inputNums[i], 10);
            if (iNum > inputNum) {
                if (iNum < num) {
                    num = iNum;
                }
            }
        }
        return num;
    }

    /**
     * Removes a tab and it's corresponding output
     *
     * @param {number} inputNum
     */
    removeTab(inputNum) {
        if (!this.outputExists(inputNum)) return;

        const tabElement = this.manager.tabs.getTabItem(inputNum, "output");

        this.removeOutput(inputNum);

        if (tabElement !== null) {
            this.refreshTabs(this.getPreviousInputNum(inputNum), "left");
        }
    }

    /**
     * Redraw the entire tab bar to remove any outdated tabs
     *
     * @param {number} activeTab
     * @param {string} direction - Either "left" or "right"
     */
    refreshTabs(activeTab, direction) {
        const newNums = this.getNearbyNums(activeTab, direction),
            tabsLeft = (newNums[0] !== this.getSmallestInputNum() && newNums.length > 0),
            tabsRight = (newNums[newNums.length - 1] !== this.getLargestInputNum() && newNums.length > 0);

        this.manager.tabs.refreshTabs(newNums, activeTab, tabsLeft, tabsRight, "output");

        for (let i = 0; i < newNums.length; i++) {
            this.displayTabInfo(newNums[i]);
        }
    }

    /**
     * Display output information in the tab header
     *
     * @param {number} inputNum
     */
    async displayTabInfo(inputNum) {
        // Don't display anything if there are no, or only one, tabs
        if (!this.outputExists(inputNum) || Object.keys(this.outputs).length <= 1) return;

        const dish = this.getOutputDish(inputNum);
        let tabStr = "";

        if (dish !== null) {
            tabStr = await this.getDishTitle(this.getOutputDish(inputNum), 100);
            tabStr = tabStr.replace(/[\n\r]/g, "");
        }
        this.manager.tabs.updateTabHeader(inputNum, tabStr, "output");
        if (this.manager.worker.recipeConfig !== undefined) {
            this.manager.tabs.updateTabProgress(inputNum, this.outputs[inputNum]?.progress, this.manager.worker.recipeConfig.length, "output");
        }

        const tabItem = this.manager.tabs.getTabItem(inputNum, "output");
        if (tabItem) {
            if (this.outputs[inputNum].status === "error") {
                tabItem.style.color = "#FF0000";
            } else {
                tabItem.style.color = "";
            }
        }
    }

    /**
     * Triggers the BackgroundWorker to attempt Magic on the current output.
     */
    async backgroundMagic() {
        this.hideMagicButton();
        const dish = this.getOutputDish(this.manager.tabs.getActiveTab("output"));
        if (!this.app.options.autoMagic || dish === null) return;
        const buffer = await this.getDishBuffer(dish);
        const sample = buffer.slice(0, 1000) || "";

        if (sample.length || sample.byteLength) {
            this.manager.background.magic(sample);
        }
    }

    /**
     * Handles the results of a background Magic call.
     *
     * @param {Object[]} options
     */
    backgroundMagicResult(options) {
        if (!options.length) return;

        const currentRecipeConfig = this.app.getRecipeConfig();
        let msg = "",
            newRecipeConfig;

        if (options[0].recipe.length) {
            const opSequence = options[0].recipe.map(o => o.op).join(", ");
            newRecipeConfig = currentRecipeConfig.concat(options[0].recipe);
            msg = `<i>${opSequence}</i> will produce <span class="data-text">"${Utils.escapeHtml(Utils.truncate(options[0].data), 30)}"</span>`;
        } else if (options[0].fileType && options[0].fileType.name) {
            const ft = options[0].fileType;
            newRecipeConfig = currentRecipeConfig.concat([{op: "Detect File Type", args: []}]);
            msg = `<i>${ft.name}</i> file detected`;
        } else {
            return;
        }

        this.showMagicButton(msg, newRecipeConfig);
    }

    /**
     * Handler for Magic click events.
     *
     * Loads the Magic recipe.
     *
     * @fires Manager#statechange
     */
    magicClick() {
        const magicButton = document.getElementById("magic");
        this.app.setRecipeConfig(JSON.parse(magicButton.getAttribute("data-recipe")));
        window.dispatchEvent(this.manager.statechange);
        this.hideMagicButton();
    }

    /**
     * Displays the Magic button with a title and adds a link to a recipe.
     *
     * @param {string} msg
     * @param {Object[]} recipeConfig
     */
    showMagicButton(msg, recipeConfig) {
        const magicButton = document.getElementById("magic");
        magicButton.setAttribute("data-original-title", msg);
        magicButton.setAttribute("data-recipe", JSON.stringify(recipeConfig), null, "");
        magicButton.classList.remove("hidden");
        magicButton.classList.add("pulse");
    }


    /**
     * Hides the Magic button and resets its values.
     */
    hideMagicButton() {
        const magicButton = document.getElementById("magic");
        magicButton.classList.add("hidden");
        magicButton.classList.remove("pulse");
        magicButton.setAttribute("data-recipe", "");
        magicButton.setAttribute("data-original-title", "Magic!");
    }

    /**
     * Handler for extract file events.
     *
     * @param {Event} e
     */
    async extractFileClick(e) {
        e.preventDefault();
        e.stopPropagation();

        const el = e.target.nodeName === "I" ? e.target.parentNode : e.target;
        const blobURL = el.getAttribute("blob-url");
        const fileName = el.getAttribute("file-name");

        const blob = await fetch(blobURL).then(r => r.blob());
        this.manager.input.loadUIFiles([new File([blob], fileName, {type: blob.type})]);
    }


    /**
     * Handler for copy click events.
     * Copies the output to the clipboard
     */
    async copyClick() {
        const dish = this.getOutputDish(this.manager.tabs.getActiveTab("output"));
        if (dish === null) {
            this.app.alert("Could not find data to copy. Has this output been baked yet?", 3000);
            return;
        }

        const output = await this.getDishStr(dish);
        const self = this;

        navigator.clipboard.writeText(output).then(function() {
            self.app.alert("Copied raw output successfully.", 2000);
        }, function(err) {
            self.app.alert("Sorry, the output could not be copied.", 3000);
        });
    }

    /**
     * Handler for switch click events.
     * Moves the current output into the input textarea.
     */
    async switchClick() {
        const activeTab = this.manager.tabs.getActiveTab("output");
        const switchButton = document.getElementById("switch");

        switchButton.classList.add("spin");
        switchButton.disabled = true;
        switchButton.firstElementChild.innerHTML = "autorenew";
        $(switchButton).tooltip("hide");

        const activeData = await this.getDishBuffer(this.getOutputDish(activeTab));

        if (this.outputExists(activeTab)) {
            this.manager.input.set(activeTab, {
                type: "userinput",
                buffer: activeData,
                encoding: this.outputs[activeTab].encoding,
                eolSequence: this.outputs[activeTab].eolSequence
            });
        }

        switchButton.classList.remove("spin");
        switchButton.disabled = false;
        switchButton.firstElementChild.innerHTML = "open_in_browser";
    }

    /**
     * Handler for maximise output click events.
     * Resizes the output frame to be as large as possible, or restores it to its original size.
     */
    maximiseOutputClick(e) {
        const el = e.target.id === "maximise-output" ? e.target : e.target.parentNode;

        if (el.getAttribute("data-original-title").indexOf("Maximise") === 0) {
            document.body.classList.add("output-maximised");
            this.app.initialiseSplitter(true);
            this.app.columnSplitter.collapse(0);
            this.app.columnSplitter.collapse(1);
            this.app.ioSplitter.collapse(0);

            $(el).attr("data-original-title", "Restore output pane");
            el.querySelector("i").innerHTML = "fullscreen_exit";
        } else {
            document.body.classList.remove("output-maximised");
            $(el).attr("data-original-title", "Maximise output pane");
            el.querySelector("i").innerHTML = "fullscreen";
            this.app.initialiseSplitter(false);
            this.app.resetLayout();
        }
    }

    /**
     * Handler for find tab button clicked
     */
    findTab() {
        this.filterTabSearch();
        $("#output-tab-modal").modal();
    }

    /**
     * Searches the outputs using the filter settings and displays the results
     */
    async filterTabSearch() {
        const showPending = document.getElementById("output-show-pending").checked,
            showBaking = document.getElementById("output-show-baking").checked,
            showBaked = document.getElementById("output-show-baked").checked,
            showStale = document.getElementById("output-show-stale").checked,
            showErrored = document.getElementById("output-show-errored").checked,
            contentFilter = document.getElementById("output-content-filter").value,
            resultsList = document.getElementById("output-search-results"),
            numResults = parseInt(document.getElementById("output-num-results").value, 10),
            inputNums = Object.keys(this.outputs),
            results = [];

        let contentFilterExp;
        try {
            contentFilterExp = new RegExp(contentFilter, "i");
        } catch (error) {
            this.app.handleError(error);
            return;
        }

        // Search through the outputs for matching output results
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = inputNums[i],
                output = this.outputs[iNum];

            if (output.status === "pending" && showPending ||
                output.status === "baking" && showBaking ||
                output.status === "error" && showErrored ||
                output.status === "stale" && showStale ||
                output.status === "inactive" && showStale) {
                const outDisplay = {
                    "pending": "Not baked yet",
                    "baking": "Baking",
                    "error": output.error || "Errored",
                    "stale": "Stale (output is out of date)",
                    "inactive": "Not baked yet"
                };

                // If the output has a dish object, check it against the filter
                if (Object.prototype.hasOwnProperty.call(output, "data") &&
                    output.data &&
                    Object.prototype.hasOwnProperty.call(output.data, "dish")) {
                    const data = await output.data.dish.get(Dish.STRING);
                    if (contentFilterExp.test(data)) {
                        results.push({
                            inputNum: iNum,
                            textDisplay: data.slice(0, 100)
                        });
                    }
                } else {
                    results.push({
                        inputNum: iNum,
                        textDisplay: outDisplay[output.status]
                    });
                }
            } else if (output.status === "baked" && showBaked && output.progress === false) {
                let data = await output.data.dish.get(Dish.STRING);
                data = data.replace(/[\r\n]/g, "");
                if (contentFilterExp.test(data)) {
                    results.push({
                        inputNum: iNum,
                        textDisplay: data.slice(0, 100)
                    });
                }
            } else if (output.progress !== false && showErrored) {
                let data = await output.data.dish.get(Dish.STRING);
                data = data.replace(/[\r\n]/g, "");
                if (contentFilterExp.test(data)) {
                    results.push({
                        inputNum: iNum,
                        textDisplay: data.slice(0, 100)
                    });
                }
            }

            if (results.length >= numResults) {
                break;
            }
        }

        for (let i = resultsList.children.length - 1; i >= 0; i--) {
            resultsList.children.item(i).remove();
        }

        for (let i = 0; i < results.length; i++) {
            const newListItem = document.createElement("li");
            newListItem.classList.add("output-filter-result");
            newListItem.setAttribute("inputNum", results[i].inputNum);
            newListItem.innerText = `${results[i].inputNum}: ${results[i].textDisplay}`;

            resultsList.appendChild(newListItem);
        }
    }

    /**
     * Handler for clicking on a filter result.
     * Changes to the clicked output
     *
     * @param {event} e
     */
    filterItemClick(e) {
        if (!e.target) return;
        const inputNum = parseInt(e.target.getAttribute("inputNum"), 10);
        if (inputNum <= 0) return;

        $("#output-tab-modal").modal("hide");
        this.changeTab(inputNum, this.app.options.syncTabs);
    }


    /**
     * Sets the console log level in the workers.
     */
    setLogLevel() {
        if (!this.zipWorker) return;
        this.zipWorker.postMessage({
            action: "setLogLevel",
            data: log.getLevel()
        });
    }
}

export default OutputWaiter;
