/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {toHex, fromHex} from "../lib/Hex";
import OperationError from "../errors/OperationError";

/**
 * Swap endianness operation
 */
class SwapEndianness extends Operation {

    /**
     * SwapEndianness constructor
     */
    constructor() {
        super();

        this.name = "Swap endianness";
        this.module = "Default";
        this.description = "Switches the data from big-endian to little-endian or vice-versa. Data can be read in as hexadecimal or raw bytes. It will be returned in the same format as it is entered.";
        this.infoURL = "https://wikipedia.org/wiki/Endianness";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Data format",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
            {
                "name": "Word length (bytes)",
                "type": "number",
                "value": 4
            },
            {
                "name": "Pad incomplete words",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [dataFormat, wordLength, padIncompleteWords] = args,
            result = [],
            words = [];
        let i = 0,
            j = 0,
            data = [];

        if (wordLength <= 0) {
            throw new OperationError("Word length must be greater than 0");
        }

        // Convert input to raw data based on specified data format
        switch (dataFormat) {
            case "Hex":
                data = fromHex(input);
                break;
            case "Raw":
                data = Utils.strToByteArray(input);
                break;
            default:
                data = input;
        }

        // Split up into words
        for (i = 0; i < data.length; i += wordLength) {
            const word = data.slice(i, i + wordLength);

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
                return toHex(result);
            case "Raw":
                return Utils.byteArrayToUtf8(result);
            default:
                return result;
        }
    }

    /**
     * Highlight Swap endianness
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Swap endianness in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

export default SwapEndianness;
