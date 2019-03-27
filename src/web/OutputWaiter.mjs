/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../core/Utils";
import FileSaver from "file-saver";


/**
 * Waiter to handle events related to the output.
 */
class OutputWaiter {

    /**
     * OutputWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.dishBuffer = null;
        this.dishStr = null;
        this.outputs = [];
    }


    /**
     * Gets the output string from the output textarea.
     *
     * @returns {string}
     */
    get() {
        return document.getElementById("output-text").value;
    }


    /**
     * Sets the output array for multiple outputs.
     * Displays the active output in the output textarea
     *
     * @param {Array} outputs
     */
    async multiSet(outputs) {
        log.debug("Received " + outputs.length + " outputs.");
        this.outputs = outputs;
        const activeTab = this.manager.input.getActiveTab();

        const tabs = document.getElementById("output-tabs").getElementsByTagName("li");
        for (let i = tabs.length - 1; i >= 0; i--) {
            document.getElementById("output-tabs").firstElementChild.removeChild(tabs.item(i));
        }

        for (let i = 0; i < outputs.length; i++) {
            this.addTab(outputs[i].inputNum);
            if (outputs[i].inputNum === activeTab) {
                await this.set(outputs[i].data.result, outputs[i].data.type, outputs[0].data.duration);
            }
        }
        // await this.set(this.outputs[0].data.result, this.outputs[0].data.type, this.outputs[0].data.duration);

        // Create tabs

        // Select active tab

        // Display active tab data in textarea
    }


    /**
     * Sets the output in the output textarea.
     *
     * @param {string|ArrayBuffer} data - The output string/HTML/ArrayBuffer
     * @param {string} type - The data type of the output
     * @param {number} duration - The length of time (ms) it took to generate the output
     * @param {boolean} [preserveBuffer=false] - Whether to preserve the dishBuffer
     */
    async set(data, type, duration, preserveBuffer) {
        log.debug("Output type: " + type);
        const outputText = document.getElementById("output-text");
        const outputHtml = document.getElementById("output-html");
        const outputFile = document.getElementById("output-file");
        const outputHighlighter = document.getElementById("output-highlighter");
        const inputHighlighter = document.getElementById("input-highlighter");
        let scriptElements, lines, length;

        if (!preserveBuffer) {
            this.closeFile();
            this.dishStr = null;
            document.getElementById("show-file-overlay").style.display = "none";
        }

        switch (type) {
            case "html":
                outputText.style.display = "none";
                outputHtml.style.display = "block";
                outputFile.style.display = "none";
                outputHighlighter.display = "none";
                inputHighlighter.display = "none";

                outputText.value = "";
                outputHtml.innerHTML = data;

                // Execute script sections
                scriptElements = outputHtml.querySelectorAll("script");
                for (let i = 0; i < scriptElements.length; i++) {
                    try {
                        eval(scriptElements[i].innerHTML); // eslint-disable-line no-eval
                    } catch (err) {
                        log.error(err);
                    }
                }

                await this.getDishStr();
                length = this.dishStr.length;
                lines = this.dishStr.count("\n") + 1;
                break;
            case "ArrayBuffer":
                outputText.style.display = "block";
                outputHtml.style.display = "none";
                outputHighlighter.display = "none";
                inputHighlighter.display = "none";

                outputText.value = "";
                outputHtml.innerHTML = "";
                length = data.byteLength;

                this.setFile(data);
                break;
            case "string":
            default:
                outputText.style.display = "block";
                outputHtml.style.display = "none";
                outputFile.style.display = "none";
                outputHighlighter.display = "block";
                inputHighlighter.display = "block";

                outputText.value = Utils.printable(data, true);
                outputHtml.innerHTML = "";

                lines = data.count("\n") + 1;
                length = data.length;
                this.dishStr = data;
                break;
        }

        this.manager.highlighter.removeHighlights();
        this.setOutputInfo(length, lines, duration);
        this.backgroundMagic();
    }


    /**
     * Shows file details.
     *
     * @param {ArrayBuffer} buf
     */
    setFile(buf) {
        this.dishBuffer = buf;
        const file = new File([buf], "output.dat");

        // Display file overlay in output area with details
        const fileOverlay = document.getElementById("output-file"),
            fileSize = document.getElementById("output-file-size");

        fileOverlay.style.display = "block";
        fileSize.textContent = file.size.toLocaleString() + " bytes";

        // Display preview slice in the background
        const outputText = document.getElementById("output-text"),
            fileSlice = this.dishBuffer.slice(0, 4096);

        outputText.classList.add("blur");
        outputText.value = Utils.printable(Utils.arrayBufferToStr(fileSlice));
    }


    /**
     * Removes the output file and nulls its memory.
     */
    closeFile() {
        this.dishBuffer = null;
        document.getElementById("output-file").style.display = "none";
        document.getElementById("output-text").classList.remove("blur");
    }


    /**
     * Handler for file download events.
     */
    async downloadFile() {
        this.filename = window.prompt("Please enter a filename:", this.filename || "download.dat");
        await this.getDishBuffer();
        const file = new File([this.dishBuffer], this.filename);
        if (this.filename) FileSaver.saveAs(file, this.filename, false);
    }


    /**
     * Handler for file slice display events.
     */
    displayFileSlice() {
        const startTime = new Date().getTime(),
            showFileOverlay = document.getElementById("show-file-overlay"),
            sliceFromEl = document.getElementById("output-file-slice-from"),
            sliceToEl = document.getElementById("output-file-slice-to"),
            sliceFrom = parseInt(sliceFromEl.value, 10),
            sliceTo = parseInt(sliceToEl.value, 10),
            str = Utils.arrayBufferToStr(this.dishBuffer.slice(sliceFrom, sliceTo));

        document.getElementById("output-text").classList.remove("blur");
        showFileOverlay.style.display = "block";
        this.set(str, "string", new Date().getTime() - startTime, true);
    }


    /**
     * Handler for show file overlay events.
     *
     * @param {Event} e
     */
    showFileOverlayClick(e) {
        const outputFile = document.getElementById("output-file"),
            showFileOverlay = e.target;

        document.getElementById("output-text").classList.add("blur");
        outputFile.style.display = "block";
        showFileOverlay.style.display = "none";
        this.setOutputInfo(this.dishBuffer.byteLength, null, 0);
    }


    /**
     * Displays information about the output.
     *
     * @param {number} length - The length of the current output string
     * @param {number} lines - The number of the lines in the current output string
     * @param {number} duration - The length of time (ms) it took to generate the output
     */
    setOutputInfo(length, lines, duration) {
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
     * Handler for save click events.
     * Saves the current output to a file.
     */
    saveClick() {
        this.downloadFile();
    }


    /**
     * Handler for copy click events.
     * Copies the output to the clipboard.
     */
    async copyClick() {
        await this.getDishStr();

        // Create invisible textarea to populate with the raw dish string (not the printable version that
        // contains dots instead of the actual bytes)
        const textarea = document.createElement("textarea");
        textarea.style.position = "fixed";
        textarea.style.top = 0;
        textarea.style.left = 0;
        textarea.style.width = 0;
        textarea.style.height = 0;
        textarea.style.border = "none";

        textarea.value = this.dishStr;
        document.body.appendChild(textarea);

        // Select and copy the contents of this textarea
        let success = false;
        try {
            textarea.select();
            success = this.dishStr && document.execCommand("copy");
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
     * Handler for switch click events.
     * Moves the current output into the input textarea.
     */
    async switchClick() {
        this.switchOrigData = this.manager.input.get();
        document.getElementById("undo-switch").disabled = false;
        if (this.dishBuffer) {
            this.manager.input.setFile(new File([this.dishBuffer], "output.dat"));
            this.manager.input.handleLoaderMessage({
                data: {
                    progress: 100,
                    fileBuffer: this.dishBuffer
                }
            });
        } else {
            await this.getDishStr();
            this.app.setInput(this.dishStr);
        }
    }


    /**
     * Handler for undo switch click events.
     * Removes the output from the input and replaces the input that was removed.
     */
    undoSwitchClick() {
        this.app.setInput(this.switchOrigData);
        const undoSwitch = document.getElementById("undo-switch");
        undoSwitch.disabled = true;
        $(undoSwitch).tooltip("hide");
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
                this.manager.controls.toggleBakeButtonFunction(true);
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
            this.manager.controls.toggleBakeButtonFunction(false);
            this.setStatusMsg("");
        }
    }


    /**
     * Sets the baking status message value.
     *
     * @param {string} msg
     */
    setStatusMsg(msg) {
        const el = document.querySelector("#output-loader .loading-msg");

        el.textContent = msg;
    }


    /**
     * Returns true if the output contains carriage returns
     *
     * @returns {boolean}
     */
    async containsCR() {
        await this.getDishStr();
        return this.dishStr.indexOf("\r") >= 0;
    }


    /**
     * Retrieves the current dish as a string, returning the cached version if possible.
     *
     * @returns {string}
     */
    async getDishStr() {
        if (this.dishStr) return this.dishStr;

        this.dishStr = await new Promise(resolve => {
            this.manager.worker.getDishAs(this.app.dish, "string", r => {
                resolve(r.value);
            });
        });
        return this.dishStr;
    }


    /**
     * Retrieves the current dish as an ArrayBuffer, returning the cached version if possible.
     *
     * @returns {ArrayBuffer}
     */
    async getDishBuffer() {
        if (this.dishBuffer) return this.dishBuffer;

        this.dishBuffer = await new Promise(resolve => {
            this.manager.worker.getDishAs(this.app.dish, "ArrayBuffer", r => {
                resolve(r.value);
            });
        });
        return this.dishBuffer;
    }


    /**
     * Triggers the BackgroundWorker to attempt Magic on the current output.
     */
    backgroundMagic() {
        this.hideMagicButton();
        if (!this.app.options.autoMagic) return;

        const sample = this.dishStr ? this.dishStr.slice(0, 1000) :
            this.dishBuffer ? this.dishBuffer.slice(0, 1000) : "";

        if (sample.length) {
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
        this.manager.input.loadFile(new File([blob], fileName, {type: blob.type}));
    }

    /**
     * Function to create a new tab
     *
     * @param inputNum
     */
    addTab(inputNum) {
        const tabWrapper = document.getElementById("output-tabs");
        const tabsList = tabWrapper.firstElementChild;

        if (tabsList.children.length > 0) {
            tabWrapper.style.display = "block";
        }

        document.getElementById("output-wrapper").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("output-highlighter").style.height = "calc(100% - var(--tab-height) - var(--title-height))";
        document.getElementById("output-file").style.height = "calc(100% - var(--tab-height) - var(--title-height))";

        const newTab = document.createElement("li");
        newTab.id = `output-tab-${inputNum}`;
        if (inputNum === this.manager.input.getActiveTab()) {
            newTab.classList.add("active-output-tab");
        }

        const newTabContent = document.createElement("div");
        newTabContent.classList.add("output-tab-content");
        newTabContent.innerText = `Tab ${inputNum}`;

        newTab.appendChild(newTabContent);
        tabsList.appendChild(newTab);
    }

    /**
     * Function to change tabs
     *
     * @param {Element} tabElement
     */
    changeTab(tabElement) {
        const liItem = tabElement.parentElement;
        const newTabNum = liItem.id.replace("input-tab-", "");
        const currentTabNum = this.getActiveTab();
        const outputText = document.getElementById("output-text");
    }

}

export default OutputWaiter;
