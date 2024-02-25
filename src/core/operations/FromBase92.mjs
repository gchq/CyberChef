/**
 * @author sg5506844 [sg5506844@gmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import { base92Ord } from "../lib/Base92.mjs";
import Operation from "../Operation.mjs";

/**
 * From Base92 operation
 */
class FromBase92 extends Operation {
    /**
     * FromBase92 constructor
     */
    constructor() {
        super();

        this.name = "From Base92";
        this.module = "Default";
        this.description
            = "Base92 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "string";
        this.outputType = "byteArray";
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const res = [];
        let bitString = "";

        for (let i = 0; i < input.length; i += 2) {
            if (i + 1 !== input.length) {
                const x = base92Ord(input[i]) * 91 + base92Ord(input[i + 1]);
                bitString += x.toString(2).padStart(13, "0");
            } else {
                const x = base92Ord(input[i]);
                bitString += x.toString(2).padStart(6, "0");
            }
            while (bitString.length >= 8) {
                res.push(parseInt(bitString.slice(0, 8), 2));
                bitString = bitString.slice(8);
            }
        }

        return res;
    }
}

export default FromBase92;
