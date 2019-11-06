/**
 * @author Karsten Silkenbäumer [github.com/kassi]
 * @copyright Karsten Silkenbäumer 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {
    BACON_ALPHABETS,
    BACON_TRANSLATION_CASE, BACON_TRANSLATION_AMNZ, BACON_TRANSLATIONS, BACON_CLEARER_MAP, BACON_NORMALIZE_MAP,
    swapZeroAndOne
} from "../lib/Bacon.mjs";

/**
 * Bacon Cipher Decode operation
 */
class BaconCipherDecode extends Operation {
    /**
     * BaconCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Bacon Cipher Decode";
        this.module = "Default";
        this.description = "Bacon's cipher or the Baconian cipher is a method of steganography devised by Francis Bacon in 1605. A message is concealed in the presentation of text, rather than its content.";
        this.infoURL = "https://wikipedia.org/wiki/Bacon%27s_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Alphabet",
                "type": "option",
                "value": Object.keys(BACON_ALPHABETS)
            },
            {
                "name": "Translation",
                "type": "option",
                "value": BACON_TRANSLATIONS
            },
            {
                "name": "Invert Translation",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [alphabet, translation, invert] = args;
        const alphabetObject = BACON_ALPHABETS[alphabet];

        // remove invalid characters
        input = input.replace(BACON_CLEARER_MAP[translation], "");

        // normalize to unique alphabet
        if (BACON_NORMALIZE_MAP[translation] !== undefined) {
            input = input.replace(/./g, function (c) {
                return BACON_NORMALIZE_MAP[translation][c];
            });
        } else if (translation === BACON_TRANSLATION_CASE) {
            const codeA = "A".charCodeAt(0);
            const codeZ = "Z".charCodeAt(0);
            input = input.replace(/./g, function (c) {
                const code = c.charCodeAt(0);
                if (code >= codeA && code <= codeZ) {
                    return "1";
                } else {
                    return "0";
                }
            });
        } else if (translation === BACON_TRANSLATION_AMNZ) {
            const words = input.split(/\s+/);
            const letters = words.map(function (e) {
                if (e) {
                    const code = e[0].toUpperCase().charCodeAt(0);
                    return code >= "N".charCodeAt(0) ? "1" : "0";
                } else {
                    return "";
                }
            });
            input = letters.join("");
        }

        if (invert) {
            input = swapZeroAndOne(input);
        }

        // group into 5
        const inputArray = input.match(/(.{5})/g) || [];

        let output = "";
        for (let i = 0; i < inputArray.length; i++) {
            const code = inputArray[i];
            const number = parseInt(code, 2);
            output += number < alphabetObject.alphabet.length ? alphabetObject.alphabet[number] : "?";
        }
        return output;
    }
}

export default BaconCipherDecode;
