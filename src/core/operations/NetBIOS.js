import Utils from "../Utils.js";

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
        let output = [],
            offset = args[0];

        if (input.length <= 16) {
            for (let i = 0; i < input.length; i++) {
                output.push((input[i] >> 4) + offset);
                output.push((input[i] & 0xf) + offset);
            }
            for (let i = input.length; i < 16; i++) {
                output.push(67);
                output.push(65);
            }
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
        let output = [],
            offset = args[0];

        if (input.length <= 32 && (input.length % 2) == 0) {
            for (let i = 0; i < input.length; i += 2) {
                output.push((((input[i] & 0xff) - offset) << 4) |
                            (((input[i + 1] & 0xff) - offset) & 0xf));
            }
            output = Utils.strToByteArray(Utils.byteArrayToChars(output).trim());
        }

        return output;
    },

};

export default NetBIOS;
