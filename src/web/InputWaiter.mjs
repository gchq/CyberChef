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
        if (this.inputWorker !== null) this.inputWorker.terminate();

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
        this.inputWorker.addEventListener("message", this.handleInputWorkerMessage.bind(this));

        if (this.loaderWorkers.length === 0) {
            this.activateLoaderWorker();
        }

    }

    /**
     * Activates a loaderWorker and sends it to the InputWorker
     */
    activateLoaderWorker() {
        const workerIdx = this.addLoaderWorker(true);
        if (workerIdx === -1) return;

        const workerObj = this.loaderWorkers[workerIdx];
        this.inputWorker.postMessage({
            action: "loaderWorkerReady",
            data: {
                id: workerObj.id,
                port: workerObj.port
            }
        }, [workerObj.port]);
    }

    /**
     * Adds a new loaderWorker
     *
     * @param {boolean} [active=false]
     * @returns {number} The index of the created worker
     */
    addLoaderWorker() {
        if (this.loaderWorkers.length === this.maxWorkers) {
            return -1;
        }
        log.debug("Adding new LoaderWorker.");
        const newWorker = new LoaderWorker();
        const messageChannel = new MessageChannel();
        const workerId = this.workerId++;
        // newWorker.addEventListener("message", this.handleLoaderMessage.bind(this));
        newWorker.postMessage({
            port: messageChannel.port1,
            id: workerId
        }, [messageChannel.port1]);
        const newWorkerObj = {
            worker: newWorker,
            id: workerId,
            port: messageChannel.port2
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
        if (this.loaderWorkers.length === 0) {
            // There should always be 1 loaderworker loaded
            this.addLoaderWorker();
        }
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

    // removeInput should talk to the worker

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
                this.loaderWorkers[r.data.workerIdx].worker.postMessage({
                    file: r.data.file,
                    inputNum: r.data.inputNum
                });
                this.loaderWorkers[r.data.workerIdx].inputNum = r.data.inputNum;
                this.loaderWorkers[r.data.workerIdx].active = true;
                break;
            case "terminateLoaderWorker":
                this.removeLoaderWorker(this.getLoaderWorker(r.data));
                break;
            case "allInputs":
                this.app.bake(false, r.data);
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
                this.showLoadingInfo(r.data);
                break;
            case "setInput":
                this.set(r.data, true);
                break;
            case "inputAdded":
                this.inputAdded(r.data.changeTab, r.data.inputNum);
                break;
            case "addInputs":
                this.addInputs(r.data);
                break;
            default:
                log.error(`Unknown action ${r.action}.`);
        }
        // Handle the responses and use them to control the UI / other workers / stuff
    }

    // get / set input
    /**
     * Gets the input for the active tab
     */
    getActive() {
        const textArea = document.getElementById("input-text");
        const value = (textArea.value !== undefined) ? textArea.value : "";
        const inputNum = this.getActiveTab();

        if (this.fileBuffer) {
            return this.fileBuffer;
        } else {
            this.updateInputValue(inputNum, value);
            return value;
        }
    }

    /**
     * Gets the input for all tabs
     */
    getAll() {
        this.inputWorker.postMessage({
            action: "getAll"
        });
    }

    /**
     * Sets the input in the input area
     *
     * @param inputData
     * @param {boolean} [silent=false]
     */
    set(inputData, silent=false) {
        const inputText = document.getElementById("input-text");
        const activeTab = this.getActiveTab();
        if (inputData.inputNum !== activeTab) return;

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
            // show file info here
        }

        if (!silent) window.dispatchEvent(this.manager.statechange);

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
     * Shows a chunk of the file in the input behind the file overlay
     *
     * @param {Object} inputData
     * @param {number} inputData.inputNum
     * @param {ArrayBuffer} inputData.input
     */
    displayFilePreview(inputData) {
        const activeTab = this.getActiveTab(),
            input = inputData.input,
            inputText = document.getElementById("input-text");
        if (inputData.inputNum !== activeTab) return;
        inputText.style.overflow = "hidden";
        inputText.classList.add("blur");
        inputText.value = Utils.printable(Utils.arrayBufferToStr(input));
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

        if (progress < 100) {
            // setTimeout(function() {
            //     this.inputWorker.postMessage({
            //         action: "getInputProgress",
            //         data: activeTab
            //     });
            // }.bind(this), 100);
        } else {
            this.inputWorker.postMessage({
                action: "setInput",
                data: inputNum
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
        this.inputWorker.postMessage({
            action: "updateInputValue",
            data: {
                inputNum: inputNum,
                value: value
            }
        });
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
    // get progress

    // inputChange
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
    // inputPaste


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

    // inputDrop
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
     * Load files from the UI into the inputWorker, creating tabs if needed
     *
     * @param files
     */
    loadUIFiles(files) {
        const numFiles = files.length;
        log.debug(`Loading ${numFiles} files.`);
        // Show something in the UI to make it clear we're loading files

        this.inputWorker.postMessage({
            action: "loadUIFiles",
            data: files
        });

        this.hideLoadingMessage();
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
     * @param loadedData
     */
    showLoadingInfo(loadedData) {
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

    // addTab
        // UI bit can be done here
        // Adding an input should be sent to the inputWorker

    // removeTab
        // UI here
        // remove input sent to the inputWorker

    // refreshTabs
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

        if (nums.length > 1) {
            tabsList.parentElement.style.display = "block";

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

            document.getElementById("save-all-to-file").style.display = "inline-block";
        } else {
            tabsList.parentElement.style.display = "none";

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";

            document.getElementById("save-all-to-file").style.display = "none";
        }

        this.changeTab(activeTab);
    }

    /**
     * Change the active tab
     *
     * @param {number} inputNum
     * @param {boolean} [changeOutput=false]
     */
    changeTab(inputNum, changeOutput) {
        const tabsList = document.getElementById("input-tabs");
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
                data: inputNum
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
        const inputData = headerData.input.slice(0, 100);
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

    // clearAllIO
        // could just re-run setup to create a new inputWorker

    // clearIO
        // reset current tab

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
     */
    addInput() {
        if (!this.inputWorker) return;
        this.inputWorker.postMessage({
            action: "addInput"
        });
    }

    /**
     * Handler for when the inputWorker adds a new input
     *
     * @param {boolean} changeTab
     * @param {number} inputNum
     */
    inputAdded(changeTab, inputNum) {
        if (changeTab) {
            this.changeTab(inputNum);
        }
        this.manager.output.addOutput(inputNum, changeTab);
    }

    /**
     * Handler for when the inputWorker adds multiple inputs
     *
     * @param {array} inputNums
     */
    addInputs(inputNums) {
        for (let i = 0; i < inputNums.length; i++) {
            this.manager.output.addOutput(inputNums[i], false);
        }
        this.changeTab(inputNums[inputNums.length - 1], this.app.options.syncTabs);
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

        this.manager.output.removeOutput(inputNum);
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
}

export default InputWaiter;
