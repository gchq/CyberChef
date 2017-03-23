import Utils from "../Utils.js";
import CryptoJS from "crypto-js";


/**
 * Character encoding operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const CharEnc = {

    /**
     * @constant
     * @default
     */
    IO_FORMAT: ["UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1", "Windows-1251", "Hex", "Base64"],

    /**
     * Text encoding operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run: function(input, args) {
        var inputFormat = args[0],
            outputFormat = args[1];

        if (inputFormat === "Windows-1251") {
            input = Utils.win1251ToUnicode(input);
            input = CryptoJS.enc.Utf8.parse(input);
        } else {
            input = Utils.format[inputFormat].parse(input);
        }

        if (outputFormat === "Windows-1251") {
            input = CryptoJS.enc.Utf8.stringify(input);
            return Utils.unicodeToWin1251(input);
        } else {
            return Utils.format[outputFormat].stringify(input);
        }
    },

};

export default CharEnc;
