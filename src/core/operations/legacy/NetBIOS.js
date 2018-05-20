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
            let len = input.length;
            input.length = 16;
            input.fill(32, len, 16);
            for (let i = 0; i < input.length; i++) {
                output.push((input[i] >> 4) + offset);
                output.push((input[i] & 0xf) + offset);
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

        if (input.length <= 32 && (input.length % 2) === 0) {
            for (let i = 0; i < input.length; i += 2) {
                output.push((((input[i] & 0xff) - offset) << 4) |
                            (((input[i + 1] & 0xff) - offset) & 0xf));
            }
            for (let i = output.length - 1; i > 0; i--) {
                if (output[i] === 32) output.splice(i, i);
                else break;
            }
        }

        return output;
    },

};

export default NetBIOS;
