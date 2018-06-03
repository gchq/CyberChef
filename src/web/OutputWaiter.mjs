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
     * Adjusts the display properties of the output buttons so that they fit within the current width
     * without wrapping or overflowing.
     */
    adjustWidth() {
        const output         = document.getElementById("output");
        const saveToFile     = document.getElementById("save-to-file");
        const copyOutput     = document.getElementById("copy-output");
        const switchIO       = document.getElementById("switch");
        const undoSwitch     = document.getElementById("undo-switch");
        const maximiseOutput = document.getElementById("maximise-output");

        if (output.clientWidth < 680) {
            saveToFile.childNodes[1].nodeValue = "";
            copyOutput.childNodes[1].nodeValue = "";
            switchIO.childNodes[1].nodeValue = "";
            undoSwitch.childNodes[1].nodeValue = "";
            maximiseOutput.childNodes[1].nodeValue = "";
        } else {
            saveToFile.childNodes[1].nodeValue = " Save to file";
            copyOutput.childNodes[1].nodeValue = " Copy output";
            switchIO.childNodes[1].nodeValue = " Move output to input";
            undoSwitch.childNodes[1].nodeValue = " Undo";
            maximiseOutput.childNodes[1].nodeValue =
                maximiseOutput.getAttribute("title") === "Maximise" ? " Max" : " Restore";
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
            this.app.alert("Copied raw output successfully.", "success", 2000);
        } else {
            this.app.alert("Sorry, the output could not be copied.", "danger", 2000);
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
        document.getElementById("undo-switch").disabled = true;
    }


    /**
     * Handler for maximise output click events.
     * Resizes the output frame to be as large as possible, or restores it to its original size.
     */
    maximiseOutputClick(e) {
        const el = e.target.id === "maximise-output" ? e.target : e.target.parentNode;

        if (el.getAttribute("title") === "Maximise") {
            this.app.columnSplitter.collapse(0);
            this.app.columnSplitter.collapse(1);
            this.app.ioSplitter.collapse(0);

            el.setAttribute("title", "Restore");
            el.innerHTML = "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAlUlEQVQ4y93RwQpBQRQG4C9ba1fxBteGPIj38BTejFJKLFnwCJIiCsW1mcV0k9yx82/OzGK+OXMGOpiiLTFjFNiilQI0sQ7IJiAjLKsgGVYB2YdaVO0kwy46/BVQi9ZDNPyQWen2ub/KufS8y7shfkq9tF9U7SC+/YluKvAI9YZeFeCECXJcA3JHP2WgMXJM/ZUcBwxeM+YuSWTgMtUAAAAASUVORK5CYII='> Restore";
            this.adjustWidth();
        } else {
            el.setAttribute("title", "Maximise");
            el.innerHTML = "<img src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAi0lEQVQ4y83TMQrCQBCF4S+5g4rJEdJ7KE+RQ1lrIQQCllroEULuoM0Ww3a7aXwwLAzMPzDvLcz4hnooUItT1rsoVNy+4lgLWNL7RlcCmDBij2eCfNCrUITc0dRCrhj8m5otw0O6SV8LuAV3uhrAAa8sJ2Np7KPFawhgscVLjH9bCDhjt8WNKft88w/HjCvuVqu53QAAAABJRU5ErkJggg=='> Max";
            this.app.resetLayout();
        }
    }


    /**
     * Shows or hides the loading icon.
     *
     * @param {boolean} value
     */
    toggleLoader(value) {
        const outputLoader = document.getElementById("output-loader"),
            outputElement = document.getElementById("output-text");

        if (value) {
            this.manager.controls.hideStaleIndicator();
            this.bakingStatusTimeout = setTimeout(function() {
                outputElement.disabled = true;
                outputLoader.style.visibility = "visible";
                outputLoader.style.opacity = 1;
                this.manager.controls.toggleBakeButtonFunction(true);
            }.bind(this), 200);
        } else {
            clearTimeout(this.bakingStatusTimeout);
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

        //console.log(options);

        const currentRecipeConfig = this.app.getRecipeConfig();
        const newRecipeConfig = currentRecipeConfig.concat(options[0].recipe);
        const recipeURL = "#recipe=" + Utils.encodeURIFragment(Utils.generatePrettyRecipe(newRecipeConfig));
        const opSequence = options[0].recipe.map(o => o.op).join(", ");

        log.log(`Running <a href="${recipeURL}">${opSequence}</a> will result in "${Utils.truncate(options[0].data, 20)}"`);
        //this.app.setRecipeConfig(newRecipeConfig);
        //this.app.autoBake();
    }

}

export default OutputWaiter;
