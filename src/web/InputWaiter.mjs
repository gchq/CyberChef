/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import LoaderWorker from "worker-loader?inline&fallback=false!./LoaderWorker";
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
     * @param {App} app - The main view object for CyberChef
     * @param {Manager} manager- The CyberChef event manager.
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

        this.loaderWorkers = [];
        this.maxWorkers = navigator.hardwareConcurrency || 4;
        this.inputs = [];
        this.pendingFiles = [];
        this.maxTabs = 4; // Calculate this
    }

    /**
     * Terminates any existing loader workers and sets up a new worker
     */
    setupLoaderWorker() {
        for (let i = 0; i < this.loaderWorkers.length; i++) {
            const worker = this.loaderWorkers.pop();
            worker.terminate();
        }

        this.addLoaderWorker();
    }

    /**
     * Adds a new loaderWorker
     *
     * @returns {number} The index of the created worker
     */
    addLoaderWorker() {
        for (let i = 0; i < this.loaderWorkers.length; i++) {
            if (!this.loaderWorkers[i].active) {
                return i;
            }
        }
        if (this.loaderWorkers.length === this.maxWorkers) {
            return -1;
        }
        log.debug("Adding new LoaderWorker.");
        const newWorker = new LoaderWorker();
        newWorker.addEventListener("message", this.handleLoaderMessage.bind(this));
        const newWorkerObj = {
            worker: newWorker,
            active: false,
            inputNum: 0
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
        this.loaderWorkers[idx].worker.terminate();
        this.loaderWorkers.splice(idx, 1);
        if (this.loaderWorkers.length === 0) {
            // There should always be 1 loaderworker loaded
            this.addLoaderWorker();
        }
    }

    /**
     * Finds and returns the object for the loaderWorker of a given inputNum
     *
     * @param {number} inputNum
     */
    getLoaderWorker(inputNum) {
        for (let i = 0; i < this.loaderWorkers.length; i++) {
            if (this.loaderWorkers[i].inputNum === inputNum) {
                return this.loaderWorkers[i];
            }
        }
    }

    /**
     * Loads a file into the input
     *
     * @param {File} file
     * @param {number} inputNum
     */
    loadFile(file, inputNum) {
        if (file && inputNum) {
            this.closeFile(this.getLoaderWorker(inputNum));
            let loaded = false;

            const workerId = this.addLoaderWorker();
            if (workerId !== -1) {
                this.loaderWorkers[workerId].active = true;
                this.loaderWorkers[workerId].inputNum = inputNum;
                this.loaderWorkers[workerId].worker.postMessage({
                    file: file,
                    inputNum: inputNum
                });
                loaded = true;
            } else {
                this.pendingFiles.push({
                    file: file,
                    inputNum: inputNum
                });
            }
            if (this.getInput(inputNum) !== null) {
                this.removeInput(inputNum);
            }
            this.inputs.push({
                inputNum: inputNum,
                data: {
                    fileBuffer: new ArrayBuffer(),
                    name: file.name,
                    size: file.size.toLocaleString(),
                    type: file.type || "unknown"
                },
                status: (loaded) ?  "loading" : "pending",
                progress: 0
            });
        }
    }

    /**
     * Closes a file and removes it from inputs
     *
     * @param {number} inputNum
     */
    closeFile(inputNum) {
        this.removeLoaderWorker(this.getLoaderWorker(inputNum));
        this.removeInput(inputNum);

        if (inputNum === this.getActiveTab()) {
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

            const inputText = document.getElementById("input-text"),
                fileThumb = document.getElementById("input-file-thumbnail");
            inputText.style.overflow = "auto";
            inputText.classList.remove("blur");
            fileThumb.src = require("./static/images/file-128x128.png");
        }
    }

    /**
     * Remove an input from the input list
     * @param {number} inputNum
     */
    removeInput(inputNum) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum === inputNum) {
                this.inputs.splice(i, 1);
            }
        }
    }

    /**
     * Updates the progress value of an input
     *
     * @param {number} inputNum
     * @param {number} progress
     */
    updateInputProgress(inputNum, progress) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum === inputNum) {
                // Don't let progress go over 100
                this.inputs[i].progress = (progress <= 100) ? progress : 100;
            }
        }
    }

    /**
     * Updates the stored value of an input
     *
     * @param {number} inputNum
     * @param {ArrayBuffer | String} value
     */
    updateInputValue(inputNum, value) {

        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum === inputNum) {
                if (typeof value === "string") {
                    this.inputs[i].data = value;
                } else {
                    this.inputs[i].data.fileBuffer = value;

                    if (inputNum === this.getActiveTab()) {
                        this.displayFilePreview();
                    }
                }
                this.inputs[i].progress = 100;
                this.inputs[i].status = "loaded";
                return;
            }
        }
        // If we get to here, an input for inputNum could not be found

        if (typeof value === "string") {
            this.inputs.push({
                inputNum: inputNum,
                data: value,
                status: "loaded",
                progress: 100
            });
        }
    }

    /**
     * Handler for messages sent back by LoaderWorkers
     *
     * @param {MessageEvent} else
     */
    handleLoaderMessage(e) {
        const r = e.data;
        let inputNum = 0;

        if (r.hasOwnProperty("inputNum")) {
            inputNum = r.inputNum;
        }

        if (r.hasOwnProperty("progress")) {
            this.updateInputProgress(inputNum, r.progress);
            this.setFile(inputNum);
            // UI here
        }

        if (r.hasOwnProperty("error")) {
            this.app.alert(r.error, 10000);
        }

        if (r.hasOwnProperty("fileBuffer")) {
            log.debug(`Input file ${inputNum} loaded.`);
            this.updateInputValue(inputNum, r.fileBuffer);

            this.setLoadingInfo();

            const currentWorker = this.getLoaderWorker(inputNum);

            if (this.pendingFiles.length > 0) {
                log.debug("Loading file completed. Loading next file.");
                const nextFile = this.pendingFiles.pop();
                currentWorker.inputNum = nextFile.inputNum;
                currentWorker.worker.postMessage({
                    file: nextFile.file,
                    inputNum: nextFile.inputNum
                });

            } else {
                // LoaderWorker no longer needed
                log.debug("Loading file completed. Closing LoaderWorker.");
                const progress = this.getLoadProgress();
                if (progress.total === progress.loaded) {
                    window.dispatchEvent(this.manager.statechange);
                }
                this.removeLoaderWorker(currentWorker);
            }

        }
    }

    /**
     * Gets the input for the specified input number
     *
     * @param {number} inputNum
     */
    getInput(inputNum) {
        const index = this.getInputIndex(inputNum);
        if (index === -1) {
            return null;
        }
        if (typeof this.inputs[index].data === "string") {
            return this.inputs[index].data;
        } else {
            return this.inputs[index].data.fileBuffer;
        }
    }

    /**
     * Gets the index of the input in the inputs list
     *
     * @param {number} inputNum
     */
    getInputIndex(inputNum) {
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum === inputNum) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Gets the input for the active tab
     */
    getActive() {
        const textArea = document.getElementById("input-text");
        const value = (textArea.value !== undefined) ? textArea.value : "";
        const inputNum = this.getActiveTab();

        const input = this.getInput(inputNum);
        if (input === null || typeof input === "string") {
            this.updateInputValue(inputNum, value);
        }

        return this.getInput(inputNum);

    }

    /**
     * Gets the input for all tabs
     */
    getAll() {
        // Need to make sure here that the active input is actually saved in this inputs
        this.getActive();
        const inputs = [];

        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].status === "loaded") {
                inputs.push({
                    inputNum: this.inputs[i].inputNum,
                    input: this.getInput(this.inputs[i].inputNum) || ""
                });
            }
        }
        if (inputs.length === 0) {
            inputs.push({
                inputNum: 1,
                input: ""
            });
        }
        return inputs;
    }

    /**
     * Get the progress of the loaderWorkers
     */
    getLoadProgress() {
        const totalInputs = this.inputs.length;
        const pendingInputs = this.pendingFiles.length;
        let loadingInputs = 0;
        for (let i = 0; i < this.loaderWorkers.length; i++) {
            if (this.loaderWorkers[i].active) {
                loadingInputs += 0;
            }
        }
        return {
            total: totalInputs,
            pending: pendingInputs,
            loading: loadingInputs,
            loaded: (totalInputs - pendingInputs - loadingInputs)
        };
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
        const input = this.getActive();
        if (typeof input !== "string") return;

        // Remove highlighting from input and output panes as the offsets might be different now
        // this.manager.highlighter.removeHighlights();

        // Reset recipe progress as any previous processing will be redundant now
        this.app.progress = 0;

        // Update the input metadata info
        const lines = input.length < (this.app.options.ioDisplayThreshold * 1024) ?
            input.count("\n") + 1 : null;

        this.setInputInfo(input.length, lines);
        this.displayTabInfo(this.getActiveTab());

        if (e && this.badKeys.indexOf(e.keyCode) < 0) {
            // Fire the statechange event as the input has been modified
            window.dispatchEvent(this.manager.statechange);
        }
    }

    /**
     * Handler for input paste events.
     * Checks that the size of the input is below the display limit, otherwise treats it as a file/blob.
     *
     * @param {event} e
     */
    inputPaste(e) {
        const pastedData = e.clipboardData.getData("Text");

        if (pastedData.length < (this.app.options.ioDisplayThreshold * 1024)) {
            this.inputChange(e);
        } else {
            e.preventDefault();
            e.stopPropagation();

            const file = new File([pastedData], "PastedData", {
                type: "text/plain",
                lastModified: Date.now()
            });

            this.loadFile(file, this.getActiveTab());
            this.set(file);
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
     * Loads the dragged data into the input textarea
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
            this.closeFile(this.getActiveTab());
            this.set(text);
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

        if (e.srcElement.files.length > 0) {
            this.loadUIFiles(e.srcElement.files);
            e.srcElement.value = "";
        }
    }

    /**
     * Load files from the UI into the input, creating tabs if needed
     *
     * @param files
     */
    loadUIFiles(files) {
        let inputNum;
        if (files.length > 20) {
            this.manager.controls.setAutoBake(false);
            this.app.alert("Auto-Bake is disabled by default when inputting more than 20 files.", 5000);
        }
        for (let i = 0; i < files.length; i++) {
            inputNum = this.getActiveTab();
            if (i > 0) {
                inputNum = this.addTab(false);
            }
            this.loadFile(files[i], inputNum);

            if (inputNum ===  this.getActiveTab()) {
                this.setFile(inputNum);
            }
        }
        this.changeTab(inputNum, this.app.options.syncTabs);
    }

    /**
     * Sets the input in the input area
     *
     * @param {string|File} input
     * @param {boolean} [silent=false] - Suppress statechange event
     *
     * @fires Manager#statechange
     *
     */
    set(input, silent=false) {
        const inputText = document.getElementById("input-text");
        const inputNum = this.getActiveTab();
        if (input instanceof File) {
            this.setFile(inputNum);
            inputText.value = "";
            this.setInputInfo(input.size, null);
            this.displayTabInfo(inputNum);
        } else {
            inputText.value = input;
            this.updateInputValue(inputNum, input);
            this.closeFile(inputNum);

            if (!silent) window.dispatchEvent(this.manager.statechange);

            const lines = input.length < (this.app.options.ioDisplayThreshold * 1024) ?
                input.count("\n") + 1 : null;
            this.setInputInfo(input.length, lines);
            this.displayTabInfo(inputNum);
        }
    }

    /**
     * Shows file details
     *
     * @param {number} inputNum
     */
    setFile(inputNum) {
        if (inputNum === this.getActiveTab()) {
            for (let i = 0; i < this.inputs.length; i++) {
                if (this.inputs[i].inputNum === inputNum && typeof this.inputs[i].data !== "string") {
                    const fileOverlay = document.getElementById("input-file"),
                        fileName = document.getElementById("input-file-name"),
                        fileSize = document.getElementById("input-file-size"),
                        fileType = document.getElementById("input-file-type"),
                        fileLoaded = document.getElementById("input-file-loaded"),
                        fileObj = this.inputs[i];
                    fileOverlay.style.display = "block";
                    fileName.textContent = fileObj.data.name;
                    fileSize.textContent = fileObj.data.size + " bytes";
                    fileType.textContent = fileObj.data.type;
                    fileLoaded.textContent = fileObj.progress + "%";

                    this.setInputInfo(fileObj.data.size, null);
                    this.displayFilePreview();
                }
            }
        }
        this.displayTabInfo(inputNum);
    }

    /**
     * Displays information about the input.
     *
     * @param {number} length - The length of the current input string
     * @param {number} lines - The number of the lines in the current input string
     */
    setInputInfo(length, lines) {
        // This should also update the tab?
        let width = length.toString().length;
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
     * Display progress information for file loading in header
     */
    setLoadingInfo() {
        const progress = this.getLoadProgress();
        let width = progress.total.toString().length;
        width = width < 2 ? 2 : width;

        const totalStr = progress.total.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        let msg = "Total: " + totalStr;

        const loadedStr = progress.loaded.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        msg += "<br>Loaded: " + loadedStr;

        if (progress.pending > 0) {
            const pendingStr = progress.pending.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>Pending: " + pendingStr;

        }

        document.getElementById("input-files-info").innerHTML = msg;
    }

    /**
     * Display input information in the tab header
     *
     * @param {number} inputNum
     */
    displayTabInfo(inputNum) {
        const tabItem = this.getTabItem(inputNum);
        const input = this.inputs[this.getInputIndex(inputNum)];
        if (!tabItem) {
            return;
        }

        const tabContent = tabItem.firstElementChild;
        if (typeof input.data !== "string") {
            tabContent.innerText = `${inputNum}: ${input.data.name}`;
        } else {
            if (input.data.length > 0) {
                const inputText = input.data.slice(0, 100).split(/[\r\n]/)[0];
                tabContent.innerText = `${inputNum}: ${inputText}`;
            } else {
                tabContent.innerText = `${inputNum}: New Tab`;
            }
        }
    }

    /**
     * Shows a chunk of the file in the input behind the file overlay.
     */
    displayFilePreview() {
        const inputNum = this.getActiveTab(),
            input = this.getInput(inputNum),
            inputText = document.getElementById("input-text"),
            fileSlice = input.slice(0, 4096),
            fileThumb = document.getElementById("input-file-thumbnail"),
            arrBuffer = new Uint8Array(input),
            type = isImage(arrBuffer);
        if (type && type !== "image/tiff" && this.app.options.imagePreview && input.byteLength < 1024000) {
            // Don't show TIFFs as not much supports them
            fileThumb.src = `data:${type};base64,${toBase64(arrBuffer)}`;
        } else {
            fileThumb.src = require("./static/images/file-128x128.png");
        }
        inputText.style.overflow = "hidden";
        inputText.classList.add("blur");
        inputText.value = Utils.printable(Utils.arrayBufferToStr(fileSlice));
        if (this.getInput(inputNum).byteLength > 4096) {
            inputText.value += "[truncated]...";
        }
    }

    /**
     * Create a tab element for the input tab bar
     *
     * @param {number} inputNum
     * @returns {Element}
     */
    createTabElement(inputNum) {
        const newTab = document.createElement("li");
        newTab.setAttribute("inputNum", inputNum.toString());

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
     * Adds a new input to inputs.
     * Will create a new tab if there's less than maxtabs visible.
     *
     * @param {boolean} [changeTab=true]
     */
    addTab(changeTab = true) {
        let inputNum;
        if (this.inputs.length === 0) {
            inputNum = 1;
        } else {
            inputNum = this.getLargestInputNum() + 1;
        }

        this.inputs.push({
            inputNum: inputNum,
            data: "",
            status: "loaded",
            progress: 100
        });

        this.manager.output.addOutput(inputNum, changeTab);

        const tabsWrapper = document.getElementById("input-tabs");
        const numTabs = tabsWrapper.children.length;

        if (numTabs < this.maxTabs) {
            // Create a tab element
            const newTab = this.createTabElement(inputNum);

            tabsWrapper.appendChild(newTab);

            if (numTabs > 0) {
                tabsWrapper.parentElement.style.display = "block";

                const tabButtons = document.getElementsByClassName("input-tab-buttons");
                for (let i = 0; i < tabButtons.length; i++) {
                    tabButtons.item(i).style.display = "inline-block";
                }

                document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            }

        }

        if (changeTab) {
            this.changeTab(inputNum);
        }

        return inputNum;

    }

    /**
     * Removes a tab and it's corresponding input
     *
     * @param {number} inputNum
     */
    removeTab(inputNum) {
        const inputIdx = this.getInputIndex(inputNum);
        let activeTab = this.getActiveTab();
        if (inputIdx === -1) {
            return;
        }

        const tabElement = this.getTabItem(inputNum);

        this.removeInput(inputNum);

        if (tabElement !== null) {
            if (inputNum === activeTab) {
                activeTab = this.getPreviousInputNum(activeTab);
                if (activeTab === this.getActiveTab()) {
                    activeTab = this.getNextInputNum(activeTab);
                }
            }
            this.refreshTabs(activeTab);
        }

        this.manager.output.removeTab(inputNum);
    }

    /**
     * Redraw the entire tab bar to remove any outdated tabs
     * @param {number} activeTab
     */
    refreshTabs(activeTab) {
        const tabsList = document.getElementById("input-tabs");
        let newInputs = this.getNearbyNums(activeTab, "right");
        if (newInputs.length < this.maxTabs) {
            newInputs = this.getNearbyNums(activeTab, "left");
        }

        for (let i = tabsList.children.length - 1; i >= 0; i--) {
            tabsList.children.item(i).remove();
        }

        for (let i = 0; i < newInputs.length; i++) {
            tabsList.appendChild(this.createTabElement(newInputs[i]));
            this.displayTabInfo(newInputs[i]);
        }

        if (newInputs.length > 1) {
            tabsList.parentElement.style.display = "block";

            const tabButtons = document.getElementsByClassName("input-tab-buttons");
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons.item(i).style.display = "inline-block";
            }

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        } else {
            tabsList.parentElement.style.display = "none";

            const tabButtons = document.getElementsByClassName("input-tab-buttons");
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons.item(i).style.display = "none";
            }

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";
        }

        if (newInputs.length === 0) {
            activeTab = this.addTab();
            this.displayTabInfo(activeTab);
        }

        this.changeTab(activeTab);
        this.manager.output.refreshTabs(activeTab);
        // MAKE THE OUTPUT REFRESH TOO
    }

    /**
     * Handler for remove tab button click
     * @param {event} mouseEvent
     */
    removeTabClick(mouseEvent) {
        if (!mouseEvent.srcElement) {
            return;
        }
        const tabNum = mouseEvent.srcElement.parentElement.parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.removeTab(parseInt(tabNum, 10));
        }
    }

    /**
     * Generates a list of the nearby inputNums
     *
     * @param {number} inputNum
     * @param {string} direction
     */
    getNearbyNums(inputNum, direction) {
        const inputs = [];
        if (direction === "left") {
            let reachedEnd = false;
            for (let i = 0; i < this.maxTabs; i++) {
                let newNum;
                if (i === 0) {
                    newNum = inputNum;
                } else {
                    newNum = this.getNextInputNum(inputs[i-1]);
                }
                if (newNum === inputs[i-1]) {
                    reachedEnd = true;
                    inputs.sort(function(a, b) {
                        return b - a;
                    });
                }
                if (reachedEnd) {
                    newNum = this.getPreviousInputNum(inputs[i-1]);
                }
                if (newNum >= 0) {
                    inputs.push(newNum);
                }
            }
        } else {
            let reachedEnd = false;
            for (let i = 0; i < this.maxTabs; i++) {
                let newNum;
                if (i === 0) {
                    newNum = inputNum;
                } else {
                    if (!reachedEnd) {
                        newNum = this.getPreviousInputNum(inputs[i-1]);
                    }
                    if (newNum === inputs[i-1]) {
                        reachedEnd = true;
                        inputs.sort(function(a, b) {
                            return b - a;
                        });
                    }
                    if (reachedEnd) {
                        newNum = this.getNextInputNum(inputs[i-1]);
                    }
                }
                if (newNum >= 0) {
                    inputs.push(newNum);
                }
            }
        }
        inputs.sort(function(a, b) {
            return a - b;
        });
        return inputs;
    }

    /**
     * Changes the active tab
     *
     * @param {number} inputNum
     * @param {boolean} [changeOutput=false]
     */
    changeTab(inputNum, changeOutput = false) {
        const currentNum = this.getActiveTab();
        if (this.getInputIndex(inputNum) === -1) return;

        const tabsWrapper = document.getElementById("input-tabs");
        const tabs = tabsWrapper.children;

        let found = false;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs.item(i).getAttribute("inputNum") === inputNum.toString()) {
                tabs.item(i).classList.add("active-input-tab");
                found = true;
            } else {
                tabs.item(i).classList.remove("active-input-tab");
            }
        }
        if (!found) {
            // Shift the tabs here
            let direction = "right";
            if (currentNum > inputNum) {
                direction = "left";
            }

            const newInputs = this.getNearbyNums(inputNum, direction);

            for (let i = 0; i < newInputs.length; i++) {
                tabs.item(i).setAttribute("inputNum", newInputs[i].toString());
                this.displayTabInfo(newInputs[i]);
                if (newInputs[i] === inputNum) {
                    tabs.item(i).classList.add("active-input-tab");
                }
            }
        }

        const input = this.getInput(inputNum);
        if (typeof input === "string") {
            this.set(this.getInput(inputNum));
        } else {
            this.setFile(inputNum);
        }

        if (changeOutput) {
            this.manager.output.changeTab(inputNum, false);
        }

    }

    /**
     * Handler for changing tabs event
     *
     * @param {event} mouseEvent
     */
    changeTabClick(mouseEvent) {
        if (!mouseEvent.srcElement) {
            return;
        }
        const tabNum = mouseEvent.srcElement.parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.changeTab(parseInt(tabNum, 10), this.app.options.syncTabs);
        }
    }

    /**
     * Handler for changing to the left tab
     */
    changeTabLeft() {
        const currentTab = this.getActiveTab();
        const currentInput = this.getInputIndex(currentTab);
        if (currentInput > 0) {
            this.changeTab(this.getPreviousInputNum(currentTab), this.app.options.syncTabs);
        } else {
            this.changeTab(this.inputs[0].inputNum, this.app.options.syncTabs);
        }
    }

    /**
     * Handler for changing to the right tab
     */
    changeTabRight() {
        const currentTab = this.getActiveTab();
        this.changeTab(this.getNextInputNum(currentTab), this.app.options.syncTabs);
    }

    /**
     * Handler for go to tab button clicked
     */
    goToTab() {
        const tabNum = parseInt(window.prompt("Enter tab number:", this.getActiveTab().toString()), 10);
        if (this.getInputIndex(tabNum)) {
            this.changeTab(tabNum, this.app.options.syncTabs);
        }
    }

    /**
     * Gets the largest inputNum
     *
     * @returns {number}
     */
    getLargestInputNum() {
        let largest = 0;
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum > largest) {
                largest = this.inputs[i].inputNum;
            }
        }
        return largest;
    }

    /**
     * Gets the smallest inputNum
     *
     * @returns {number}
     */
    getSmallestInputNum() {
        let smallest = this.getLargestInputNum();
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum < smallest) {
                smallest = this.inputs[i].inputNum;
            }
        }
        return smallest;
    }

    /**
     * Gets the previous inputNum
     *
     * @param {number} inputNum - The current input number
     * @returns {number}
     */
    getPreviousInputNum(inputNum) {
        let num = -1;
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum < inputNum) {
                if (this.inputs[i].inputNum > num) {
                    num = this.inputs[i].inputNum;
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
        let num = this.getLargestInputNum();
        for (let i = 0; i < this.inputs.length; i++) {
            if (this.inputs[i].inputNum > inputNum) {
                if (this.inputs[i].inputNum < num) {
                    num = this.inputs[i].inputNum;
                }
            }
        }
        return num;
    }

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
     * Handler for clear all IO events.
     * Resets the input, output and info areas
     */
    clearAllIoClick() {
        for (let i = this.inputs.length - 1; i >= 0; i--) {
            this.removeTab(this.inputs[i].inputNum);
        }
        this.refreshTabs();
    }

    /**
     * Handler for clear IO click event.
     * Resets the input for the current tab
     */
    clearIoClick() {
        const inputNum = this.getActiveTab();
        this.removeInput(inputNum);

        this.inputs.push({
            inputNum: inputNum,
            data: "",
            status: "loaded",
            progress: 0
        });

        this.set("");
    }
}

export default InputWaiter;
