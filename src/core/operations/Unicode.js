import Utils from "../Utils.js";


/**
 * Unicode operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Unicode = {

    /**
     * @constant
     * @default
     */
    PREFIXES: ["\\u", "%u", "U+"],

    /**
     * Unescape Unicode Characters operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runUnescape: function(input, args) {
        let prefix = Unicode._prefixToRegex[args[0]],
            regex = new RegExp(prefix+"([a-f\\d]{4})", "ig"),
            output = "",
            m,
            i = 0;

        while ((m = regex.exec(input))) {
            // Add up to match
            output += input.slice(i, m.index);
            i = m.index;

            // Add match
            output += Utils.chr(parseInt(m[1], 16));

            i = regex.lastIndex;
        }

        // Add all after final match
        output += input.slice(i, input.length);

        return output;
    },


    /**
     * Escape Unicode Characters operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEscape: function(input, args) {
        const regexWhitelist = /[ -~]/i,
            prefix = args[0],
            encodeAll = args[1],
            padding = args[2],
            uppercaseHex = args[3];

        let output = "",
            character = "";

        for (let i = 0; i < input.length; i++) {
            character = input[i];
            if (!encodeAll && regexWhitelist.test(character)) {
                // It’s a printable ASCII character so don’t escape it.
                output += character;
                continue;
            }

            let cp = character.codePointAt(0).toString(16);
            if (uppercaseHex) cp = cp.toUpperCase();
            output += prefix + cp.padStart(padding, "0");
        }

        return output;
    },


    /**
     * Lookup table to add prefixes to unicode delimiters so that they can be used in a regex.
     *
     * @private
     * @constant
     */
    _prefixToRegex: {
        "\\u": "\\\\u",
        "%u": "%u",
        "U+": "U\\+"
    },

};

export default Unicode;
