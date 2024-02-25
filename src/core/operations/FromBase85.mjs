/**
 * @author PenguinGeorge [george@penguingeorge.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { ALPHABET_OPTIONS } from "../lib/Base85.mjs";

/**
 * From Base85 operation
 */
class FromBase85 extends Operation {
    /**
     * From Base85 constructor
     */
    constructor() {
        super();

        this.name = "From Base85";
        this.module = "Default";
        this.description =
            "Base85 (also called Ascii85) is a notation for encoding arbitrary byte data. It is usually more efficient that Base64.<br><br>This operation decodes data from an ASCII string (with an alphabet of your choosing, presets included).<br><br>e.g. <code>BOu!rD]j7BEbo7</code> becomes <code>hello world</code><br><br>Base85 is commonly used in Adobe's PostScript and PDF file formats.";
        this.infoURL = "https://wikipedia.org/wiki/Ascii85";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "editableOption",
                value: ALPHABET_OPTIONS,
            },
            {
                name: "Remove non-alphabet chars",
                type: "boolean",
                value: true,
            },
            {
                name: "All-zero group char",
                type: "binaryShortString",
                value: "z",
                maxLength: 1,
            },
        ];
        this.checks = [
            {
                pattern:
                    "^\\s*(?:<~)?" + // Optional whitespace and starting marker
                    "[\\s!-uz]*" + // Any amount of base85 characters and whitespace
                    "[!-uz]{15}" + // At least 15 continoues base85 characters without whitespace
                    "[\\s!-uz]*" + // Any amount of base85 characters and whitespace
                    "(?:~>)?\\s*$", // Optional ending marker and whitespace
                args: ["!-u"],
            },
            {
                pattern:
                    "^" +
                    "[\\s0-9a-zA-Z.\\-:+=^!/*?&<>()[\\]{}@%$#]*" +
                    "[0-9a-zA-Z.\\-:+=^!/*?&<>()[\\]{}@%$#]{15}" + // At least 15 continoues base85 characters without whitespace
                    "[\\s0-9a-zA-Z.\\-:+=^!/*?&<>()[\\]{}@%$#]*" +
                    "$",
                args: ["0-9a-zA-Z.\\-:+=^!/*?&<>()[]{}@%$#"],
            },
            {
                pattern:
                    "^" +
                    "[\\s0-9A-Za-z!#$%&()*+\\-;<=>?@^_`{|}~]*" +
                    "[0-9A-Za-z!#$%&()*+\\-;<=>?@^_`{|}~]{15}" + // At least 15 continoues base85 characters without whitespace
                    "[\\s0-9A-Za-z!#$%&()*+\\-;<=>?@^_`{|}~]*" +
                    "$",
                args: ["0-9A-Za-z!#$%&()*+\\-;<=>?@^_`{|}~"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const alphabet = Utils.expandAlphRange(args[0]).join(""),
            removeNonAlphChars = args[1],
            allZeroGroupChar =
                typeof args[2] === "string" ? args[2].slice(0, 1) : "",
            result = [];

        if (alphabet.length !== 85 || [].unique.call(alphabet).length !== 85) {
            throw new OperationError("Alphabet must be of length 85");
        }

        if (allZeroGroupChar && alphabet.includes(allZeroGroupChar)) {
            throw new OperationError(
                "The all-zero group char cannot appear in the alphabet",
            );
        }

        // Remove delimiters if present
        const matches = input.match(/^<~(.+?)~>$/);
        if (matches !== null) input = matches[1];

        // Remove non-alphabet characters
        if (removeNonAlphChars) {
            const re = new RegExp(
                "[^~" +
                    allZeroGroupChar +
                    alphabet.replace(/[[\]\\\-^$]/g, "\\$&") +
                    "]",
                "g",
            );
            input = input.replace(re, "");
            // Remove delimiters again if present (incase of non-alphabet characters in front/behind delimiters)
            const matches = input.match(/^<~(.+?)~>$/);
            if (matches !== null) input = matches[1];
        }

        if (input.length === 0) return [];

        let i = 0;
        let block, blockBytes;
        while (i < input.length) {
            if (input[i] === allZeroGroupChar) {
                result.push(0, 0, 0, 0);
                i++;
            } else {
                let digits = [];
                digits = input
                    .substr(i, 5)
                    .split("")
                    .map((chr, idx) => {
                        const digit = alphabet.indexOf(chr);
                        if (
                            (digit < 0 || digit > 84) &&
                            chr !== allZeroGroupChar
                        ) {
                            throw `Invalid character '${chr}' at index ${
                                i + idx
                            }`;
                        }
                        return digit;
                    });

                block =
                    digits[0] * 52200625 +
                    digits[1] * 614125 +
                    (i + 2 < input.length ? digits[2] : 84) * 7225 +
                    (i + 3 < input.length ? digits[3] : 84) * 85 +
                    (i + 4 < input.length ? digits[4] : 84);

                blockBytes = [
                    (block >> 24) & 0xff,
                    (block >> 16) & 0xff,
                    (block >> 8) & 0xff,
                    block & 0xff,
                ];

                if (input.length < i + 5) {
                    blockBytes.splice(input.length - (i + 5), 5);
                }

                result.push.apply(result, blockBytes);
                i += 5;
            }
        }

        return result;
    }
}

export default FromBase85;
