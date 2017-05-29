import Utils from "../Utils.js";


/**
 * Sequence utility operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const SeqUtils = {

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
    SORT_ORDER: ["Alphabetical (case sensitive)", "Alphabetical (case insensitive)", "IP address", "Numeric"],

    /**
     * Sort operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSort: function (input, args) {
        let delim = Utils.charRep[args[0]],
            sortReverse = args[1],
            order = args[2],
            sorted = input.split(delim);

        if (order === "Alphabetical (case sensitive)") {
            sorted = sorted.sort();
        } else if (order === "Alphabetical (case insensitive)") {
            sorted = sorted.sort(SeqUtils._caseInsensitiveSort);
        } else if (order === "IP address") {
            sorted = sorted.sort(SeqUtils._ipSort);
        } else if (order === "Numeric") {
            sorted = sorted.sort(SeqUtils._numericSort);
        }

        if (sortReverse) sorted.reverse();
        return sorted.join(delim);
    },


    /**
     * Unique operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runUnique: function (input, args) {
        const delim = Utils.charRep[args[0]];
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
    runCount: function(input, args) {
        let search = args[0].string,
            type = args[0].option;

        if (type === "Regex" && search) {
            try {
                let regex = new RegExp(search, "gi"),
                    matches = input.match(regex);
                return matches.length;
            } catch (err) {
                return 0;
            }
        } else if (search) {
            if (type.indexOf("Extended") === 0) {
                search = Utils.parseEscapedChars(search);
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
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runReverse: function (input, args) {
        let i;
        if (args[0] === "Line") {
            let lines = [],
                line = [],
                result = [];
            for (i = 0; i < input.length; i++) {
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
    runAddLineNumbers: function(input, args) {
        let lines = input.split("\n"),
            output = "",
            width = lines.length.toString().length;

        for (let n = 0; n < lines.length; n++) {
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
    runRemoveLineNumbers: function(input, args) {
        return input.replace(/^[ \t]{0,5}\d+[\s:|\-,.)\]]/gm, "");
    },


    /**
     * Expand alphabet range operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runExpandAlphRange: function(input, args) {
        return Utils.expandAlphRange(input).join(args[0]);
    },


    /**
     * Comparison operation for sorting of strings ignoring case.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    _caseInsensitiveSort: function(a, b) {
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
    _ipSort: function(a, b) {
        let a_ = a.split("."),
            b_ = b.split(".");

        a_ = a_[0] * 0x1000000 + a_[1] * 0x10000 + a_[2] * 0x100 + a_[3] * 1;
        b_ = b_[0] * 0x1000000 + b_[1] * 0x10000 + b_[2] * 0x100 + b_[3] * 1;

        if (isNaN(a_) && !isNaN(b_)) return 1;
        if (!isNaN(a_) && isNaN(b_)) return -1;
        if (isNaN(a_) && isNaN(b_)) return a.localeCompare(b);

        return a_ - b_;
    },

    /**
     * Comparison operation for sorting of numeric values.
     *
     * @private
     * @param {string} a
     * @param {string} b
     * @returns {number}
     */
    _numericSort: function _numericSort(a, b) {
        let a_ = a.split(/([^\d]+)/),
            b_ = b.split(/([^\d]+)/);

        for (let i=0; i<a_.length && i<b.length; ++i) {
            if (isNaN(a_[i]) && !isNaN(b_[i])) return 1; // Numbers after non-numbers
            if (!isNaN(a_[i]) && isNaN(b_[i])) return -1;
            if (isNaN(a_[i]) && isNaN(b_[i])) {
                let ret = a_[i].localeCompare(b_[i]); // Compare strings
                if (ret !== 0) return ret;
            }
            if (!isNaN(a_[i]) && !isNaN(a_[i])) { // Compare numbers
                if (a_[i] - b_[i] !== 0) return a_[i] - b_[i];
            }
        }

        return 0;
    },

};

export default SeqUtils;
