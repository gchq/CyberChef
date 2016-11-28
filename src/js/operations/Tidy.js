/**
 * Tidy operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Tidy = {

    /**
     * @constant
     * @default
     */
    REMOVE_SPACES : true,
    /**
     * @constant
     * @default
     */
    REMOVE_CARIAGE_RETURNS : true,
    /**
     * @constant
     * @default
     */
    REMOVE_LINE_FEEDS : true,
    /**
     * @constant
     * @default
     */
    REMOVE_TABS : true,
    /**
     * @constant
     * @default
     */
    REMOVE_FORM_FEEDS : true,
    /**
     * @constant
     * @default
     */
    REMOVE_FULL_STOPS : false,
    
    /**
     * Remove whitespace operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_remove_whitespace: function (input, args) {
        var remove_spaces = args[0],
            remove_cariage_returns = args[1],
            remove_line_feeds = args[2],
            remove_tabs = args[3],
            remove_form_feeds = args[4],
            remove_full_stops = args[5],
            data = input;
            
        if (remove_spaces) data = data.replace(/ /g, "");
        if (remove_cariage_returns) data = data.replace(/\r/g, "");
        if (remove_line_feeds) data = data.replace(/\n/g, "");
        if (remove_tabs) data = data.replace(/\t/g, "");
        if (remove_form_feeds) data = data.replace(/\f/g, "");
        if (remove_full_stops) data = data.replace(/\./g, "");
        return data;
    },
    
    
    /**
     * Remove null bytes operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_remove_nulls: function (input, args) {
        var output = [];
        for (var i = 0; i < input.length; i++) {
            if (input[i] !== 0) output.push(input[i]);
        }
        return output;
    },
    
    
    /**
     * @constant
     * @default
     */
    APPLY_TO_EACH_LINE : false,
    /**
     * @constant
     * @default
     */
    DROP_START : 0,
    /**
     * @constant
     * @default
     */
    DROP_LENGTH : 5,
    
    /**
     * Drop bytes operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_drop_bytes: function(input, args) {
        var start = args[0],
            length = args[1],
            apply_to_each_line = args[2];
            
        if (start < 0 || length < 0)
            throw "Error: Invalid value";
            
        if (!apply_to_each_line)
            return input.slice(0, start).concat(input.slice(start+length, input.length));
            
        // Split input into lines
        var lines = [],
            line = [];
            
        for (var i = 0; i < input.length; i++) {
            if (input[i] == 0x0a) {
                lines.push(line);
                line = [];
            } else {
                line.push(input[i]);
            }
        }
        lines.push(line);
        
        var output = [];
        for (i = 0; i < lines.length; i++) {
            output = output.concat(lines[i].slice(0, start).concat(lines[i].slice(start+length, lines[i].length)));
            output.push(0x0a);
        }
        return output.slice(0, output.length-1);
    },
    
    
    /**
     * @constant
     * @default
     */
    TAKE_START: 0,
    /**
     * @constant
     * @default
     */
    TAKE_LENGTH: 5,
    
    /**
     * Take bytes operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_take_bytes: function(input, args) {
        var start = args[0],
            length = args[1],
            apply_to_each_line = args[2];
            
        if (start < 0 || length < 0)
            throw "Error: Invalid value";
            
        if (!apply_to_each_line)
            return input.slice(start, start+length);
            
        // Split input into lines
        var lines = [],
            line = [];
            
        for (var i = 0; i < input.length; i++) {
            if (input[i] == 0x0a) {
                lines.push(line);
                line = [];
            } else {
                line.push(input[i]);
            }
        }
        lines.push(line);
        
        var output = [];
        for (i = 0; i < lines.length; i++) {
            output = output.concat(lines[i].slice(start, start+length));
            output.push(0x0a);
        }
        return output.slice(0, output.length-1);
    },
    
    
    /**
     * @constant
     * @default
     */
    PAD_POSITION : ["Start", "End"],
    /**
     * @constant
     * @default
     */
    PAD_LENGTH : 5,
    /**
     * @constant
     * @default
     */
    PAD_CHAR : " ",
    
    /**
     * Pad lines operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_pad: function(input, args) {
        var position = args[0],
            len = args[1],
            chr = args[2],
            lines = input.split("\n"),
            output = "",
            i = 0;
            
        if (position == "Start") {
            for (i = 0; i < lines.length; i++) {
                output += Utils.pad_left(lines[i], lines[i].length+len, chr) + "\n";
            }
        } else if (position == "End") {
            for (i = 0; i < lines.length; i++) {
                output += Utils.pad_right(lines[i], lines[i].length+len, chr) + "\n";
            }
        }
        
        return output.slice(0, output.length-1);
    },
    
};
