/**
 * @author NOVA-Openclaw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * To Base26 operation
 */
class ToBase26 extends Operation {

    /**
     * ToBase26 constructor
     */
    constructor() {
        super();

        this.name = "To Base26";
        this.module = "Default";
        this.description = "Base26 is a notation for encoding arbitrary byte data using the uppercase letters A-Z. The input bytes are interpreted as a big-endian unsigned integer, which is then represented in radix 26 using A=0, B=1, ..., Z=25.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        input = new Uint8Array(input);
        if (input.length < 1) return "";

        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        let number = 0n;
        for (const byte of input) {
            number = (number << 8n) | BigInt(byte);
        }

        if (number === 0n) return ALPHABET[0];

        let output = "";
        while (number > 0n) {
            output = ALPHABET[Number(number % 26n)] + output;
            number /= 26n;
        }

        return output;
    }

}

export default ToBase26;
