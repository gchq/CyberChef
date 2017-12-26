import Utils from "../core/Utils.js";


/**
 * Waiter to handle events related to the output.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const OutputWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Gets the output string from the output textarea.
 *
 * @returns {string}
 */
OutputWaiter.prototype.get = function() {
    return document.getElementById("output-text").value;
};


/**
 * Sets the output in the output textarea.
 *
 * @param {string|ArrayBuffer} data - The output string/HTML/ArrayBuffer
 * @param {string} type - The data type of the output
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set = function(data, type, duration) {
    const outputText = document.getElementById("output-text");
    const outputHtml = document.getElementById("output-html");
    const outputFile = document.getElementById("output-file");
    const outputHighlighter = document.getElementById("output-highlighter");
    const inputHighlighter = document.getElementById("input-highlighter");
    let scriptElements, lines, length;

    switch (type) {
        case "html":
            outputText.style.display = "none";
            outputHtml.style.display = "block";
            outputFile.style.display = "none";
            outputHighlighter.display = "none";
            inputHighlighter.display = "none";

            outputText.value = "";
            outputHtml.innerHTML = data;
            length = data.length;

            // Execute script sections
            scriptElements = outputHtml.querySelectorAll("script");
            for (let i = 0; i < scriptElements.length; i++) {
                try {
                    eval(scriptElements[i].innerHTML); // eslint-disable-line no-eval
                } catch (err) {
                    console.error(err);
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
            length = data.byteLength;

            this.setFile(new File([data], "output.dat"));
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
            break;
    }

    this.manager.highlighter.removeHighlights();
    this.setOutputInfo(length, lines, duration);
};


/**
 * Shows file details.
 *
 * @param {File} file
 */
OutputWaiter.prototype.setFile = function(file) {
    // Display file overlay in output area with details
    const fileOverlay = document.getElementById("output-file"),
        fileSize = document.getElementById("output-file-size");

    fileOverlay.style.display = "block";
    fileSize.textContent = file.size.toLocaleString() + " bytes";
};


/**
 * Displays information about the output.
 *
 * @param {number} length - The length of the current output string
 * @param {number} lines - The number of the lines in the current output string
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.setOutputInfo = function(length, lines, duration) {
    let width = length.toString().length;
    width = width < 4 ? 4 : width;

    lines = typeof lines === "number" ? lines : "";

    const lengthStr = Utils.pad(length.toString(), width, " ").replace(/ /g, "&nbsp;");
    const linesStr  = Utils.pad(lines.toString(), width, " ").replace(/ /g, "&nbsp;");
    const timeStr   = Utils.pad(duration.toString() + "ms", width, " ").replace(/ /g, "&nbsp;");

    document.getElementById("output-info").innerHTML = "time: " + timeStr +
        "<br>length: " + lengthStr +
        "<br>lines: " + linesStr;
    document.getElementById("input-selection-info").innerHTML = "";
    document.getElementById("output-selection-info").innerHTML = "";
};


/**
 * Adjusts the display properties of the output buttons so that they fit within the current width
 * without wrapping or overflowing.
 */
OutputWaiter.prototype.adjustWidth = function() {
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
};


/**
 * Handler for save click events.
 * Saves the current output to a file, downloaded as a URL octet stream.
 */
OutputWaiter.prototype.saveClick = function() {
    const data = Utils.toBase64(this.app.dishStr);
    const filename = window.prompt("Please enter a filename:", "download.dat");

    if (filename) {
        const el = document.createElement("a");
        el.setAttribute("href", "data:application/octet-stream;base64;charset=utf-8," + data);
        el.setAttribute("download", filename);

        // Firefox requires that the element be added to the DOM before it can be clicked
        el.style.display = "none";
        document.body.appendChild(el);

        el.click();
        el.remove();
    }
};


/**
 * Handler for copy click events.
 * Copies the output to the clipboard.
 */
OutputWaiter.prototype.copyClick = function() {
    // Create invisible textarea to populate with the raw dishStr (not the printable version that
    // contains dots instead of the actual bytes)
    const textarea = document.createElement("textarea");
    textarea.style.position = "fixed";
    textarea.style.top = 0;
    textarea.style.left = 0;
    textarea.style.width = 0;
    textarea.style.height = 0;
    textarea.style.border = "none";

    textarea.value = this.app.dishStr;
    document.body.appendChild(textarea);

    // Select and copy the contents of this textarea
    let success = false;
    try {
        textarea.select();
        success = document.execCommand("copy");
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
};


/**
 * Handler for switch click events.
 * Moves the current output into the input textarea.
 */
OutputWaiter.prototype.switchClick = function() {
    this.switchOrigData = this.manager.input.get();
    document.getElementById("undo-switch").disabled = false;
    this.app.setInput(this.app.dishStr);
};


/**
 * Handler for undo switch click events.
 * Removes the output from the input and replaces the input that was removed.
 */
OutputWaiter.prototype.undoSwitchClick = function() {
    this.app.setInput(this.switchOrigData);
    document.getElementById("undo-switch").disabled = true;
};

/**
 * Handler for file switch click events.
 * Moves a files data for items created via Utils.displayFilesAsHTML to the input.
 */
OutputWaiter.prototype.fileSwitch = function(e) {
    e.preventDefault();
    this.switchOrigData = this.manager.input.get();
    this.app.setInput(e.target.getAttribute("fileValue"));
    document.getElementById("undo-switch").disabled = false;
};


/**
 * Handler for maximise output click events.
 * Resizes the output frame to be as large as possible, or restores it to its original size.
 */
OutputWaiter.prototype.maximiseOutputClick = function(e) {
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
};


/**
 * Shows or hides the loading icon.
 *
 * @param {boolean} value
 */
OutputWaiter.prototype.toggleLoader = function(value) {
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
};


/**
 * Sets the baking status message value.
 *
 * @param {string} msg
 */
OutputWaiter.prototype.setStatusMsg = function(msg) {
    const el = document.querySelector("#output-loader .loading-msg");

    el.textContent = msg;
};


/**
 * Returns true if the output contains carriage returns
 *
 * @returns {boolean}
 */
OutputWaiter.prototype.containsCR = function() {
    return this.app.dishStr.indexOf("\r") >= 0;
};

export default OutputWaiter;
