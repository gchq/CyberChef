var Utils = require("../core/Utils.js");


/**
 * Endian operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Endian = module.exports = {

    /**
     * @constant
     * @default
     */
    DATA_FORMAT: ["Hex", "Raw"],
    /**
     * @constant
     * @default
     */
    WORD_LENGTH: 4,
    /**
     * @constant
     * @default
     */
    PAD_INCOMPLETE_WORDS: true,

    /**
     * Swap endianness operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSwapEndianness: function(input, args) {
        var dataFormat = args[0],
            wordLength = args[1],
            padIncompleteWords = args[2],
            data = [],
            result = [],
            words = [],
            i = 0,
            j = 0;

        if (wordLength <= 0) {
            return "Word length must be greater than 0";
        }

        // Convert input to raw data based on specified data format
        switch (dataFormat) {
            case "Hex":
                data = Utils.fromHex(input);
                break;
            case "Raw":
                data = Utils.strToByteArray(input);
                break;
            default:
                data = input;
        }

        // Split up into words
        for (i = 0; i < data.length; i += wordLength) {
            var word = data.slice(i, i + wordLength);

            // Pad word if too short
            if (padIncompleteWords && word.length < wordLength){
                for (j = word.length; j < wordLength; j++) {
                    word.push(0);
                }
            }

            words.push(word);
        }

        // Swap endianness and flatten
        for (i = 0; i < words.length; i++) {
            j = words[i].length;
            while (j--) {
                result.push(words[i][j]);
            }
        }

        // Convert data back to specified data format
        switch (dataFormat) {
            case "Hex":
                return Utils.toHex(result);
            case "Raw":
                return Utils.byteArrayToUtf8(result);
            default:
                return result;
        }
    },

};
