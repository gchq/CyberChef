/**
 * @author NOVA-Openclaw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * From Base26 operation
 */
class FromBase26 extends Operation {

    /**
     * FromBase26 constructor
     */
    constructor() {
        super();

        this.name = "From Base26";
        this.module = "Default";
        this.description = "Base26 is a notation for encoding arbitrary byte data using the uppercase letters A-Z. The input string is interpreted as a radix-26 number using A=0, B=1, ..., Z=25, and converted back to its big-endian byte representation.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        if (input.length < 1) return [];

        const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const re = new RegExp("[^A-Za-z]", "g");
        input = input.replace(re, "").toUpperCase();

        if (input.length < 1) return [];

        let number = 0n;
        for (const c of input) {
            number = number * 26n + BigInt(ALPHABET.indexOf(c));
        }

        if (number === 0n) return [0];

        const bytes = [];
        while (number > 0n) {
            bytes.unshift(Number(number & 0xFFn));
            number >>= 8n;
        }

        return bytes;
    }

}

export default FromBase26;
