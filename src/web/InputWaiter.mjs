/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import LoaderWorker from "worker-loader?inline&fallback=false!./LoaderWorker";
import Utils from "../core/Utils";


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

        this.loaderWorkers = {};
        this.fileBuffers = {};
        this.inputs = {};
    }


    /**
     * Gets the user's input from the active input textarea.
     *
     * @returns {string}
     */
    get() {
        const textArea = document.getElementById("input-text");
        const value = textArea.value;
        const inputNum = this.getActiveTab();
        if (this.fileBuffers[inputNum] && this.fileBuffers[inputNum].fileBuffer) {
            return this.fileBuffers[inputNum].fileBuffer;
        }
        return value;
    }


    /**
     * Sets the input in the input area.
     *
     * @param {string|File} input
     * @param {boolean} [silent=false] - Suppress statechange event
     *
     * @fires Manager#statechange
     */
    set(input, silent=false) {
        const inputText = document.getElementById("input-text");
        const inputNum = this.getActiveTab();
        if (input instanceof File) {
            this.setFile(input);
            inputText.value = "";
            this.setInputInfo(input.size, null);
            this.displayTabInfo(input);
        } else {
            inputText.value = input;
            this.inputs[inputNum] = input;
            this.closeFile(inputNum);
            if (!silent) window.dispatchEvent(this.manager.statechange);
            const lines = input.length < (this.app.options.ioDisplayThreshold * 1024) ?
                input.count("\n") + 1 : null;
            this.setInputInfo(input.length, lines);
            this.displayTabInfo(input);
        }
    }


    /**
     * Shows file details.
     *
     * @param {File} file
     */
    setFile(file) {
        // Display file overlay in input area with details
        const inputNum = this.getActiveTab();

        this.fileBuffers[inputNum] = {
            fileBuffer: new ArrayBuffer(),
            name: file.name,
            size: file.size.toLocaleString(),
            type: file.type || "unknown",
            loaded: "0%"
        };

        this.setFileInfo(this.fileBuffers[inputNum]);
    }


    /**
     * Displays information about the input.
     *
     * @param {number} length - The length of the current input string
     * @param {number} lines - The number of the lines in the current input string
     */
    setInputInfo(length, lines) {
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
     * Displays information about the input file.
     *
     * @param fileObj
     */
    setFileInfo(fileObj) {
        const fileOverlay = document.getElementById("input-file"),
            fileName = document.getElementById("input-file-name"),
            fileSize = document.getElementById("input-file-size"),
            fileType = document.getElementById("input-file-type"),
            fileLoaded = document.getElementById("input-file-loaded");

        fileOverlay.style.display = "block";
        fileName.textContent = fileObj.name;
        fileSize.textContent = fileObj.size + " bytes";
        fileType.textContent = fileObj.type;
        fileLoaded.textContent = fileObj.loaded;
    }


    /**
     * Handler for input change events.
     *
     * @param {event} e
     *
     * @fires Manager#statechange
     */
    inputChange(e) {
        // Ignore this function if the input is a File
        const inputNum = this.getActiveTab();
        if (this.fileBuffers[inputNum]) return;

        // Remove highlighting from input and output panes as the offsets might be different now
        // this.manager.highlighter.removeHighlights();

        // Reset recipe progress as any previous processing will be redundant now
        this.app.progress = 0;

        // Update the input metadata info
        const inputText = this.get();
        this.inputs[inputNum] = inputText;
        const lines = inputText.length < (this.app.options.ioDisplayThreshold * 1024) ?
            inputText.count("\n") + 1 : null;

        this.setInputInfo(inputText.length, lines);
        this.displayTabInfo(inputText);

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

            this.loaderWorker = new LoaderWorker();
            this.loaderWorker.addEventListener("message", this.handleLoaderMessage.bind(this));
            this.loaderWorker.postMessage({"file": file, "inputNum": this.getActiveTab()});
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
     * Loads the dragged data into the input textarea.
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
            for (let i = 0; i < e.dataTransfer.files.length; i++) {
                const file = e.dataTransfer.files[i];
                if (i !== 0) {
                    this.addTab();
                }
                this.loadFile(file, this.getActiveTab());
            }
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

        // TODO : CHANGE THIS TO HANDLE MULTIPLE FILES
        for (let i = 0; i < e.srcElement.files.length; i++) {
            const file = e.srcElement.files[i];
            if (i !== 0) {
                this.addTab();
            }
            this.loadFile(file, this.getActiveTab());
        }
    }


    /**
     * Handler for messages sent back by the LoaderWorker.
     *
     * @param {MessageEvent} e
     */
    handleLoaderMessage(e) {
        const r = e.data;
        let inputNum;
        const tabNum = this.getActiveTab();
        if (r.hasOwnProperty("inputNum")) {
            inputNum = r.inputNum;
        }
        if (r.hasOwnProperty("progress")) {
            this.fileBuffers[inputNum].loaded = r.progress + "%";
            if (tabNum === inputNum) {
                const fileLoaded = document.getElementById("input-file-loaded");
                fileLoaded.textContent = r.progress + "%";
            }
        }

        if (r.hasOwnProperty("error")) {
            this.app.alert(r.error, 10000);
        }

        if (r.hasOwnProperty("fileBuffer")) {
            log.debug("Input file loaded");
            this.fileBuffers[inputNum].fileBuffer = r.fileBuffer;
            this.displayFilePreview();
            window.dispatchEvent(this.manager.statechange);
        }
    }


    /**
     * Shows a chunk of the file in the input behind the file overlay.
     */
    displayFilePreview() {
        const inputNum = this.getActiveTab();
        const inputText = document.getElementById("input-text"),
            fileSlice = this.fileBuffers[inputNum].fileBuffer.slice(0, 4096);

        inputText.style.overflow = "hidden";
        inputText.classList.add("blur");
        inputText.value = Utils.printable(Utils.arrayBufferToStr(fileSlice));
        if (this.fileBuffers[inputNum].fileBuffer.byteLength > 4096) {
            inputText.value += "[truncated]...";
        }
    }


    /**
     * Handler for file close events.
     */
    closeFile(inputNum) {
        if (this.loaderWorkers[inputNum]) this.loaderWorkers[inputNum].terminate();
        delete this.fileBuffers[inputNum];
        document.getElementById("input-file").style.display = "none";
        const inputText = document.getElementById("input-text");
        inputText.style.overflow = "auto";
        inputText.classList.remove("blur");
    }


    /**
     * Loads a file into the input.
     *
     * @param {File} file
     * @param {string} inputNum
     */
    loadFile(file, inputNum) {
        if (file && inputNum) {
            this.closeFile(inputNum);
            this.loaderWorkers[inputNum] = new LoaderWorker();
            this.loaderWorkers[inputNum].addEventListener("message", this.handleLoaderMessage.bind(this));
            this.loaderWorkers[inputNum].postMessage({"file": file, "inputNum": inputNum});
            this.set(file);
        }
    }

    /**
     * Handler for clear IO events.
     * Resets the input, output and info areas.
     *
     * @fires Manager#statechange
     */
    clearIoClick() {
        this.closeFile(this.getActiveTab());
        this.manager.output.closeFile();
        this.manager.highlighter.removeHighlights();
        document.getElementById("input-text").value = "";
        document.getElementById("output-text").value = "";
        document.getElementById("input-info").innerHTML = "";
        document.getElementById("output-info").innerHTML = "";
        document.getElementById("input-selection-info").innerHTML = "";
        document.getElementById("output-selection-info").innerHTML = "";
        window.dispatchEvent(this.manager.statechange);
    }

    /**
     * Handler for clear all IO events.
     * Resets the input, output and info areas.
     *
     * @fires Manager#statechange
     */
    clearAllIoClick() {
        // TODO: Close all tabs here
        const tabs = document.getElementById("input-tabs").getElementsByTagName("li");
        for (let i = tabs.length - 1; i >= 0; i--) {
            const tabItem = tabs.item(i);
            this.closeFile(this.getActiveTab(tabItem.id.replace("input-tab-", "")));
            this.removeTab(tabItem);
        }
        this.manager.output.closeFile();
        // this.manager.highlighter.removeHighlights();
        const inputNum = this.getActiveTab();
        document.getElementById(`input-tab-${inputNum}`).firstElementChild.innerText = "New Tab";
        document.getElementById("input-text").value = "";
        document.getElementById("output-text").value = "";
        document.getElementById("input-info").innerHTML = "";
        document.getElementById("output-info").innerHTML = "";
        document.getElementById("input-selection-info").innerHTML = "";
        document.getElementById("output-selection-info").innerHTML = "";
        window.dispatchEvent(this.manager.statechange);
    }

    /**
     * Function to create a new tab
     *
     * @param {boolean} changeTab
     */
    addTab(changeTab = true) {
        const tabWrapper = document.getElementById("input-tabs");
        const tabsList = tabWrapper.children[0];
        const lastTabNum = tabsList.lastElementChild.id.replace("input-tab-", "");
        const newTabNum = parseInt(lastTabNum, 10) + 1;

        tabWrapper.style.display = "block";

        document.getElementById("input-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("input-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

        this.inputs[newTabNum.toString()] = "";

        const newTab = document.createElement("li");
        newTab.id = `input-tab-${newTabNum}`;

        const newTabContent = document.createElement("div");
        newTabContent.classList.add("input-tab-content");
        newTabContent.innerText = "New Tab";

        const newTabCloseBtn = document.createElement("button");
        newTabCloseBtn.className = "btn btn-primary bmd-btn-icon btn-close-tab";
        newTabCloseBtn.id = `btn-close-tab-${newTabNum}`;

        const newTabCloseBtnIcon = document.createElement("i");
        newTabCloseBtnIcon.classList.add("material-icons");
        newTabCloseBtnIcon.innerText = "clear";

        newTabCloseBtn.appendChild(newTabCloseBtnIcon);
        newTab.appendChild(newTabContent);
        newTab.appendChild(newTabCloseBtn);

        tabsList.appendChild(newTab);

        if (changeTab) {
            this.changeTab(newTabContent);
        }
    }

    /**
     * Function to remove a tab
     *
     * @param {Element} tabLiItem
     */
    removeTab(tabLiItem) {
        const tabList= tabLiItem.parentElement;
        if (tabList.children.length > 1) {
            if (tabLiItem.classList.contains("active-input-tab")) {
                if (tabLiItem.previousElementSibling) {
                    this.changeTab(tabLiItem.previousElementSibling.firstElementChild);

                    window.dispatchEvent(this.manager.statechange);
                } else if (tabLiItem.nextElementSibling) {
                    this.changeTab(tabLiItem.nextElementSibling.firstElementChild);

                    window.dispatchEvent(this.manager.statechange);
                }
            }
            const tabNum = tabLiItem.id.replace("input-tab-", "");

            delete this.fileBuffers[tabNum];
            delete this.inputs[tabNum];

            tabList.removeChild(tabLiItem);
        } else {
            const tabNum = tabLiItem.id.replace("input-tab-", "");
            delete this.fileBuffers[tabNum];
            this.inputs[tabNum] = "";
            document.getElementById("input-text").value = "";
            tabLiItem.firstElementChild.innerText = "New Tab";
        }
        if (tabList.children.length === 1) {
            document.getElementById("input-tabs").style.display = "none";

            document.getElementById("input-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("input-file").style.height = "calc(100% - var(--title-height))";

        }
    }

    /**
     * Handler for removing an input tab
     *
     * @param {event} mouseEvent
     */
    removeTabClick(mouseEvent) {
        if (!mouseEvent.srcElement) {
            return;
        }
        this.removeTab(mouseEvent.srcElement.parentElement.parentElement);

    }

    /**
     * Change the active tab to tabElement
     *
     * @param {Element} tabElement The tab element to change to
     */
    changeTab(tabElement) {
        const liItem = tabElement.parentElement;
        const newTabNum = liItem.id.replace("input-tab-", "");
        const currentTabNum = this.getActiveTab();
        const inputText = document.getElementById("input-text");

        document.getElementById(`input-tab-${currentTabNum}`).classList.remove("active-input-tab");
        liItem.classList.add("active-input-tab");

        this.inputs[currentTabNum] = inputText.value;

        if (this.fileBuffers[newTabNum]) {
            const fileObj = this.fileBuffers[newTabNum];
            this.setInputInfo(fileObj.size, 1);
            this.setFileInfo(fileObj);
            this.displayFilePreview();
        } else {
            inputText.value = this.inputs[newTabNum];
            inputText.style.overflow = "auto";
            inputText.classList.remove("blur");

            this.inputChange(null);
            document.getElementById("input-file").style.display = "none";
        }

        window.dispatchEvent(this.manager.statechange);

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
        this.changeTab(mouseEvent.srcElement);

    }

    /**
     * Display input information in the tab header
     *
     * @param {string|File} input
     */
    displayTabInfo(input) {
        const activeTabs = document.getElementsByClassName("active-input-tab");
        if (activeTabs.length > 0) {
            const activeTabContent = activeTabs.item(0).getElementsByClassName("input-tab-content")[0];
            if (input instanceof File) {
                activeTabContent.innerText = input.name;
            } else {
                if (input.length > 0) {
                    activeTabContent.innerText = input.slice(0, 100);
                } else {
                    activeTabContent.innerText = "New Tab";
                }
            }
        }

    }

    /**
     * Gets the number of the current active tab
     *
     * @returns {string}
     */
    getActiveTab() {
        const activeTabs = document.getElementsByClassName("active-input-tab");
        if (activeTabs.length > 0) {
            const activeTab = activeTabs.item(0);
            const activeTabNum = activeTab.id.replace("input-tab-", "");
            return activeTabNum;
        } else {
            throw "Could not find an active tab";
        }
    }

}

export default InputWaiter;
