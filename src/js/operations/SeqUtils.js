/**
 * Sequence utility operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var SeqUtils = {

    /**
     * @constant
     * @default
     */
    DELIMITER_OPTIONS: ["Line feed", "CRLF", "Space", "Comma", "Semi-colon", "Colon", "Nothing (separate chars)"],
    /**
     * @constant
     * @default
     */
    SORT_REVERSE: false,
    /**
     * @constant
     * @default
     */
    SORT_ORDER: ["Alphabetical (case sensitive)", "Alphabetical (case insensitive)", "IP address"],
    
    /**
     * Sort operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_sort: function (input, args) {
        var delim = Utils.char_rep[args[0]],
            sort_reverse = args[1],
            order = args[2],
            sorted = input.split(delim);
            
        if (order === "Alphabetical (case sensitive)") {
            sorted = sorted.sort();
        } else if (order === "Alphabetical (case insensitive)") {
            sorted = sorted.sort(SeqUtils._case_insensitive_sort);
        } else if (order === "IP address") {
            sorted = sorted.sort(SeqUtils._ip_sort);
        }
            
        if (sort_reverse) sorted.reverse();
        return sorted.join(delim);
    },
    
    
    /**
     * Unique operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_unique: function (input, args) {
        var delim = Utils.char_rep[args[0]];
        return input.split(delim).unique().join(delim);
    },
    
    
    /**
     * @constant
     * @default
     */
    SEARCH_TYPE: ["Regex", "Extended (\\n, \\t, \\x...)", "Simple string"],
    
    /**
     * Count occurrences operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    run_count: function(input, args) {
        var search = args[0].string,
            type = args[0].option;
            
        if (type === "Regex" && search) {
            try {
                var regex = new RegExp(search, "gi"),
                    matches = input.match(regex);
                return matches.length;
            } catch(err) {
                return 0;
            }
        } else if (search) {
            if (type.indexOf("Extended") === 0) {
                search = Utils.parse_escaped_chars(search);
            }
            return input.count(search);
        } else {
            return 0;
        }
    },
    
    
    /**
     * @constant
     * @default
     */
    REVERSE_BY: ["Character", "Line"],
    
    /**
     * Reverse operation.
     *
     * @param {byte_array} input
     * @param {Object[]} args
     * @returns {byte_array}
     */
    run_reverse: function (input, args) {
        if (args[0] === "Line") {
            var lines = [],
                line = [],
                result = [];
            for (var i = 0; i < input.length; i++) {
                if (input[i] === 0x0a) {
                    lines.push(line);
                    line = [];
                } else {
                    line.push(input[i]);
                }
            }
            lines.push(line);
            lines.reverse();
            for (i = 0; i < lines.length; i++) {
                result = result.concat(lines[i]);
                result.push(0x0a);
            }
            return result.slice(0, input.length);
        } else {
            return input.reverse();
        }
    },
    
    
    /**
     * Add line numbers operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_add_line_numbers: function(input, args) {
        var lines = input.split("\n"),
            output = "",
            width = lines.length.toString().length;
            
        for (var n = 0; n < lines.length; n++) {
            output += Utils.pad((n+1).toString(), width, " ") + " " + lines[n] + "\n";
        }
        return output.slice(0, output.length-1);
    },
    
    
    /**
     * Remove line numbers operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_remove_line_numbers: function(input, args) {
        return input.replace(/^[ \t]{0,5}\d+[\s:|\-,.)\]]/gm, "");
    },
    
    
    /**
     * Expand alphabet range operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_expand_alph_range: function(input, args) {
        return Utils.expand_alph_range(input).join(args[0]);
    },
    
    
    /**
     * Comparison operation for sorting of strings ignoring case.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    _case_insensitive_sort: function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
    },
    
    
    /**
     * Comparison operation for sorting of IPv4 addresses.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    _ip_sort: function(a, b) {
        var a_ = a.split("."),
            b_ = b.split(".");
        
        a_ = a_[0] * 0x1000000 + a_[1] * 0x10000 + a_[2] * 0x100 + a_[3] * 1;
        b_ = b_[0] * 0x1000000 + b_[1] * 0x10000 + b_[2] * 0x100 + b_[3] * 1;
        
        if (isNaN(a_) && !isNaN(b_)) return 1;
        if (!isNaN(a_) && isNaN(b_)) return -1;
        if (isNaN(a_) && isNaN(b_)) return a.localeCompare(b);
        
        return a_ - b_;
    },
    
};
