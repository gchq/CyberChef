/**
 * @author Thomas Weißschuh [thomas@t-8ch.de]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import {
    ALPHABET,
    highlightToBase45,
    highlightFromBase45,
} from "../lib/Base45.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

/**
 * From Base45 operation
 */
class FromBase45 extends Operation {
    /**
     * FromBase45 constructor
     */
    constructor() {
        super();

        this.name = "From Base45";
        this.module = "Default";
        this.description =
            "Base45 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. The high number base results in shorter strings than with the decimal or hexadecimal system. Base45 is optimized for usage with QR codes.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_numeral_systems";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "string",
                value: ALPHABET,
            },
            {
                name: "Remove non-alphabet chars",
                type: "boolean",
                value: true,
            },
        ];

        this.highlight = highlightFromBase45;
        this.highlightReverse = highlightToBase45;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        if (!input) return [];
        const alphabet = Utils.expandAlphRange(args[0]).join("");
        const removeNonAlphChars = args[1];

        const res = [];

        // Remove non-alphabet characters
        if (removeNonAlphChars) {
            const re = new RegExp(
                "[^" + alphabet.replace(/[[\]\\\-^$]/g, "\\$&") + "]",
                "g",
            );
            input = input.replace(re, "");
        }

        for (const triple of Utils.chunked(input, 3)) {
            triple.reverse();
            let b = 0;
            for (const c of triple) {
                const idx = alphabet.indexOf(c);
                if (idx === -1) {
                    throw new OperationError(
                        `Character not in alphabet: '${c}'`,
                    );
                }
                b *= 45;
                b += idx;
            }

            if (b > 65535) {
                throw new OperationError(
                    `Triplet too large: '${triple.join("")}'`,
                );
            }

            if (triple.length > 2) {
                /**
                 * The last triple may only have 2 bytes so we push the MSB when we got 3 bytes
                 * Pushing MSB
                 */
                res.push(b >> 8);
            }

            /**
             * Pushing LSB
             */
            res.push(b & 0xff);
        }

        return res;
    }
}

export default FromBase45;
