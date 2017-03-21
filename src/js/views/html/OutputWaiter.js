var Utils = require("../../core/Utils.js");


/**
 * Waiter to handle events related to the output.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var OutputWaiter = module.exports = function(app, manager) {
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
 * @param {string} dataStr - The output string/HTML
 * @param {string} type - The data type of the output
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set = function(dataStr, type, duration) {
    var outputText = document.getElementById("output-text"),
        outputHtml = document.getElementById("output-html"),
        outputHighlighter = document.getElementById("output-highlighter"),
        inputHighlighter = document.getElementById("input-highlighter");

    if (type === "html") {
        outputText.style.display = "none";
        outputHtml.style.display = "block";
        outputHighlighter.display = "none";
        inputHighlighter.display = "none";

        outputText.value = "";
        outputHtml.innerHTML = dataStr;

        // Execute script sections
        var scriptElements = outputHtml.querySelectorAll("script");
        for (var i = 0; i < scriptElements.length; i++) {
            try {
                eval(scriptElements[i].innerHTML); // eslint-disable-line no-eval
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        outputText.style.display = "block";
        outputHtml.style.display = "none";
        outputHighlighter.display = "block";
        inputHighlighter.display = "block";

        outputText.value = Utils.printable(dataStr, true);
        outputHtml.innerHTML = "";
    }

    this.manager.highlighter.removeHighlights();
    var lines = dataStr.count("\n") + 1;
    this.setOutputInfo(dataStr.length, lines, duration);
};


/**
 * Displays information about the output.
 *
 * @param {number} length - The length of the current output string
 * @param {number} lines - The number of the lines in the current output string
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.setOutputInfo = function(length, lines, duration) {
    var width = length.toString().length;
    width = width < 4 ? 4 : width;

    var lengthStr = Utils.pad(length.toString(), width, " ").replace(/ /g, "&nbsp;");
    var linesStr  = Utils.pad(lines.toString(), width, " ").replace(/ /g, "&nbsp;");
    var timeStr   = Utils.pad(duration.toString() + "ms", width, " ").replace(/ /g, "&nbsp;");

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
    var output         = document.getElementById("output"),
        saveToFile     = document.getElementById("save-to-file"),
        switchIO       = document.getElementById("switch"),
        undoSwitch     = document.getElementById("undo-switch"),
        maximiseOutput = document.getElementById("maximise-output");

    if (output.clientWidth < 680) {
        saveToFile.childNodes[1].nodeValue = "";
        switchIO.childNodes[1].nodeValue = "";
        undoSwitch.childNodes[1].nodeValue = "";
        maximiseOutput.childNodes[1].nodeValue = "";
    } else {
        saveToFile.childNodes[1].nodeValue = " Save to file";
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
    var data = Utils.toBase64(this.app.dishStr),
        filename = window.prompt("Please enter a filename:", "download.dat");

    if (filename) {
        var el = document.createElement("a");
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
 * Handler for maximise output click events.
 * Resizes the output frame to be as large as possible, or restores it to its original size.
 */
OutputWaiter.prototype.maximiseOutputClick = function(e) {
    var el = e.target.id === "maximise-output" ? e.target : e.target.parentNode;

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
