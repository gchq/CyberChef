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
var OutputWaiter = function(app, manager) {
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
 * @param {string} data_str - The output string/HTML
 * @param {string} type - The data type of the output
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set = function(data_str, type, duration) {
    var output_text = document.getElementById("output-text"),
        output_html = document.getElementById("output-html"),
        output_highlighter = document.getElementById("output-highlighter"),
        input_highlighter = document.getElementById("input-highlighter");

    if (type == "html") {
        output_text.style.display = "none";
        output_html.style.display = "block";
        output_highlighter.display = "none";
        input_highlighter.display = "none";
        
        output_text.value = "";
        output_html.innerHTML = data_str;
        
        // Execute script sections
        var script_elements = output_html.querySelectorAll("script");
        for (var i = 0; i < script_elements.length; i++) {
            try {
                eval(script_elements[i].innerHTML); // jshint ignore:line
            } catch (err) {
                console.error(err);
            }
        }
    } else {
        output_text.style.display = "block";
        output_html.style.display = "none";
        output_highlighter.display = "block";
        input_highlighter.display = "block";
        
        output_text.value = Utils.printable(data_str, true);
        output_html.innerHTML = "";
    }
    
    this.manager.highlighter.remove_highlights();
    var lines = data_str.count("\n") + 1;
    this.set_output_info(data_str.length, lines, duration);
};


/**
 * Displays information about the output.
 *
 * @param {number} length - The length of the current output string
 * @param {number} lines - The number of the lines in the current output string
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set_output_info = function(length, lines, duration) {
    var width = length.toString().length;
    width = width < 4 ? 4 : width;
    
    var length_str = Utils.pad(length.toString(), width, " ").replace(/ /g, "&nbsp;");
    var lines_str  = Utils.pad(lines.toString(), width, " ").replace(/ /g, "&nbsp;");
    var time_str   = Utils.pad(duration.toString() + "ms", width, " ").replace(/ /g, "&nbsp;");
    
    document.getElementById("output-info").innerHTML = "time: " + time_str +
        "<br>length: " + length_str +
        "<br>lines: " + lines_str;
    document.getElementById("input-selection-info").innerHTML = "";
    document.getElementById("output-selection-info").innerHTML = "";
};


/**
 * Handler for save click events.
 * Saves the current output to a file, downloaded as a URL octet stream.
 */
OutputWaiter.prototype.save_click = function() {
    var data = Utils.to_base64(this.app.dish_str),
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
OutputWaiter.prototype.switch_click = function() {
    this.switch_orig_data = this.manager.input.get();
    document.getElementById("undo-switch").disabled = false;
    this.app.set_input(this.app.dish_str);
};


/**
 * Handler for undo switch click events.
 * Removes the output from the input and replaces the input that was removed.
 */
OutputWaiter.prototype.undo_switch_click = function() {
    this.app.set_input(this.switch_orig_data);
    document.getElementById("undo-switch").disabled = true;
};
