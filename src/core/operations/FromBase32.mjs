/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import {ALPHABET_OPTIONS} from "../lib/Base32.mjs";


/**
 * From Base32 operation
 */
class FromBase32 extends Operation {

    /**
     * FromBase32 constructor
     */
    constructor() {
        super();

        this.name = "From Base32";
        this.module = "Default";
        this.description = "Base32 is a notation for encoding arbitrary byte data using a restricted set of symbols that can be conveniently used by humans and processed by computers. It uses a smaller set of characters than Base64, usually the uppercase alphabet and the numbers 2 to 7.";
        this.infoURL = "https://wikipedia.org/wiki/Base32";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Alphabet",
                type: "editableOption",
                value: ALPHABET_OPTIONS
            },
            {
                name: "Remove non-alphabet chars",
                type: "boolean",
                value: true
            }
        ];
        this.checks = [
            {
                pattern: "^(?:[A-Z2-7]{8})+(?:[A-Z2-7]{2}={6}|[A-Z2-7]{4}={4}|[A-Z2-7]{5}={3}|[A-Z2-7]{7}={1})?$",
                flags: "",
                args: [ALPHABET_OPTIONS.find(opt => opt.name === "Standard").value, false]
            },
            {
                pattern: "^(?:[0-9A-V]{8})+(?:[0-9A-V]{2}={6}|[0-9A-V]{4}={4}|[0-9A-V]{5}={3}|[0-9A-V]{7}={1})?$",
                flags: "",
                args: [ALPHABET_OPTIONS.find(opt => opt.name === "Hex Extended").value, false]
            },
            {
                pattern: "^(?:[0-9A-TV-Za-tv-z]{8})+(?:[0-9A-TV-Za-tv-z]{2}={6}|[0-9A-TV-Za-tv-z]{4}={4}|[0-9A-TV-Za-tv-z]{5}={3}|[0-9A-TV-Za-tv-z]{7}=)?$",
                flags: "",
                args: [ALPHABET_OPTIONS.find(opt => opt.name === "Crockford's alphabet").value, false]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        if (!input) return [];

        const alphabet = Utils.expandAlphRange(args[0]).join(""),
            removeNonAlphChars = args[1],
            output = [];

        if (alphabet.length !== 33) {
            throw new OperationError("Alphabet must be of length 33"); // 32 characters + 1 padding
        }
        const isCrockford = alphabet === Utils.expandAlphRange(ALPHABET_OPTIONS.find(opt => opt.name === "Crockford's alphabet").value).join("");
        if (isCrockford) {
            input = input
                .replace(/[oO]/g, "0")
                .replace(/[iIlL]/g, "1")
                .toUpperCase();
        }
        let chr1, chr2, chr3, chr4, chr5,
            enc1, enc2, enc3, enc4, enc5, enc6, enc7, enc8,
            i = 0;

        if (removeNonAlphChars) {
            const re = new RegExp("[^" + alphabet.replace(/[\]\\\-^]/g, "\\$&") + "]", "g");
            input = input.replace(re, "");
        }

        while (i < input.length) {
            enc1 = alphabet.indexOf(input.charAt(i++));
            enc2 = alphabet.indexOf(input.charAt(i++) || "=");
            enc3 = alphabet.indexOf(input.charAt(i++) || "=");
            enc4 = alphabet.indexOf(input.charAt(i++) || "=");
            enc5 = alphabet.indexOf(input.charAt(i++) || "=");
            enc6 = alphabet.indexOf(input.charAt(i++) || "=");
            enc7 = alphabet.indexOf(input.charAt(i++) || "=");
            enc8 = alphabet.indexOf(input.charAt(i++) || "=");

            chr1 = (enc1 << 3) | (enc2 >> 2);
            chr2 = ((enc2 & 3) << 6) | (enc3 << 1) | (enc4 >> 4);
            chr3 = ((enc4 & 15) << 4) | (enc5 >> 1);
            chr4 = ((enc5 & 1) << 7) | (enc6 << 2) | (enc7 >> 3);
            chr5 = ((enc7 & 7) << 5) | enc8;

            output.push(chr1);
            if ((enc2 & 3) !== 0 || enc3 !== 32) output.push(chr2);
            if ((enc4 & 15) !== 0 || enc5 !== 32) output.push(chr3);
            if ((enc5 & 1) !== 0 || enc6 !== 32) output.push(chr4);
            if ((enc7 & 7) !== 0 || enc8 !== 32) output.push(chr5);
        }

        return output;
    }

}

export default FromBase32;

