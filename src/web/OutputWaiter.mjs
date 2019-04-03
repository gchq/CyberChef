/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../core/Utils";
import FileSaver from "file-saver";
import zip from "zlibjs/bin/zip.min";

const Zlib = zip.Zlib;

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

        this.outputs = [];
        this.maxTabs = 4; // Calculate this
    }

    /**
     * Gets the output for the specified input number
     *
     * @param {number} inputNum
     * @returns {string | ArrayBuffer}
     */
    getOutput(inputNum) {
        const index = this.getOutputIndex(inputNum);
        if (index === -1) return -1;

        log.error(this.outputs[index]);
        if (typeof this.outputs[index].data.dish.value === "string") {
            return this.outputs[index].data.dish.value;
        } else {
            return this.outputs[index].data.dish.value || "";
        }
    }

    /**
     * Gets the index of the output for the specified input number
     *
     * @param {number} inputNum
     * @returns {number}
     */
    getOutputIndex(inputNum) {
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].inputNum === inputNum) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Gets the output string or FileBuffer for the active input
     *
     * @returns {string | ArrayBuffer}
     */
    getActive() {
        return this.getOutput(this.getActiveTab());
    }

    /**
     * Adds a new output to the output array.
     * Creates a new tab if we have less than maxtabs tabs open
     *
     * @param {number} inputNum
     * @param {boolean} [changeTab=true]
     */
    addOutput(inputNum, changeTab = true) {
        const index = this.getOutputIndex(inputNum);
        if (index !== -1) {
            // Remove the output if it already exists
            this.outputs.splice(index, 1);
        }
        const newOutput = {
            data: null,
            inputNum: inputNum,
            // statusMessage: `Input ${inputNum} has not been baked yet.`,
            statusMessage: "",
            error: null,
            status: "inactive"
        };

        this.outputs.push(newOutput);

        // add new tab
        this.addTab(inputNum, changeTab);
        return this.outputs.indexOf(newOutput);
    }

    /**
     * Updates the value for the output in the output array.
     * If this is the active output tab, updates the output textarea
     *
     * @param {Object} data
     * @param {number} inputNum
     */
    updateOutputValue(data, inputNum) {
        let index = this.getOutputIndex(inputNum);
        if (index === -1) {
            index = this.addOutput(inputNum);
        }

        this.outputs[index].data = data;

        // set output here
        this.set(inputNum);
    }

    /**
     * Updates the status message for the output in the output array.
     * If this is the active output tab, updates the output textarea
     *
     * @param {string} statusMessage
     * @param {number} inputNum
     */
    updateOutputMessage(statusMessage, inputNum) {
        const index = this.getOutputIndex(inputNum);
        if (index === -1) return;

        this.outputs[index].statusMessage = statusMessage;
        this.set(inputNum);
    }

    /**
     * Updates the error value for the output in the output array.
     * If this is the active output tab, calls app.handleError.
     * Otherwise, the error will be handled when the output is switched to
     *
     * @param {Error} error
     * @param {number} inputNum
     */
    updateOutputError(error, inputNum) {
        const index = this.getOutputIndex(inputNum);
        if (index === -1) return;

        this.outputs[index].error = error;

        // call handle error here
        // or make the error handling part of set()
        this.set(inputNum);
    }

    /**
     * Updates the status value for the output in the output array
     *
     * @param {string} status
     * @param {number} inputNum
     */
    updateOutputStatus(status, inputNum) {
        const index = this.getOutputIndex(inputNum);
        if (index === -1) return;

        this.outputs[index].status = status;

        this.set(inputNum);
    }

    /**
     * Removes an output from the output array.
     *
     * @param {number} inputNum
     */
    removeOutput(inputNum) {
        const index = this.getOutputIndex(inputNum);
        if (index === -1) return;

        this.outputs.splice(index, 1);
    }

    /**
     * Sets the output in the output textarea.
     *
     * @param {number} inputNum
     */
    set(inputNum) {
        const outputIndex = this.getOutputIndex(inputNum);
        if (outputIndex === -1) return;
        const output = this.outputs[outputIndex];
        const outputText = document.getElementById("output-text");
        const outputHtml = document.getElementById("output-html");
        const outputFile = document.getElementById("output-file");
        const outputHighlighter = document.getElementById("output-highlighter");
        const inputHighlighter = document.getElementById("input-highlighter");
        // If inactive, show blank
        // If pending or baking, show loader and status message
        // If error, style the tab and handle the error
        // If done, display the output if it's the active tab

        if (output.status === "inactive") {
            // An output is inactive when it has been created but has not been baked at all
            // show a blank here
            if (inputNum === this.getActiveTab()) {
                this.toggleLoader(false);
                outputText.style.display = "block";
                outputHtml.style.display = "none";
                outputFile.style.display = "none";
                outputHighlighter.display = "block";
                inputHighlighter.display = "block";

                outputText.value = "";
                outputHtml.innerHTML = "";

            }
        } else if (output.status === "pending" || output.status === "baking") {
            // show the loader and the status message if it's being shown
            // otherwise don't do anything
            if (inputNum === this.getActiveTab()) {
                this.toggleLoader(true);

                document.querySelector("#output-loader .loading-msg").textContent = output.statusMessage;
            }

        } else if (output.status === "error") {
            // style the tab if it's being shown
            // run app.handleError()
            if (inputNum === this.getActiveTab()) {
                this.toggleLoader(false);
            }
        } else if (output.status === "baked") {
            // Display the output if it's the active tab
            this.displayTabInfo(inputNum);
            if (inputNum === this.getActiveTab()) {
                this.toggleLoader(false);
                this.closeFile();
                let scriptElements, lines, length;

                switch (output.data.type) {
                    case "html":
                        outputText.style.display = "none";
                        outputHtml.style.display = "block";
                        outputFile.style.display = "none";
                        outputHighlighter.style.display = "none";
                        inputHighlighter.style.display = "none";

                        outputText.value = "";
                        outputHtml.innerHTML = output.data.result;

                        // Execute script sections
                        scriptElements = outputHtml.querySelectorAll("script");
                        for (let i = 0; i < scriptElements.length; i++) {
                            try {
                                eval(scriptElements[i].innerHTML); // eslint-disable-line no-eval
                            } catch (err) {
                                log.error(err);
                            }
                        }

                        break;
                    case "ArrayBuffer":
                        outputText.style.display = "block";
                        outputHtml.style.display = "none";
                        outputHighlighter.display = "none";
                        inputHighlighter.display = "none";

                        outputText.value = "";
                        outputHtml.innerHTML = "";
                        length = output.data.result.byteLength;

                        this.setFile(output.data.result);
                        break;
                    case "string":
                    default:
                        outputText.style.display = "block";
                        outputHtml.style.display = "none";
                        outputFile.style.display = "none";
                        outputHighlighter.display = "block";
                        inputHighlighter.display = "block";

                        outputText.value = Utils.printable(output.data.result, true);
                        outputHtml.innerHTML = "";

                        lines = output.data.result.count("\n") + 1;
                        length = output.data.result.length;
                        break;
                }
            }
        }
    }

    /**
     * Shows file details
     *
     * @param {ArrayBuffer} buf
     */
    setFile(buf) {
        const file = new File([buf], "output.dat");

        // Display file overlay in output area with details
        const fileOverlay = document.getElementById("output-file"),
            fileSize = document.getElementById("output-file-size"),
            outputText = document.getElementById("output-text"),
            fileSlice = buf.slice(0, 4096);

        fileOverlay.style.display = "block";
        fileSize.textContent = file.size.toLocaleString() + " bytes";

        outputText.classList.add("blur");
        outputText.value = Utils.printable(Utils.arrayBufferToStr(fileSlice));
    }

    /**
     * Clears output file details
     */
    closeFile() {
        document.getElementById("output-file").style.display = "none";
        document.getElementById("output-text").classList.remove("blur");
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
     * @param {boolean} value - true == show loader
     */
    toggleLoader(value) {
        clearTimeout(this.appendBombeTimeout);
        clearTimeout(this.outputLoaderTimeout);

        const outputLoader = document.getElementById("output-loader"),
            outputElement = document.getElementById("output-text"),
            animation = document.getElementById("output-loader-animation");

        if (value) {
            this.manager.controls.hideStaleIndicator();

            // Start a timer to add the Bombe to the DOM just before we make it
            // visible so that there is no stuttering
            this.appendBombeTimeout = setTimeout(function() {
                animation.appendChild(this.bombeEl);
            }.bind(this), 150);

            // Show the loading screen
            this.outputLoaderTimeout = setTimeout(function() {
                outputElement.disabled = true;
                outputLoader.style.visibility = "visible";
                outputLoader.style.opacity = 1;
            }.bind(this), 200);
        } else {
            // Remove the Bombe from the DOM to save resources
            this.outputLoaderTimeout = setTimeout(function () {
                try {
                    animation.removeChild(this.bombeEl);
                } catch (err) {}
            }.bind(this), 500);
            outputElement.disabled = false;
            outputLoader.style.opacity = 0;
            outputLoader.style.visibility = "hidden";
            // this.setStatusMsg("");
        }
    }

    /**
     * Handler for save click events.
     * Saves the current output to a file.
     */
    saveClick() {
        this.downloadFile(this.getActiveTab());
    }

    /**
     * Handler for file download events.
     */
    async downloadFile() {
        const fileName = window.prompt("Please enter a filename: ", "download.dat");
        const file = new File([this.getActive()], fileName);
        FileSaver.saveAs(file, fileName, false);
    }

    /**
     * Handler for save all click event
     * Saves all outputs to a single archvie file
     */
    saveAllClick() {
        this.downloadAllFiles();
    }

    /**
     * Handler for download all files events.
     */
    async downloadAllFiles() {
        const fileName = window.prompt("Please enter a filename: ", "download.zip");
        const fileExt = window.prompt("Please enter a file extension for the files: ", ".txt");
        const zip = new Zlib.Zip();
        for (let i = 0; i < this.outputs.length; i++) {
            const name = Utils.strToByteArray(this.outputs[i].inputNum + fileExt);
            log.error(this.getOutput(this.outputs[i].inputNum));
            let out = this.getOutput(this.outputs[i].inputNum);
            if (typeof out === "string") {
                out = Utils.strToUtf8ByteArray(out);
            }
            out = new Uint8Array(out);
            log.error(out);
            // options.filename = Utils.strToByteArray(this.outputs[i].inputNum + ".dat");
            zip.addFile(out, {filename: name});
        }
        const file = new File([zip.compress()], fileName);
        FileSaver.saveAs(file, fileName, false);
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

        if (numTabs < this.maxTabs) {
            // Create a new tab element
            const newTab = this.createTabElement(inputNum);

            tabsWrapper.appendChild(newTab);

            if (numTabs > 0) {
                tabsWrapper.parentElement.style.display = "block";

                const tabButtons = document.getElementsByClassName("output-tab-buttons");
                for (let i = 0; i < tabButtons.length; i++) {
                    tabButtons.item(i).style.display = "inline-block";
                }

                document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-loader").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            }
        }

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
        const currentNum = this.getActiveTab();
        if (this.getOutputIndex(inputNum) === -1) return;

        const tabsWrapper = document.getElementById("output-tabs");
        const tabs = tabsWrapper.children;

        let found = false;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs.item(i).getAttribute("inputNum") === inputNum.toString()) {
                tabs.item(i).classList.add("active-output-tab");
                found = true;
            } else {
                tabs.item(i).classList.remove("active-output-tab");
            }
        }
        if (!found) {
            let direction = "right";
            if (currentNum > inputNum) {
                direction = "left";
            }

            const newOutputs = this.getNearbyNums(inputNum, direction);
            for (let i = 0; i < newOutputs.length; i++) {
                tabs.item(i).setAttribute("inputNum", newOutputs[i].toString());
                this.displayTabInfo(newOutputs[i]);
                if (newOutputs[i] === inputNum) {
                    tabs.item(i).classList.add("active-output-tab");
                }
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
        if (!mouseEvent.srcElement) return;
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
        const currentOutput = this.getOutputIndex(currentTab);
        if (currentOutput > 0) {
            this.changeTab(this.getPreviousInputNum(currentTab), this.app.options.syncTabs);
        } else {
            this.changeTab(this.getSmallestInputNum(), this.app.options.syncTabs);
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
        if (this.getOutputIndex(tabNum)) {
            this.changeTab(tabNum, this.app.options.syncTabs);
        }
    }

    /**
     * Generates a list of the nearby inputNums
     *
     * @param {number} inputNum
     * @param {string} direction
     */
    getNearbyNums(inputNum, direction) {
        const nums = [];
        if (direction === "left") {
            let reachedEnd = false;
            for (let i = 0; i < this.maxTabs; i++) {
                let newNum;
                if (i === 0) {
                    newNum = inputNum;
                } else {
                    newNum = this.getNextInputNum(nums[i-1]);
                }
                if (newNum === nums[i-1]) {
                    reachedEnd = true;
                    nums.sort(function(a, b) {
                        return b - a;
                    });
                }
                if (reachedEnd) {
                    newNum = this.getPreviousInputNum(nums[i-1]);
                }
                if (newNum >= 0) {
                    nums.push(newNum);
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
                        newNum = this.getPreviousInputNum(nums[i-1]);
                    }
                    if (newNum === nums[i-1]) {
                        reachedEnd = true;
                        nums.sort(function(a, b) {
                            return b - a;
                        });
                    }
                    if (reachedEnd) {
                        newNum = this.getNextInputNum(nums[i-1]);
                    }
                }
                if (newNum >= 0) {
                    nums.push(newNum);
                }
            }
        }
        nums.sort(function(a, b) {
            return a - b;
        });
        return nums;
    }

    /**
     * Gets the largest inputNum
     *
     * @returns {number}
     */
    getLargestInputNum() {
        let largest = 0;
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].inputNum > largest) {
                largest = this.outputs[i].inputNum;
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
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].inputNum < smallest) {
                smallest = this.outputs[i].inputNum;
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
        let num = this.getSmallestInputNum();
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].inputNum < inputNum) {
                if (this.outputs[i].inputNum > num) {
                    num = this.outputs[i].inputNum;
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
        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].inputNum > inputNum) {
                if (this.outputs[i].inputNum < num) {
                    num = this.outputs[i].inputNum;
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
        let activeTab = this.getActiveTab();
        if (this.getOutputIndex(inputNum) === -1) return;

        const tabElement = this.getTabItem(inputNum);

        this.removeOutput(inputNum);

        if (tabElement !== null) {
            // find new tab number?
            if (inputNum === activeTab) {
                activeTab = this.getPreviousInputNum(activeTab);
                if (activeTab === this.getActiveTab()) {
                    activeTab = this.getNextInputNum(activeTab);
                }
            }
            this.refreshTabs(activeTab);
        }
    }

    /**
     * Redraw the entire tab bar to remove any outdated tabs
     * @param {number} activeTab
     */
    refreshTabs(activeTab) {
        const tabsList = document.getElementById("output-tabs");
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

            const tabButtons = document.getElementsByClassName("output-tab-buttons");
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons.item(i).style.display = "inline-block";
            }

            document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-loader").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

        } else {
            tabsList.parentElement.style.display = "none";

            const tabButtons = document.getElementsByClassName("output-tab-buttons");
            for (let i = 0; i < tabButtons.length; i++) {
                tabButtons.item(i).style.display = "none";
            }

            document.getElementById("output-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-highlighter").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-file").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-loader").style.height = "calc(100% - var(--title-height))";
        }

        this.changeTab(activeTab);

    }

    /**
     * Creates a new tab element to be added to the tab bar
     *
     * @param {number} inputNum
     */
    createTabElement(inputNum) {
        const newTab = document.createElement("li");
        newTab.setAttribute("inputNum", inputNum.toString());

        const newTabContent = document.createElement("div");
        newTabContent.classList.add("output-tab-content");
        newTabContent.innerText = `Tab ${inputNum.toString()}`;

        // Do we want remove tab button on output?
        newTab.appendChild(newTabContent);

        return newTab;
    }

    /**
     * Gets the number of the current active tab
     *
     * @returns {number}
     */
    getActiveTab() {
        const activeTabs = document.getElementsByClassName("active-output-tab");
        if (activeTabs.length > 0) {
            const activeTab = activeTabs.item(0);
            const tabNum = activeTab.getAttribute("inputNum");
            return parseInt(tabNum, 10);
        }
        return -1;
    }

    /**
     * Gets the li element for a tab
     *
     * @param {number} inputNum
     */
    getTabItem(inputNum) {
        const tabs = document.getElementById("output-tabs").children;
        for (let i = 0; i < tabs.length; i++) {
            if (parseInt(tabs.item(i).getAttribute("inputNum"), 10) === inputNum) {
                return tabs.item(i);
            }
        }
    }

    /**
     * Display output information in the tab header
     *
     * @param {number} inputNum
     */
    displayTabInfo(inputNum) {
        const tabItem = this.getTabItem(inputNum);

        if (!tabItem) return;

        const tabContent = tabItem.firstElementChild;

        tabContent.innerText = `Tab ${inputNum}`;

    }
}

export default OutputWaiter;
