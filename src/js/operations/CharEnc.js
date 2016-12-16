/* globals CryptoJS */

/**
 * Character encoding operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var CharEnc = {

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
        var input_format = args[0],
            output_format = args[1];
            
        if (input_format === "Windows-1251") {
            input = Utils.win1251_to_unicode(input);
            input = CryptoJS.enc.Utf8.parse(input);
        } else {
            input = Utils.format[input_format].parse(input);
        }
        
        if (output_format === "Windows-1251") {
            input = CryptoJS.enc.Utf8.stringify(input);
            return Utils.unicode_to_win1251(input);
        } else {
            return Utils.format[output_format].stringify(input);
        }
    },
    
};
