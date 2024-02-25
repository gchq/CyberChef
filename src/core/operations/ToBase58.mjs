/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import { ALPHABET_OPTIONS } from "../lib/Base58.mjs";

/**
 * To Base58 operation
 */
class ToBase58 extends Operation {
    /**
     * ToBase58 constructor
     */
    constructor() {
        super();

        this.name = "To Base58";
        this.module = "Default";
        this.description
            = "Base58 (similar to Base64) is a notation for encoding arbitrary byte data. It differs from Base64 by removing easily misread characters (i.e. l, I, 0 and O) to improve human readability.<br><br>This operation encodes data in an ASCII string (with an alphabet of your choosing, presets included).<br><br>e.g. <code>hello world</code> becomes <code>StV1DL6CwTryKyV</code><br><br>Base58 is commonly used in cryptocurrencies (Bitcoin, Ripple, etc).";
        this.infoURL = "https://wikipedia.org/wiki/Base58";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Alphabet",
                "type": "editableOption",
                "value": ALPHABET_OPTIONS
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        input = new Uint8Array(input);
        let alphabet = args[0] || ALPHABET_OPTIONS[0].value,
            result = [0];

        alphabet = Utils.expandAlphRange(alphabet).join("");

        if (alphabet.length !== 58 || [].unique.call(alphabet).length !== 58) {
            throw new OperationError("Error: alphabet must be of length 58");
        }

        if (input.length === 0) return "";

        let zeroPrefix = 0;
        for (let i = 0; i < input.length && input[i] === 0; i++) {
            zeroPrefix++;
        }

        input.forEach(function (b) {
            let carry = (result[0] << 8) + b;
            result[0] = carry % 58;
            carry = (carry / 58) | 0;

            for (let i = 1; i < result.length; i++) {
                carry += result[i] << 8;
                result[i] = carry % 58;
                carry = (carry / 58) | 0;
            }

            while (carry > 0) {
                result.push(carry % 58);
                carry = (carry / 58) | 0;
            }
        });

        result = result
            .map(function (b) {
                return alphabet[b];
            })
            .reverse()
            .join("");

        while (zeroPrefix--) {
            result = alphabet[0] + result;
        }

        return result;
    }
}

export default ToBase58;
