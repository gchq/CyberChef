/**
 * @author tcode2k16 [tcode2k16@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import BigNumber from "bignumber.js";
import Utils from "../Utils.mjs";

/**
 * From Base62 operation
 */
class FromBase62 extends Operation {
    /**
     * FromBase62 constructor
     */
    constructor() {
        super();

        this.name = "From Base62";
        this.module = "Default";
        this.description =
            "Base62 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. The high number base results in shorter strings than with the decimal or hexadecimal system.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "string",
                value: "0-9A-Za-z",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        if (input.length < 1) return [];
        const alphabet = Utils.expandAlphRange(args[0]).join("");
        const BN62 = BigNumber.clone({ ALPHABET: alphabet });

        const re = new RegExp(
            "[^" + alphabet.replace(/[[\]\\\-^$]/g, "\\$&") + "]",
            "g",
        );
        input = input.replace(re, "");

        // Read number in using Base62 alphabet
        const number = new BN62(input, 62);
        // Copy to new BigNumber object that uses the default alphabet
        const normalized = new BigNumber(number);

        // Convert to hex and add leading 0 if required
        let hex = normalized.toString(16);
        if (hex.length % 2 !== 0) hex = "0" + hex;

        return Utils.convertToByteArray(hex, "Hex");
    }
}

export default FromBase62;
