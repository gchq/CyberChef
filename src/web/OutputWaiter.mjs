/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../core/Utils";
import FileSaver from "file-saver";
import ZipWorker from "worker-loader?inline&fallback=false!./ZipWorker";

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

        this.outputs = {};
        this.activeTab = -1;

        this.zipWorker = null;

        this.maxTabs = 4; // Calculate this
    }

    /**
     * Calculates the maximum number of tabs to display
     */
    calcMaxTabs() {
        const numTabs = Math.floor((document.getElementById("IO").offsetWidth - 75)  / 120);
        this.maxTabs = numTabs;
    }

    /**
     * Gets the output for the specified input number
     *
     * @param {number} inputNum - The input to get the output for
     * @param {boolean} [raw=true] - If true, returns the raw data instead of the presented result.
     * @returns {string | ArrayBuffer}
     */
    getOutput(inputNum, raw=true) {
        if (this.outputs[inputNum] === undefined || this.outputs[inputNum] === null) return -1;

        if (this.outputs[inputNum].data === null) return "";

        if (raw) {
            let data = this.outputs[inputNum].data.dish.value;
            if (Array.isArray(data)) {
                data = new Uint8Array(data.length);

                for (let i = 0; i < data.length; i++) {
                    data[i] = this.outputs[inputNum].data.dish.value[i];
                }

                data = data.buffer;
            } else if (typeof data !== "object" && typeof data !== "string") {
                data = String(data);
            }
            return data;
        } else if (typeof this.outputs[inputNum].data.result === "string") {
            return this.outputs[inputNum].data.result;
        } else {
            return this.outputs[inputNum].data.result || "";
        }
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
     * Gets the output string or FileBuffer for the active input
     *
     * @param {boolean} [raw=true] - If true, returns the raw data instead of the presented result.
     * @returns {string | ArrayBuffer}
     */
    getActive(raw=true) {
        return this.getOutput(this.getActiveTab(), raw);
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
            progress: false
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

        this.outputs[inputNum].data = data;

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

        this.set(inputNum);
    }

    /**
     * Updates the stored bake ID for the output in the ouptut array
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
     * @param {number} inputNum
     */
    updateOutputProgress(progress, inputNum) {
        if (!this.outputExists(inputNum)) return;
        this.outputs[inputNum].progress = progress;
    }

    /**
     * Removes an output from the output array.
     *
     * @param {number} inputNum
     */
    removeOutput(inputNum) {
        if (!this.outputExists(inputNum)) return;

        delete (this.outputs[inputNum]);
    }

    /**
     * Removes all output tabs
     */
    removeAllOutputs() {
        this.outputs = {};
        const tabs = document.getElementById("output-tabs").children;
        for (let i = tabs.length - 1; i >= 0; i--) {
            tabs.item(i).remove();
        }
    }

    /**
     * Sets the output in the output textarea.
     *
     * @param {number} inputNum
     */
    async set(inputNum) {
        return new Promise(async function(resolve, reject) {
            const output = this.outputs[inputNum];
            if (output === undefined || output === null) return;
            if (typeof inputNum !== "number") inputNum = parseInt(inputNum, 10);

            if (inputNum !== this.getActiveTab()) return;

            this.toggleLoader(true);

            const outputText = document.getElementById("output-text");
            const outputHtml = document.getElementById("output-html");
            const outputFile = document.getElementById("output-file");
            const outputHighlighter = document.getElementById("output-highlighter");
            const inputHighlighter = document.getElementById("input-highlighter");
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

            if (output.progress !== undefined) {
                this.manager.recipe.updateBreakpointIndicator(output.progress);
            } else {
                this.manager.recipe.updateBreakpointIndicator(false);
            }

            document.getElementById("show-file-overlay").style.display = "none";

            if (output.status === "pending" || output.status === "baking") {
                // show the loader and the status message if it's being shown
                // otherwise don't do anything
                document.querySelector("#output-loader .loading-msg").textContent = output.statusMessage;
            } else if (output.status === "error") {
                // style the tab if it's being shown
                this.toggleLoader(false);
                outputText.style.display = "block";
                outputText.classList.remove("blur");
                outputHtml.style.display = "none";
                outputFile.style.display = "none";
                outputHighlighter.display = "none";
                inputHighlighter.display = "none";

                outputText.value = output.error;
                outputHtml.innerHTML = "";
            } else if (output.status === "baked" || output.status === "inactive") {
                document.querySelector("#output-loader .loading-msg").textContent = `Loading output ${inputNum}`;
                this.displayTabInfo(inputNum);
                this.closeFile();
                let scriptElements, lines, length;

                if (output.data === null) {
                    outputText.style.display = "block";
                    outputHtml.style.display = "none";
                    outputFile.style.display = "none";
                    outputHighlighter.display = "block";
                    inputHighlighter.display = "block";

                    outputText.value = "";
                    outputHtml.innerHTML = "";

                    lines = 0;
                    length = 0;
                    this.toggleLoader(false);
                    return;
                }

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
                        this.setFile(await this.getDishBuffer(output.data.dish));
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
                this.toggleLoader(false);

                if (output.data.type === "html") {
                    const dishStr = await this.getDishStr(output.data.dish);
                    length = dishStr.length;
                    lines = dishStr.count("\n") + 1;
                }

                this.setOutputInfo(length, lines, output.data.duration);
                this.backgroundMagic();
            }
        }.bind(this));
    }

    /**
     * Shows file details
     *
     * @param {ArrayBuffer} buf
     */
    setFile(buf) {
        // Display file overlay in output area with details
        const fileOverlay = document.getElementById("output-file"),
            fileSize = document.getElementById("output-file-size"),
            outputText = document.getElementById("output-text"),
            fileSlice = buf.slice(0, 4096);

        fileOverlay.style.display = "block";
        fileSize.textContent = buf.byteLength.toLocaleString() + " bytes";

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
     * Retrieves the dish as a string, returning the cached version if possible.
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
     * Retrieves the dish as an ArrayBuffer, returning the cached version if possible.
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
        clearTimeout(this.appendBombeTimeout);
        clearTimeout(this.outputLoaderTimeout);

        const outputLoader = document.getElementById("output-loader"),
            outputElement = document.getElementById("output-text"),
            animation = document.getElementById("output-loader-animation");

        if (value) {
            this.manager.controls.hideStaleIndicator();

            // Don't add the bombe if it's already there!
            if (animation.children.length > 0) return;

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
            }, 200);
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
        let fileName = window.prompt("Please enter a filename: ", "download.dat");

        if (fileName === null) fileName = "download.dat";

        const file = new File([this.getActive(true)], fileName);
        FileSaver.saveAs(file, fileName, false);
    }

    /**
     * Handler for save all click event
     * Saves all outputs to a single archvie file
     */
    saveAllClick() {
        const downloadButton = document.getElementById("save-all-to-file");
        if (downloadButton.firstElementChild.innerHTML === "archive") {
            this.downloadAllFiles();
        } else if (window.confirm("Cancel zipping of outputs?")) {
            this.terminateZipWorker();
        }
    }


    /**
     * Spawns a new ZipWorker and sends it the outputs so that they can
     * be zipped for download
     */
    async downloadAllFiles() {
        return new Promise(resolve => {
            const inputNums = Object.keys(this.outputs);
            for (let i = 0; i < inputNums.length; i++) {
                const iNum = inputNums[i];
                if (this.outputs[iNum].status !== "baked" ||
                this.outputs[iNum].bakeId !== this.manager.worker.bakeId) {
                    if (window.confirm("Not all outputs have been baked yet. Continue downloading outputs?")) {
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
                outputs: this.outputs,
                filename: fileName,
                fileExtension: fileExt
            });
            this.zipWorker.addEventListener("message", this.handleZipWorkerMessage.bind(this));
        });
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
        if (!r.hasOwnProperty("zippedFile")) {
            log.error("No zipped file was sent in the message.");
            this.terminateZipWorker();
            return;
        }
        if (!r.hasOwnProperty("filename")) {
            log.error("No filename was sent in the message.");
            this.terminateZipWorker();
            return;
        }

        const file = new File([r.zippedFile], r.filename);
        FileSaver.saveAs(file, r.filename, false);

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

        if (this.getTabItem(inputNum) === undefined && numTabs < this.maxTabs) {
            // Create a new tab element
            const newTab = this.createTabElement(inputNum);

            tabsWrapper.appendChild(newTab);

            if (numTabs > 0) {
                tabsWrapper.parentElement.style.display = "block";

                document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("output-loader").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
                document.getElementById("show-file-overlay").style.top = "calc(var(--tab-height) + var(--title-height) + 10px)";

                document.getElementById("save-all-to-file").style.display = "inline-block";
            } else {
                tabsWrapper.parentElement.style.display = "none";

                document.getElementById("output-wrapper").style.height = "calc(100% - var(--title-height))";
                document.getElementById("output-highlighter").style.height = "calc(100% - var(--title-height))";
                document.getElementById("output-file").style.height = "calc(100% - var(--title-height))";
                document.getElementById("output-loader").style.height = "calc(100% - var(--title-height))";
                document.getElementById("show-file-overlay").style.top = "calc(var(--title-height) + 10px)";

                document.getElementById("save-all-to-file").style.display = "none";
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
        if (!this.outputExists(inputNum)) return;
        const currentNum = this.getActiveTab();

        this.hideMagicButton();

        this.manager.highlighter.removeHighlights();
        getSelection().removeAllRanges();

        const tabsWrapper = document.getElementById("output-tabs");
        const tabs = tabsWrapper.children;

        let found = false;
        for (let i = 0; i < tabs.length; i++) {
            if (tabs.item(i).getAttribute("inputNum") === inputNum.toString()) {
                tabs.item(i).classList.add("active-output-tab");
                this.activeTab = inputNum;
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
                    this.activeTab = inputNum;
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
        if (!mouseEvent.target) return;
        const tabNum = mouseEvent.target.parentElement.getAttribute("inputNum");
        if (tabNum) {
            this.changeTab(parseInt(tabNum, 10), this.app.options.syncTabs);
        }
    }

    /**
     * Handler for changing to the left tab
     */
    changeTabLeft() {
        const currentTab = this.getActiveTab();
        this.changeTab(this.getPreviousInputNum(currentTab), this.app.options.syncTabs);
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
            if (i === 0) {
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
        const inputNums = Object.keys(this.outputs);
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = parseInt(inputNums[i], 10);
            if (iNum > largest) {
                largest = iNum;
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
        const inputNums = Object.keys(this.outputs);
        for (let i = 0; i < inputNums.length; i++) {
            const iNum = parseInt(inputNums[i], 10);
            if (iNum < smallest) {
                smallest = iNum;
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
        const inputNums = Object.keys(this.outputs);
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
        let num = this.getLargestInputNum();
        const inputNums = Object.keys(this.outputs);
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
        let activeTab = this.getActiveTab();

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

            document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("output-loader").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
            document.getElementById("show-file-overlay").style.top = "calc(var(--tab-height) + var(--title-height) + 10px)";

            document.getElementById("save-all-to-file").style.display = "inline-block";

        } else {
            tabsList.parentElement.style.display = "none";

            document.getElementById("output-wrapper").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-highlighter").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-file").style.height = "calc(100% - var(--title-height))";
            document.getElementById("output-loader").style.height = "calc(100% - var(--title-height))";
            document.getElementById("show-file-overlay").style.top = "calc(var(--title-height) + 10px)";

            document.getElementById("save-all-to-file").style.display = "none";
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
        return this.activeTab;
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

    /**
     * Displays information about the output.
     *
     * @param {number} length - The length of the current output string
     * @param {number} lines - The number of the lines in the current output string
     * @param {number} duration - The length of time (ms) it took to generate the output
     */
    setOutputInfo(length, lines, duration) {
        if (!length) return;
        let width = length.toString().length;
        width = width < 4 ? 4 : width;

        const lengthStr = length.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
        const timeStr = (duration.toString() + "ms").padStart(width, " ").replace(/ /g, "&nbsp;");

        let msg = "time: " + timeStr + "<br>length: " + lengthStr;

        if (typeof lines === "number") {
            const linesStr = lines.toString().padStart(width, " ").replace(/ /g, "&nbsp;");
            msg += "<br>lines: " + linesStr;
        }

        document.getElementById("output-info").innerHTML = msg;
        document.getElementById("input-selection-info").innerHTML = "";
        document.getElementById("output-selection-info").innerHTML = "";
    }

    /**
     * Triggers the BackgroundWorker to attempt Magic on the current output.
     */
    async backgroundMagic() {
        this.hideMagicButton();
        if (!this.app.options.autoMagic || !this.getActive(true)) return;
        const dish = this.outputs[this.getActiveTab()].data.dish;
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
        if (!options.length ||
            !options[0].recipe.length)
            return;

        const currentRecipeConfig = this.app.getRecipeConfig();
        const newRecipeConfig = currentRecipeConfig.concat(options[0].recipe);
        const opSequence = options[0].recipe.map(o => o.op).join(", ");

        this.showMagicButton(opSequence, options[0].data, newRecipeConfig);
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
     * Displays the Magic button with a title and adds a link to a complete recipe.
     *
     * @param {string} opSequence
     * @param {string} result
     * @param {Object[]} recipeConfig
     */
    showMagicButton(opSequence, result, recipeConfig) {
        const magicButton = document.getElementById("magic");
        magicButton.setAttribute("data-original-title", `<i>${opSequence}</i> will produce <span class="data-text">"${Utils.escapeHtml(Utils.truncate(result), 30)}"</span>`);
        magicButton.setAttribute("data-recipe", JSON.stringify(recipeConfig), null, "");
        magicButton.classList.remove("hidden");
    }


    /**
     * Hides the Magic button and resets its values.
     */
    hideMagicButton() {
        const magicButton = document.getElementById("magic");
        magicButton.classList.add("hidden");
        magicButton.setAttribute("data-recipe", "");
        magicButton.setAttribute("data-original-title", "Magic!");
    }


    /**
     * Handler for file slice display events.
     */
    async displayFileSlice() {
        document.querySelector("#output-loader .loading-msg").textContent = "Loading file slice...";
        this.toggleLoader(true);
        const outputText = document.getElementById("output-text"),
            outputHtml = document.getElementById("output-html"),
            outputFile = document.getElementById("output-file"),
            outputHighlighter = document.getElementById("output-highlighter"),
            inputHighlighter = document.getElementById("input-highlighter"),
            showFileOverlay = document.getElementById("show-file-overlay"),
            sliceFromEl = document.getElementById("output-file-slice-from"),
            sliceToEl = document.getElementById("output-file-slice-to"),
            sliceFrom = parseInt(sliceFromEl.value, 10),
            sliceTo = parseInt(sliceToEl.value, 10),
            output = this.outputs[this.getActiveTab()].data;

        let str;
        if (output.type === "ArrayBuffer") {
            str = Utils.arrayBufferToStr(output.result.slice(sliceFrom, sliceTo));
        } else {
            str = Utils.arrayBufferToStr(await this.getDishBuffer(output.dish).slice(sliceFrom, sliceTo));
        }

        outputText.classList.remove("blur");
        showFileOverlay.style.display = "block";
        outputText.value = Utils.printable(str, true);


        outputText.style.display = "block";
        outputHtml.style.display = "none";
        outputFile.style.display = "none";
        outputHighlighter.display = "block";
        inputHighlighter.display = "block";

        this.toggleLoader(false);
    }

    /**
     * Handler for show file overlay events
     *
     * @param {Event} e
     */
    showFileOverlayClick(e) {
        const showFileOverlay = e.target;

        document.getElementById("output-text").classList.add("blur");
        showFileOverlay.style.display = "none";
        this.set(this.getActiveTab());
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
    copyClick() {
        let output = this.getActive(true);

        if (typeof output !== "string") {
            output = Utils.arrayBufferToStr(output);
        }

        // Create invisible textarea to populate with the raw dish string (not the printable version that
        // contains dots instead of the actual bytes)
        const textarea = document.createElement("textarea");
        textarea.style.position = "fixed";
        textarea.style.top = 0;
        textarea.style.left = 0;
        textarea.style.width = 0;
        textarea.style.height = 0;
        textarea.style.border = "none";

        textarea.value = output;
        document.body.appendChild(textarea);

        let success = false;
        try {
            textarea.select();
            success = output && document.execCommand("copy");
        } catch (err) {
            success = false;
        }

        if (success) {
            this.app.alert("Copied raw output successfully.", 2000);
        } else {
            this.app.alert("Sorry, the output could not be copied.", 3000);
        }

        // Clean up
        document.body.removeChild(textarea);
    }

    /**
     * Returns true if the output contains carriage returns
     *
     * @returns {boolean}
     */
    containsCR() {
        return this.getActive(false).indexOf("\r") >= 0;
    }

    /**
     * Handler for switch click events.
     * Moves the current output into the input textarea.
     */
    switchClick() {
        const active = this.getActive(true);
        if (typeof active === "string") {
            this.manager.input.inputWorker.postMessage({
                action: "inputSwitch",
                data: {
                    inputNum: this.manager.input.getActiveTab(),
                    outputData: active
                }
            });
        } else {
            this.manager.input.inputWorker.postMessage({
                action: "inputSwitch",
                data: {
                    inputNum: this.manager.input.getActiveTab(),
                    outputData: active
                }
            }, [active]);
        }
    }

    /**
     * Handler for when the inputWorker has switched the inputs.
     * Stores the old input
     *
     * @param {object} switchData
     * @param {number} switchData.inputNum
     * @param {string | object} switchData.data
     * @param {ArrayBuffer} switchData.data.fileBuffer
     * @param {number} switchData.data.size
     * @param {string} switchData.data.type
     * @param {string} switchData.data.name
     */
    inputSwitch(switchData) {
        this.switchOrigData = switchData;
        document.getElementById("undo-switch").disabled = false;
    }

    /**
     * Handler for undo switch click events.
     * Removes the output from the input and replaces the input that was removed.
     */
    undoSwitchClick() {
        this.manager.input.updateInputObj(this.switchOrigData.inputNum, this.switchOrigData.data);
        const undoSwitch = document.getElementById("undo-switch");
        undoSwitch.disabled = true;
        $(undoSwitch).tooltip("hide");

        this.manager.input.inputWorker.postMessage({
            action: "setInput",
            data: {
                inputNum: this.switchOrigData.inputNum,
                silent: false
            }
        });
    }

    /**
     * Handler for maximise output click events.
     * Resizes the output frame to be as large as possible, or restores it to its original size.
     */
    maximiseOutputClick(e) {
        const el = e.target.id === "maximise-output" ? e.target : e.target.parentNode;

        if (el.getAttribute("data-original-title").indexOf("Maximise") === 0) {
            this.app.initialiseSplitter(true);
            this.app.columnSplitter.collapse(0);
            this.app.columnSplitter.collapse(1);
            this.app.ioSplitter.collapse(0);

            $(el).attr("data-original-title", "Restore output pane");
            el.querySelector("i").innerHTML = "fullscreen_exit";
        } else {
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
    filterTabSearch() {
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
                results.push({
                    inputNum: iNum,
                    textDisplay: outDisplay[output.status]
                });
            } else if (output.status === "baked" && showBaked && output.progress === false) {
                let data = this.getOutput(iNum, false).slice(0, 4096);
                if (typeof data !== "string") {
                    data = Utils.arrayBufferToStr(data);
                }
                data = data.replace(/[\r\n]/g, "");
                if (data.toLowerCase().includes(contentFilter)) {
                    results.push({
                        inputNum: iNum,
                        textDisplay: data.slice(0, 100)
                    });
                }
            } else if (output.progress !== false && showErrored) {
                let data = this.getOutput(iNum, false).slice(0, 4096);
                if (typeof data !== "string") {
                    data = Utils.arrayBufferToStr(data);
                }
                data = data.replace(/[\r\n]/g, "");
                if (data.toLowerCase().includes(contentFilter)) {
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
}

export default OutputWaiter;
