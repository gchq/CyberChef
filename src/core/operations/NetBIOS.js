/**
 * NetBIOS operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const NetBIOS = {

    /**
     * @constant
     * @default
     */
    OFFSET: 65,

    /**
     * Encode NetBIOS Name operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runEncodeName: function(input, args) {
        var output = [],
            offset = args[0];

        for (var i = 0; i < input.length; i++) {
            output.push((input[i] >> 4) + offset);
            output.push((input[i] & 0xf) + offset);
        }

        return output;
    },


    /**
     * Decode NetBIOS Name operation.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runDecodeName: function(input, args) {
        var output = [],
            offset = args[0];

        for (var i = 0; i < input.length; i += 2) {
            output.push(((input[i] - offset) << 4) |
                        ((input[i + 1] - offset) & 0xf));
        }

        return output;
    },

};

export default NetBIOS;
