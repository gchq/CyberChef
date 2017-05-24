/**
 * Waiter to handle events related to the input.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
var InputWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
    
    // Define keys that don't change the input so we don't have to autobake when they are pressed
    this.bad_keys = [
        16, //Shift
        17, //Ctrl
        18, //Alt
        19, //Pause
        20, //Caps
        27, //Esc
        33,34,35,36, //PgUp, PgDn, End, Home
        37,38,39,40, //Directional
        44, //PrntScrn
        91,92, //Win
        93, //Context
        112,113,114,115,116,117,118,119,120,121,122,123, //F1-12
        144, //Num
        145, //Scroll
    ];
};


/**
 * Gets the user's input from the input textarea.
 *
 * @returns {string}
 */
InputWaiter.prototype.get = function() {
    return document.getElementById("input-text").value;
};


/**
 * Sets the input in the input textarea.
 *
 * @param {string} input
 *
 * @fires Manager#statechange
 */
InputWaiter.prototype.set = function(input) {
    document.getElementById("input-text").value = input;
    window.dispatchEvent(this.manager.statechange);
};


/**
 * Displays information about the input.
 *
 * @param {number} length - The length of the current input string
 * @param {number} lines - The number of the lines in the current input string
 */
InputWaiter.prototype.set_input_info = function(length, lines) {
    var width = length.toString().length;
    width = width < 2 ? 2 : width;
    
    var length_str = Utils.pad(length.toString(), width, " ").replace(/ /g, "&nbsp;");
    var lines_str  = Utils.pad(lines.toString(), width, " ").replace(/ /g, "&nbsp;");
        
    document.getElementById("input-info").innerHTML = "length: " + length_str + "<br>lines: " + lines_str;
};


/**
 * Handler for input scroll events.
 * Scrolls the highlighter pane to match the input textarea position and updates history state.
 *
 * @param {event} e
 *
 * @fires Manager#statechange
 */
InputWaiter.prototype.input_change = function(e) {
    // Remove highlighting from input and output panes as the offsets might be different now
    this.manager.highlighter.remove_highlights();
    
    // Reset recipe progress as any previous processing will be redundant now
    this.app.progress = 0;
    
    // Update the input metadata info
    var input_text = this.get(),
        lines = input_text.count("\n") + 1;
        
    this.set_input_info(input_text.length, lines);
    
    
    if (this.bad_keys.indexOf(e.keyCode) < 0) {
        // Fire the statechange event as the input has been modified
        window.dispatchEvent(this.manager.statechange);
    }
};


/**
 * Handler for input dragover events.
 * Gives the user a visual cue to show that items can be dropped here.
 *
 * @param {event} e
 */
InputWaiter.prototype.input_dragover = function(e) {
    // This will be set if we're dragging an operation
    if (e.dataTransfer.effectAllowed === "move")
        return false;
    
    e.stopPropagation();
    e.preventDefault();
    e.target.classList.add("dropping-file");
};


/**
 * Handler for input dragleave events.
 * Removes the visual cue.
 *
 * @param {event} e
 */
InputWaiter.prototype.input_dragleave = function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.classList.remove("dropping-file");
};


/**
 * Handler for input drop events.
 * Loads the dragged data into the input textarea.
 *
 * @param {event} e
 */
InputWaiter.prototype.input_drop = function(e) {
    // This will be set if we're dragging an operation
    if (e.dataTransfer.effectAllowed === "move")
        return false;
    
    e.stopPropagation();
    e.preventDefault();
    
    var el = e.target,
        file = e.dataTransfer.files[0],
        text = e.dataTransfer.getData("Text"),
        reader = new FileReader(),
        input_charcode = "",
        offset = 0,
        CHUNK_SIZE = 20480; // 20KB
    
    var set_input = function() {
        if (input_charcode.length > 100000 && this.app.auto_bake_) {
            this.manager.controls.set_auto_bake(false);
            this.app.alert("Turned off Auto Bake as the input is large", "warning", 5000);
        }
        
        this.set(input_charcode);
        var recipe_config = this.app.get_recipe_config();
        if (!recipe_config[0] || recipe_config[0].op != "From Hex") {
            recipe_config.unshift({op:"From Hex",args:["Space"]});
            this.app.set_recipe_config(recipe_config);
        }
        
        el.classList.remove("loading_file");
    }.bind(this);
    
    var seek = function() {
        if (offset >= file.size) {
            set_input();
            return;
        }
        el.value = "Processing... " + Math.round(offset / file.size * 100) + "%";
        var slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    }.bind(this);
    
    reader.onload = function(e) {
        var data = new Uint8Array(reader.result);
        input_charcode += Utils.to_hex_fast(data);
        offset += CHUNK_SIZE;
        seek();
    }.bind(this);
    
    
    el.classList.remove("dropping-file");
    
    if (file) {
        el.classList.add("loading_file");
        seek();
    } else if (text) {
        this.set(text);
    }
};


/**
 * Handler for clear IO events.
 * Resets the input, output and info areas.
 *
 * @fires Manager#statechange
 */
InputWaiter.prototype.clear_io_click = function() {
    this.manager.highlighter.remove_highlights();
    document.getElementById("input-text").value = "";
    document.getElementById("output-text").value = "";
    document.getElementById("input-info").innerHTML = "";
    document.getElementById("output-info").innerHTML = "";
    document.getElementById("input-selection-info").innerHTML = "";
    document.getElementById("output-selection-info").innerHTML = "";
    window.dispatchEvent(this.manager.statechange);
};
