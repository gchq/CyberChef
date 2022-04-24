/**
 * @author lucasrpatten [Discord - alien_jedi#2563]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Byte Length operation
 */
class ByteLength extends Operation {

    /**
     * ByteLength constructor
     */
    constructor() {
        super();

        this.name = "Byte Length";
        this.module = "Utils";
        this.description = "Displays storage space occupied by input - supports bits, nibbles, bytes, kilobytes, megabytes, gigabytes, terabytes.";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name":"Memory Type",
                "type":"option",
                "value": ["Bits", "Nibbles", "Bytes", "Kilobytes", "Megabytes", "Gigabytes", "Terabytes"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
/** calculations
 */
    calculateBits (input) {
        return (Buffer.byteLength(input) * 8).toFixed(3);
    }
/** calculations
 */
    calculateNibbles (input) {
        return (Buffer.byteLength(input) * 2).toFixed(3);
    }
/** calculations
 */
    calculateBytes (input) {
        return (Buffer.byteLength(input)).toFixed(3);
    }
/** calculations
 */
    calculateKBytes (input) {
        return (Buffer.byteLength(input) / 1000).toFixed(3);
    }
/** calculations
 */
    calculateMBytes (input) {
        return (Buffer.byteLength(input) / 1000000).toFixed(3);
    }
/** calculations
 */
    calculateGBytes (input) {
        return (Buffer.byteLength(input) / 1000000000).toFixed(3);
    }
/** calculations
 */
    calculateTBytes (input) {
        return (Buffer.byteLength(input) / 1000000000000).toFixed(3);
    }
/** calculations
 */
    run (input, args) {
        // const [firstArg] = args;
        const dataType = args[0];
        switch (dataType) {
            case "Bits":
                return this.calculateBits(input);
            case "Nibbles":
                return this.calculateNibbles(input);
            case "Bytes":
                return this.calculateBytes(input);
            case "Kilobytes":
                return this.calculateKBytes(input);
            case "Megabytes":
                return this.calculateMBytes(input);
            case "Gigabytes":
                return this.calculateGBytes(input);
            case "Terabytes":
                return this.calculateTBytes(input);
            default:
                return this.calculateBytes(input);
        }
    }


    /**
     * Highlight Byte Length
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
     * Highlight Byte Length in reverse
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

export default ByteLength;


