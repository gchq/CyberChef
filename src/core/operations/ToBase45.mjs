/**
 * @author Thomas Weißschuh [thomas@t-8ch.de]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

/**
 * To Base45 operation
 */
class ToBase45 extends Operation {

    /**
     * ToBase45 constructor
     */
    constructor() {
        super();

        this.name = "To Base45";
        this.module = "Default";
        this.description = "Base45 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. The high number base results in shorter strings than with the decimal or hexadecimal system. Base45 is optimized for usage with QR codes.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Alphabet",
                type: "string",
                value: "0-9A-Za-z"
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const alphabet = Utils.expandAlphRange("0-9A-Z $%*+-./:").join("");
        input = new Uint8Array(input);
        if (!input) return "";

        const res = [];

        for (const pair of Utils.chunked(input, 2)) {
            let b = 0;
            for (const e of pair) {
                b *= 256;
                b += e;
            }

            let chars = 0;
            do {
                res.push(alphabet[b % 45]);
                chars++;
                b = Math.floor(b / 45);
            } while (b > 0);

            if (chars < 2) {
                res.push("0");
            }
        }


        return res.join("");

    }

}

export default ToBase45;
