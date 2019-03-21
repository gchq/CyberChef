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

        this.loaderWorker = null;
        this.fileBuffer = null;
    }


    /**
     * Gets the user's input from the input textarea.
     *
     * @returns {string}
     */
    get() {
        return this.fileBuffer || document.getElementById("input-text").value;
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
        if (input instanceof File) {
            this.setFile(input);
            inputText.value = "";
            this.setInputInfo(input.size, null);
        } else {
            inputText.value = input;
            this.closeFile();
            if (!silent) window.dispatchEvent(this.manager.statechange);
            const lines = input.length < (this.app.options.ioDisplayThreshold * 1024) ?
                input.count("\n") + 1 : null;
            this.setInputInfo(input.length, lines);
        }
    }


    /**
     * Shows file details.
     *
     * @param {File} file
     */
    setFile(file) {
        // Display file overlay in input area with details
        const fileOverlay = document.getElementById("input-file"),
            fileName = document.getElementById("input-file-name"),
            fileSize = document.getElementById("input-file-size"),
            fileType = document.getElementById("input-file-type"),
            fileLoaded = document.getElementById("input-file-loaded");

        this.fileBuffer = new ArrayBuffer();
        fileOverlay.style.display = "block";
        fileName.textContent = file.name;
        fileSize.textContent = file.size.toLocaleString() + " bytes";
        fileType.textContent = file.type || "unknown";
        fileLoaded.textContent = "0%";
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
     * Handler for input change events.
     *
     * @param {event} e
     *
     * @fires Manager#statechange
     */
    inputChange(e) {
        // Ignore this function if the input is a File
        if (this.fileBuffer) return;

        // Remove highlighting from input and output panes as the offsets might be different now
        this.manager.highlighter.removeHighlights();

        // Reset recipe progress as any previous processing will be redundant now
        this.app.progress = 0;

        // Update the input metadata info
        const inputText = this.get();
        const lines = inputText.length < (this.app.options.ioDisplayThreshold * 1024) ?
            inputText.count("\n") + 1 : null;

        this.setInputInfo(inputText.length, lines);

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
            this.loaderWorker.postMessage({"file": file});
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
        document.getElementById("input-text").classList.remove("dropping-file");
        document.getElementById("input-file").classList.remove("dropping-file");
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

        const file = e.dataTransfer.files[0];
        const text = e.dataTransfer.getData("Text");

        document.getElementById("input-text").classList.remove("dropping-file");
        document.getElementById("input-file").classList.remove("dropping-file");

        if (text) {
            this.closeFile();
            this.set(text);
            return;
        }

        if (file) {
            this.loadFile(file);
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
        const file = e.srcElement.files[0];
        this.loadFile(file);
    }


    /**
     * Handler for messages sent back by the LoaderWorker.
     *
     * @param {MessageEvent} e
     */
    handleLoaderMessage(e) {
        const r = e.data;
        if (r.hasOwnProperty("progress")) {
            const fileLoaded = document.getElementById("input-file-loaded");
            fileLoaded.textContent = r.progress + "%";
        }

        if (r.hasOwnProperty("error")) {
            this.app.alert(r.error, 10000);
        }

        if (r.hasOwnProperty("fileBuffer")) {
            log.debug("Input file loaded");
            this.fileBuffer = r.fileBuffer;
            this.displayFilePreview();
            window.dispatchEvent(this.manager.statechange);
        }
    }


    /**
     * Shows a chunk of the file in the input behind the file overlay.
     */
    displayFilePreview() {
        const inputText = document.getElementById("input-text"),
            fileSlice = this.fileBuffer.slice(0, 4096);

        inputText.style.overflow = "hidden";
        inputText.classList.add("blur");
        inputText.value = Utils.printable(Utils.arrayBufferToStr(fileSlice));
        if (this.fileBuffer.byteLength > 4096) {
            inputText.value += "[truncated]...";
        }
    }


    /**
     * Handler for file close events.
     */
    closeFile() {
        if (this.loaderWorker) this.loaderWorker.terminate();
        this.fileBuffer = null;
        document.getElementById("input-file").style.display = "none";
        const inputText = document.getElementById("input-text");
        inputText.style.overflow = "auto";
        inputText.classList.remove("blur");
    }


    /**
     * Loads a file into the input.
     *
     * @param {File} file
     */
    loadFile(file) {
        if (file) {
            this.closeFile();
            this.loaderWorker = new LoaderWorker();
            this.loaderWorker.addEventListener("message", this.handleLoaderMessage.bind(this));
            this.loaderWorker.postMessage({"file": file});
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
        this.closeFile();
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
     * Handler for adding a new input tab.
     *
     */
    addTab() {
        const tabWrapper = document.getElementById("input-tabs");
        const tabsList = tabWrapper.children[0];
        const lastTabNum = tabsList.lastElementChild.id.replace("input-tab-", "");
        const newTabNum = parseInt(lastTabNum, 10) + 1;

        tabWrapper.style.display = "block";

        // Resize highlighter
        // document.getElementById("input-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

        const activeTabElements = document.getElementsByClassName("active-input-tab");
        for (let i = 0; i < activeTabElements.length; i++) {
            activeTabElements.item(i).classList.remove("active-input-tab");
        }

        const newTab = document.createElement("li");
        newTab.id = `input-tab-${newTabNum}`;
        newTab.classList.add("active-input-tab");

        const newTabContent = document.createElement("div");
        newTabContent.classList.add("input-tab-content");
        newTabContent.innerText = `Tab ${newTabNum}`;

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

        const multiWrapper = document.getElementById("multi-input-wrapper");

        const activeAreaElements = document.getElementsByClassName("active-input-area");
        for (let i = 0; i < activeAreaElements.length; i++) {
            activeAreaElements.item(i).classList.remove("active-input-area");
        }

        const newTextAreaWrapper = document.createElement("div");
        newTextAreaWrapper.className = "textarea-wrapper no-select input-wrapper active-input-area";
        newTextAreaWrapper.id = `tab-input-area-${newTabNum}`;

        const newTextArea = document.createElement("textarea");
        newTextArea.id = `input-text-${newTabNum}`;
        newTextArea.spellcheck = "false";
        newTextArea.classList.add("input-text");

        const newFileArea = document.createElement("div");
        newFileArea.id = `input-file-${newTabNum}`;
        newFileArea.classList.add("input-file");

        const newFileOverlay = document.createElement("div");
        newFileOverlay.classList.add("file-overlay");

        const newFileWrapper = document.createElement("div");
        newFileWrapper.style.position = "relative";
        newFileWrapper.style.height = "100%";

        const newFileCard = document.createElement("div");
        newFileCard.className = "io-card card";

        const newFileThumb = document.createElement("img");
        newFileThumb["aria-hidden"] = "true";
        newFileThumb.src = require("./static/images/file-128x128.png");
        newFileThumb.alt = "File icon";
        newFileThumb.id = `input-file-thumbnail-${newTabNum}`;

        const newFileCardBody = document.createElement("div");
        newFileCardBody.class = "card-body";

        const newFileCloseButton = document.createElement("button");
        newFileCloseButton.type = "button";
        newFileCloseButton.class = "close";
        newFileCloseButton.id = `input-file-close-${newTabNum}`;
        newFileCloseButton.innerHTML = "&times;";

        newFileCardBody.appendChild(newFileCloseButton);

        const cardInfo = `
        Name: <span id="input-file-name-${newTabNum}"></span><br>
        Size: <span id="input-file-size-${newTabNum}"></span><br>
        Type: <span id="input-file-type-${newTabNum}"></span><br>
        Loaded: <span id="input-file-loaded-${newTabNum}"></span>`;

        newFileCardBody.innerHTML = newFileCardBody.innerHTML + cardInfo;

        newFileCard.appendChild(newFileThumb);
        newFileCard.appendChild(newFileCardBody);
        newFileWrapper.appendChild(newFileCard);
        newFileArea.appendChild(newFileOverlay);
        newFileArea.appendChild(newFileWrapper);

        newTextAreaWrapper.appendChild(newTextArea);
        newTextAreaWrapper.appendChild(newFileArea);
        multiWrapper.appendChild(newTextAreaWrapper);

        // file inputs!
    }

    /**
     * Handler for removing an input tab
     *
     * @param {event} mouseEvent
     */
    removeTab(mouseEvent) {
        if (!mouseEvent.path) {
            return;
        }
        const closeBtn = mouseEvent.path[1];
        const liItem = closeBtn.parentElement;
        const tabList = liItem.parentElement;
        if (tabList.children.length > 1) {
            if (liItem.classList.contains("active-input-tab")) {
                // If current tab is active, change the active tab and input to another tab
                let newActiveAreaId;
                if (liItem.previousElementSibling) {
                    liItem.previousElementSibling.classList.add("active-input-tab");
                    const newActiveTabNum = liItem.previousElementSibling.id.replace("input-tab-", "");
                    newActiveAreaId = `tab-input-area-${newActiveTabNum}`;
                } else if (liItem.nextElementSibling) {
                    liItem.nextElementSibling.classList.add("active-input-tab");
                    const newActiveTabNum = liItem.nextElementSibling.id.replace("input-tab-", "");
                    newActiveAreaId = `tab-input-area-${newActiveTabNum}`;
                }

                if (newActiveAreaId) {
                    document.getElementById(newActiveAreaId).classList.add("active-input-area");
                }
            }
            const tabNum = liItem.id.replace("input-tab-", "");
            const multiInputArea = document.getElementById("multi-input-wrapper");
            const inputAreaId = `tab-input-area-${tabNum}`;
            const inputArea = document.getElementById(inputAreaId);

            tabList.removeChild(liItem);
            multiInputArea.removeChild(inputArea);
        }
        if (tabList.children.length === 1) {
            document.getElementById("input-tabs").style.display = "none";
            // document.getElementById("input-highlighter").style.height = "calc(100% - var(--title-height))";
        }
    }

    /**
     * Handler for changing tabs
     *
     * @param {event} mouseEvent
     */
    changeTab(mouseEvent) {
        if (!mouseEvent.path) {
            return;
        }
        const tabContent = mouseEvent.path[0];
        const liItem = tabContent.parentElement;
        const tabNum = liItem.id.replace("input-tab-", "");

        const activeTabsList = document.getElementsByClassName("active-input-tab");
        for (let i = 0; i < activeTabsList.length; i++) {
            activeTabsList.item(i).classList.remove("active-input-tab");
        }

        const activeAreaList = document.getElementsByClassName("active-input-area");
        for (let i = 0; i < activeAreaList.length; i++) {
            activeAreaList.item(i).classList.remove("active-input-area");
        }
        liItem.classList.add("active-input-tab");

        const newActiveAreaId = `tab-input-area-${tabNum}`;
        document.getElementById(newActiveAreaId).classList.add("active-input-area");

    }

}

export default InputWaiter;
