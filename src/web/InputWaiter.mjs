/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import LoaderWorker from "worker-loader?inline&fallback=false!./LoaderWorker";
import InputWorker from "worker-loader?inline&fallback=false!./InputWorker";
import Utils from "../core/Utils";
import { toBase64 } from "../core/lib/Base64";
import { isImage } from "../core/lib/FileType";


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

        // Define keys that don't change the input so we don't have to autobake when they are pressed
        this.badKeys = [
            16, //Shift
            17, //Ctrl
            18, //Alt
            19, //Pause
            20, //Caps
            27, //Esc
            33, 34, 35, 36, //PgUp, PgDn, End, Home
            37, 38, 39, 40, //Directional
            44, //PrntScrn
            91, 92, //Win
            93, //Context
            112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, //F1-12
            144, //Num
            145, //Scroll
        ];

        this.inputWorker = null;
        this.loaderWorkers = [];
        this.workerId = 0;
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.maxTabs = 4;
    }

    /**
     * Calculates the maximum number of tabs to display
     */
    calcMaxTabs() {
        const numTabs = Math.floor((document.getElementById("IO").offsetWidth - 75)  / 120);
        this.maxTabs = (numTabs > 1) ? numTabs : 2;
        if (this.inputWorker) {
            this.inputWorker.postMessage({
                action: "updateMaxTabs",
                data: this.maxTabs
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
            data: this.maxTabs
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
     * @returns {number} The index of the created worker
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
     * @param {Object} workerObj
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
     * @param {number} id
     */
    getLoaderWorker(id) {
        const idx = this.getLoaderWorkerIndex(id);
        if (idx === -1) return;
        return this.loaderWorkers[idx];
    }

    /**
     * Gets the index for the loaderWorker of a given id
     *
     * @param {number} id
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
     * @param {object} inputData
     * @param {File} inputData.file
     * @param {number} inputData.inputNum
     * @param {number} inputData.workerId
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
     *
     * @param {MessageEvent} e
     */
    handleLoaderMessage(e) {
        const r = e.data;

        if (r.hasOwnProperty("fileBuffer")) {
            this.inputWorker.postMessage({
                action: "loaderWorkerMessage",
                data: r
            }, [r.fileBuffer]);
        } else {
            this.inputWorker.postMessage({
                action: "loaderWorkerMessage",
                data: r
            });
        }
    }


    /**
     * Handler for messages sent back by the inputWorker
     *
     * @param {MessageEvent} e
     */
    handleInputWorkerMessage(e) {
        const r = e.data;

        if (!r.hasOwnProperty("action")) {
            log.error("No action");
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
                this.refreshTabs(r.data.nums, r.data.activeTab);
                break;
            case "changeTab":
                this.changeTab(r.data, this.app.options.syncTabs);
                break;
            case "updateTabHeader":
                this.updateTabHeader(r.data);
                break;
            case "updateFileProgress":
                this.updateFileProgress(r.data.inputNum, r.data.progress);
                break;
            case "loadingInfo":
                this.showLoadingInfo(r.data, true);
                break;
            case "setInput":
                this.set(r.data.inputObj, r.data.silent);
                break;
            case "inputAdded":
                this.inputAdded(r.data.changeTab, r.data.inputNum);
                break;
            case "addInputs":
                this.addInputs(r.data);
                break;
            case "queueInput":
                this.manager.worker.queueInput(r.data);
                break;
            case "bake":
                this.app.bake(false);
                break;
            case "displayTabSearchResults":
                this.displayTabSearchResults(r.data);
                break;
            case "setUrl":
                this.setUrl(r.data);
                break;
            case "inputSwitch":
                this.manager.output.inputSwitch(r.data);
                break;
            default:
                log.error(`Unknown action ${r.action}.`);
        }
    }

    /**
     * Gets the input for all tabs
     */
    getAll() {
        this.manager.controls.toggleBakeButtonFunction(false, true);
        this.inputWorker.postMessage({
            action: "getAll"
        });
    }

    /**
     * Sets the input in the input area
     *
     * @param {object} inputData
     * @param {number} inputData.inputNum
     * @param {string | object} inputData.input
     * @param {string} inputData.name
     * @param {string} inputData.size
     * @param {string} inputData.type
     * @param {number} inputData.progress
     * @param {boolean} [silent=false]
     */
    async set(inputData, silent=false) {
        return new Promise(function(resolve, reject) {
            const activeTab = this.getActiveTab();
            if (inputData.inputNum !== activeTab) return;

            const inputText = document.getElementById("input-text");

            if (typeof inputData.input === "string") {
                inputText.value = inputData.input;
                // close file
                const fileOverlay = document.getElementById("input-file"),
                    fileName = document.getElementById("input-file-name"),
                    fileSize = document.getElementById("input-file-size"),
                    fileType = document.getElementById("input-file-type"),
                    fileLoaded = document.getElementById("input-file-loaded");

                fileOverlay.style.display = "none";
                fileName.textContent = "";
                fileSize.textContent = "";
                fileType.textContent = "";
                fileLoaded.textContent = "";

                inputText.style.overflow = "auto";
                inputText.classList.remove("blur");

                const lines = inputData.input.length < (this.app.options.ioDisplayThreshold * 1024) ?
                    inputData.input.count("\n") + 1 : null;
                this.setInputInfo(inputData.input.length, lines);
            } else {
                this.setFile(inputData);
            }

            if (!silent) window.dispatchEvent(this.manager.statechange);
        }.bind(this));
    }

    /**
     * Shows file details
     *
     * @param inputData
     */
    setFile(inputData) {
        const activeTab = this.getActiveTab();
        if (inputData.inputNum !== activeTab) return;

        const fileOverlay = document.getElementById("input-file"),
            fileName = document.getElementById("input-file-name"),
            fileSize = document.getElementById("input-file-size"),
            fileType = document.getElementById("input-file-type"),
            fileLoaded = document.getElementById("input-file-loaded");

        fileOverlay.style.display = "block";
        fileName.textContent = inputData.name;
        fileSize.textContent = inputData.size + " bytes";
        fileType.textContent = inputData.type;
        fileLoaded.textContent = inputData.progress + "%";

        this.displayFilePreview(inputData);
    }


    /**
     * Reset the input thumbnail to the default icon
     */
    resetFileThumb() {
        const fileThumb = document.getElementById("input-file-thumbnail");
        fileThumb.src = require("./static/images/file-128x128.png");
    }

    /**
     * Shows a chunk of the file in the input behind the file overlay
     *
     * @param {Object} inputData
     * @param {number} inputData.inputNum
     * @param {ArrayBuffer} inputData.input
     */
    displayFilePreview(inputData) {
        const activeTab = this.getActiveTab(),
            input = inputData.input,
            inputText = document.getElementById("input-text"),
            fileThumb = document.getElementById("input-file-thumbnail");
        if (inputData.inputNum !== activeTab) return;
        inputText.style.overflow = "hidden";
        inputText.classList.add("blur");
        inputText.value = Utils.printable(Utils.arrayBufferToStr(input.slice(0, 4096)));

        // Display image in thumbnail if we want
        if (this.app.options.imagePreview) {
            const inputArr = new Uint8Array(input),
                type = isImage(inputArr);
            if (type && type !== "image/tiff" && inputArr.byteLength <= 512000) {
                const blob = new Blob([inputArr], {type: type}),
                    url = URL.createObjectURL(blob);
                fileThumb.src = url;
            } else {
                this.resetFileThumb();
            }
        } else {
            this.resetFileThumb();
        }

    }

    /**
     * Updates the displayed input progress for a file
     *
     * @param {number} inputNum
     * @param {number} progress
     */
    updateFileProgress(inputNum, progress) {
        const activeTab = this.getActiveTab();
        if (inputNum !== activeTab) return;

        const fileLoaded = document.getElementById("input-file-loaded");
        fileLoaded.textContent = progress + "%";

        if (progress === 100) {
            this.inputWorker.postMessage({
                action: "setInput",
                data: {
                    inputNum: inputNum,
                    silent: true
                }
            });
        }
    }

    /**
     * Updates the input value for the specified inputNum
     *
     * @param {number} inputNum
     * @param {string | ArrayBuffer} value
     */
    updateInputValue(inputNum, value) {
        let includeInput = false;
        const recipeStr = toBase64(value, "A-Za-z0-9+/"); // B64 alphabet with no padding
        if (recipeStr.length > 0 && recipeStr.length <= 68267) {
            includeInput = true;
        }
        this.setUrl({
            includeInput: includeInput,
            input: recipeStr
        });

        if (typeof value === "string") {
            this.inputWorker.postMessage({
                action: "updateInputValue",
                data: {
                    inputNum: inputNum,
                    value: value
                }
            });
        } else {
            this.inputWorker.postMessage({
                action: "updateInputValue",
                data: {
                    inputNum: inputNum,
                    value: value
                }
            }, [value]);
        }
    }

    /**
     * Updates the .data property for the input of the specified inputNum
     *
     * @param {number} inputNum
     * @param {object} inputData
     */
    updateInputObj(inputNum, inputData) {
        if (typeof inputData === "string") {
            this.inputWorker.postMessage({
                action: "updateInputObj",
                data: {
                    inputNum: inputNum,
                    data: inputData
                }
            });
        } else {
            this.inputWorker.postMessage({
                action: "updateInputObj",
                data: {
                    inputNum: inputNum,
                    data: inputData
                }
            }, [inputData.fileBuffer]);
        }
    }

    /**
     * Displays information about the input.
     *
     * @param {number} length - The length of the current input string
     * @param {number} lines - The number of the lines in the current input string
     */
    setInputInfo(length, lines) {
        let width = length.toString().length.toLocaleString();
        width = width < 2 ? 2 : width;

        const lengthStr = length.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        let msg = "length: " + lengthStr;

        if (typeof lines === "number") {
            const linesStr = lines.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>lines: " + linesStr;
        }

        document.getElementById("input-info").innerHTML = msg;

    }

    /**
     * Handler for input change events
     *
     * @param {event} e
     *
     * @fires Manager#statechange
     */
    inputChange(e) {
        // Ignore this function if the input is a file
        const fileOverlay = document.getElementById("input-file");
        if (fileOverlay.style.display === "block") return;

        // Remove highlighting from input and output panes as the offsets might be different now
        this.manager.highlighter.removeHighlights();

        const textArea = document.getElementById("input-text");
        const value = (textArea.value !== undefined) ? textArea.value : "";
        const activeTab = this.getActiveTab();

        this.app.progress = 0;

        const lines = value.length < (this.app.options.ioDisplayThreshold * 1024) ?
            (value.count("\n") + 1) : null;
        this.setInputInfo(value.length, lines);
        this.updateInputValue(activeTab, value);
        this.updateTabHeader({inputNum: activeTab, input: value});

        if (e && this.badKeys.indexOf(e.keyCode) < 0) {
            // Fire the statechange event as the input has been modified
            window.dispatchEvent(this.manager.statechange);
        }
    }

    /**
     * Handler for input paste events
     * Checks that the size of the input is below the display limit, otherwise treats it as a file/blob
     *
     * @param {event} e
     */
    inputPaste(e) {
        const pastedData = e.clipboardData.getData("Text");
        if (pastedData.length < (this.app.options.ioDisplayThreshold * 1024)) {
            // inputChange() was being fired before the input value
            // was set, so add it here instead
            e.preventDefault();
            document.getElementById("input-text").value += pastedData;
            this.inputChange(e);
        } else {
            e.preventDefault();
            e.stopPropagation();

            const file = new File([pastedData], "PastedData", {
                type: "text/plain",
                lastModified: Date.now()
            });

            this.loadUIFiles([file]);
            return false;
        }
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
        e.target.closest("#input-text,#input-file").classList.add("dropping-file");
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
        e.target.closest("#input-text,#input-file").classList.remove("dropping-file");
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

        const text = e.dataTransfer.getData("Text");

        e.target.closest("#input-text,#input-file").classList.remove("dropping-file");

        if (text) {
            // close file
            // set text output
            return;
        }

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
     * @param files
     */
    loadUIFiles(files) {
        const numFiles = files.length;
        const activeTab = this.getActiveTab();
        log.debug(`Loading ${numFiles} files.`);
        // Show something in the UI to make it clear we're loading files

        this.hideLoadingMessage();
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
     * Displays a message to show the app is loading files
     */
    showLoadingMessage() {
        $("#loading-files-modal").modal("show");
    }

    /**
     * Hides the loading message
     */
    hideLoadingMessage() {
        $("#loading-files-modal").modal("hide");
    }

    /**
     * Checks the length of the files input. If it's 0, hide loading message
     */
    checkInputFiles() {
        const fileInput = document.getElementById("open-file");
        const folderInput = document.getElementById("open-folder");

        if (fileInput.value.length === 0 && folderInput.value.length === 0) {
            this.hideLoadingMessage();
        }
    }

    /**
     * Handler for open input button click.
     * Opens the open file dialog.
     */
    inputOpenClick() {
        this.showLoadingMessage();
        document.getElementById("open-file").click();
        document.body.onfocus = this.checkInputFiles.bind(this);
    }

    /**
     * Handler for open folder button click
     * Opens the open folder dialog.
     */
    folderOpenClick() {
        this.showLoadingMessage();
        document.getElementById("open-folder").click();
        document.body.onfocus = this.checkInputFiles.bind(this);
    }

    // set / setFile
        // get the data for the active tab from inputWorker
        // display it!

    // setinputInfo
    /**
     * Display the loaded files information in the input header
     * @param {object} loadedData
     * @param {number} loadedData.pending
     * @param {number} loadedData.loading
     * @param {number} loadedData.loaded
     * @param {number} loadedData.total
     * @param {object} loadedData.activeProgress
     * @param {number} loadedData.activeProgress.inputNum
     * @param {number} loadedData.activeProgress.progress
     * @param {boolean} autoRefresh
     */
    showLoadingInfo(loadedData, autoRefresh) {
        const pending = loadedData.pending;
        const loading = loadedData.loading;
        const loaded = loadedData.loaded;
        const total = loadedData.total;

        let width = total.toString().length;
        width = width < 2 ? 2 : width;

        const totalStr = total.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        let msg = "Total: " + totalStr;

        const loadedStr = loaded.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        msg += "<br>Loaded: " + loadedStr;

        if (pending > 0) {
            const pendingStr = pending.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>Pending: " + pendingStr;
        } else if (loading > 0) {
            const loadingStr = loading.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>Loading: " + loadingStr;
        }

        document.getElementById("input-files-info").innerHTML = msg;

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
                    data: this.getActiveTab()
                });
            }.bind(this), 100);
        }
    }
    // displayTabInfo
        // simple getInput for each tab

    // displayFilePreview

    /**
     * Create a tab element for the input tab bar
     *
     * @param {number} inputNum
     * @param {boolean} [active=false]
     * @returns {Element}
     */
    createTabElement(inputNum, active) {
        const newTab = document.createElement("li");
        newTab.setAttribute("inputNum", inputNum.toString());

        if (active) newTab.classList.add("active-input-tab");

        const newTabContent = document.createElement("div");
        newTabContent.classList.add("input-tab-content");
        newTabContent.innerText = `${inputNum.toString()}: New Tab`;

        const newTabButton = document.createElement("button");
        newTabButton.type = "button";
        newTabButton.className = "btn btn-primary bmd-btn-icon btn-close-tab";

        const newTabButtonIcon = document.createElement("i");
        newTabButtonIcon.classList.add("material-icons");
        newTabButtonIcon.innerText = "clear";

        newTabButton.appendChild(newTabButtonIcon);

        newTab.appendChild(newTabContent);
        newTab.appendChild(newTabButton);

        return newTab;
    }

    /**
     * Redraw the tab bar with an updated list of tabs
     *
     * @param nums
     * @param {number} activeTab
     */
    refreshTabs(nums, activeTab) {
        const tabsList = document.getElementById("input-tabs");

        for (let i = tabsList.children.length - 1; i >= 0; i--) {
            tabsList.children.item(i).remove();
        }

        for (let i = 0; i < nums.length; i++) {
            let active = false;
            if (nums[i] === activeTab) active = true;
            tabsList.appendChild(this.createTabElement(nums[i], active));
        }

        if (nums.length > 0) {
            tabsList.parentElement.style.display = "block";

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        } else {
            tabsList.parentElement.style.display = "none";

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";
        }

        this.changeTab(activeTab, this.app.options.syncTabs);
    }

    /**
     * Change the active tab
     *
     * @param {number} inputNum
     * @param {boolean} [changeOutput=false]
     */
    changeTab(inputNum, changeOutput) {
        const tabsList = document.getElementById("input-tabs");

        this.manager.highlighter.removeHighlights();
        getSelection().removeAllRanges();

        let found = false;
        let minNum = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < tabsList.children.length; i++) {
            const tabNum = parseInt(tabsList.children.item(i).getAttribute("inputNum"), 10);
            if (tabNum === inputNum) {
                tabsList.children.item(i).classList.add("active-input-tab");
                found = true;
            } else {
                tabsList.children.item(i).classList.remove("active-input-tab");
            }
            if (tabNum < minNum) {
                minNum = tabNum;
            }
        }
        if (!found) {
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
        } else {
            this.inputWorker.postMessage({
                action: "setInput",
                data: {
                    inputNum: inputNum,
                    silent: true
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
     * Updates the tab header to display the new input content
     */
    updateTabHeader(headerData) {
        const tabsList = document.getElementById("input-tabs");
        const inputNum = headerData.inputNum;
        let inputData = "New Tab";
        if (headerData.input.length > 0) {
            inputData = headerData.input.slice(0, 100);
        }
        for (let i = 0; i < tabsList.children.length; i++) {
            if (tabsList.children.item(i).getAttribute("inputNum") === inputNum.toString()) {
                tabsList.children.item(i).firstElementChild.innerText = `${inputNum}: ${inputData}`;
                break;
            }
        }
    }
    // removeTabClick

    // move getNearbyNums / getLargest / getSmallest / getNext / getPrevious to inputWorker

    /**
     * Gets the number of the current active tab
     *
     * @returns {number}
     */
    getActiveTab() {
        const activeTabs = document.getElementsByClassName("active-input-tab");
        if (activeTabs.length > 0) {
            const activeTab = activeTabs.item(0);
            const tabNum = activeTab.getAttribute("inputNum");
            return parseInt(tabNum, 10);
        }
        return -1;
    }

    /**
     * Gets the li element for the tab of an input number
     *
     * @param {number} inputNum
     * @returns {Element}
     */
    getTabItem(inputNum) {
        const tabs = document.getElementById("input-tabs").children;
        for (let i = 0; i < tabs.length; i++) {
            if (parseInt(tabs.item(i).getAttribute("inputNum"), 10) === inputNum) {
                return tabs.item(i);
            }
        }
        return null;
    }

    /**
     * Gets a list of tab numbers for the currently open tabs
     */
    getTabList() {
        const nums = [];
        const tabs = document.getElementById("input-tabs").children;
        for (let i = 0; i < tabs.length; i++) {
            nums.push(parseInt(tabs.item(i).getAttribute("inputNum"), 10));
        }
        return nums;
    }

    /**
     * Handler for clear all IO events.
     * Resets the input, output and info areas
     */
    clearAllIoClick() {
        this.manager.worker.cancelBake();
        this.manager.output.removeAllOutputs();

        this.manager.highlighter.removeHighlights();
        getSelection().removeAllRanges();

        const tabsList = document.getElementById("input-tabs").children;
        for (let i = tabsList.length - 1; i >= 0; i--) {
            tabsList.item(i).remove();
        }

        this.setupInputWorker();
        this.addInput(true);
    }

    /**
     * Handler for clear IO click event.
     * Resets the input for the current tab
     */
    clearIoClick() {
        const inputNum = this.getActiveTab();
        if (inputNum === -1) return;

        this.manager.highlighter.removeHighlights();
        getSelection().removeAllRanges();

        this.updateInputValue(inputNum, "");

        this.set({
            inputNum: inputNum,
            input: ""
        });

        this.updateTabHeader({inputNum: inputNum, input: ""});
    }

    // filter stuff should be sent to the inputWorker
        // returns a filterResult message that is handled and used to update the UI

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
     * @param {boolean} [changeTab=false]
     */
    addInput(changeTab=false) {
        if (!this.inputWorker) return;
        this.inputWorker.postMessage({
            action: "addInput",
            data: changeTab
        });
    }

    /**
     * Handler for add input button clicked
     */
    addInputClick() {
        this.addInput(true);
    }

    /**
     * Handler for when the inputWorker adds a new input
     *
     * @param {boolean} changeTab
     * @param {number} inputNum
     */
    inputAdded(changeTab, inputNum) {
        this.addTab(inputNum, changeTab);
        this.manager.output.addOutput(inputNum, changeTab);
    }

    /**
     * Adds a new input tab.
     *
     * @param {number} inputNum
     * @param {boolean} [changeTab=true]
     */
    addTab(inputNum, changeTab = true) {
        const tabsWrapper = document.getElementById("input-tabs");
        const numTabs = tabsWrapper.children.length;

        if (!this.getTabItem(inputNum) && numTabs < this.maxTabs) {
            const newTab = this.createTabElement(inputNum, false);

            tabsWrapper.appendChild(newTab);

            if (numTabs > 0) {
                tabsWrapper.parentElement.style.display = "block";

                document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            } else {
                tabsWrapper.parentElement.style.display = "none";

                document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
                document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
                document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";
            }
        }

        if (changeTab) {
            this.changeTab(inputNum, true);
        }
    }

    /**
     * Handler for when the inputWorker adds multiple inputs
     */
    addInputs() {
        this.inputWorker.postMessage({
            action: "refreshTabs",
            data: {
                inputNum: this.getActiveTab(),
                direction: "left"
            }
        });
    }

    /**
     * Sends a message to the inputWorker to remove an input.
     * If the input tab is on the screen, refreshes the tabs
     *
     * @param {number} inputNum
     */
    removeInput(inputNum) {
        let refresh = false;
        if (this.getTabItem(inputNum) !== null) {
            refresh = true;
        }
        this.inputWorker.postMessage({
            action: "removeInput",
            data: {
                inputNum: inputNum,
                refreshTabs: refresh
            }
        });

        this.manager.output.removeTab(inputNum);
    }

    /**
     * Handler for clicking on a remove tab button
     * @param {event} mouseEvent
     */
    removeTabClick(mouseEvent) {
        if (!mouseEvent.target) {
            return;
        }
        const tabNum = mouseEvent.target.parentElement.parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.removeInput(parseInt(tabNum, 10));
        }
    }

    /**
     * Handler for clicking on next tab button
     */
    changeTabRight() {
        const activeTab = this.getActiveTab();
        this.inputWorker.postMessage({
            action: "changeTabRight",
            data: {
                activeTab: activeTab,
                nums: this.getTabList()
            }
        });
    }

    /**
     * Handler for clicking on next tab button
     */
    changeTabLeft() {
        const activeTab = this.getActiveTab();
        this.inputWorker.postMessage({
            action: "changeTabLeft",
            data: {
                activeTab: activeTab,
                nums: this.getTabList()
            }
        });
    }

    /**
     * Handler for go to tab button clicked
     */
    goToTab() {
        const tabNum = parseInt(window.prompt("Enter tab number:", this.getActiveTab().toString()), 10);
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

        const fileNameFilter = document.getElementById("input-filename-filter").value;
        const contentFilter = document.getElementById("input-content-filter").value;
        const numResults = parseInt(document.getElementById("input-num-results").value, 10);

        this.inputWorker.postMessage({
            action: "filterTabs",
            data: {
                showPending: showPending,
                showLoading: showLoading,
                showLoaded: showLoaded,
                fileNameFilter: fileNameFilter,
                contentFilter: contentFilter,
                numResults: numResults
            }
        });
    }

    /**
     * Displays the results of a tab search in the find tab box
     *
     * @param {object[]} results
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

    /**
     * Update the input URL to the new value
     *
     * @param {object} urlData
     * @param {boolean} urlData.includeInput
     * @param {string} urlData.input
     */
    setUrl(urlData) {
        this.app.updateTitle(urlData.includeInput, urlData.input, true);
    }


}

export default InputWaiter;
