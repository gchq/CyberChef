/**
 * @author dgoldenberg [dgoldenberg@mitre.org]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
// import OperationError from "../errors/OperationError.mjs";
import { base58Encode, doubleSHA,  makeSureIsHex} from "../lib/Bitcoin.mjs";
import { fromArrayBuffer } from "crypto-api/src/encoder/array-buffer.mjs";
import {toHex} from "crypto-api/src/encoder/hex.mjs";
import Utils from "../Utils.mjs";
/**
 * To Base58Check operation
 */
class ToBase58Check extends Operation {

    /**
     * ToBase58Check constructor
     */
    constructor() {
        super();

        this.name = "To Base58Check";
        this.module = "Default";
        this.description = "Converts passed in string to Base58 Check Encoding. Version Bytes (as hex) are pre-pended, and a checksum is created.";
        this.infoURL = "https://en.bitcoin.it/Base58Check_encoding"; // Usually a Wikipedia link. Remember to remove localisation (i.e. https://wikipedia.org/etc rather than https://en.wikipedia.org/etc)
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Version Bytes",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex"]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // We check if input is blank.
        // If its blank or just whitespace, we don't need to bother dealing with it.

        if (input.trim().length === 0) {
            return "";
        }
        input = input.trim();
        const processedInput = makeSureIsHex(input);
        const processedVersion = makeSureIsHex(args[0].string);
        const extendedInput = processedVersion + processedInput;
        const checksumHash = toHex(doubleSHA(fromArrayBuffer(Utils.convertToByteArray(extendedInput, "hex"))));
        const finalString = extendedInput + checksumHash.slice(0, 8);
        const encodedOutput = base58Encode(Utils.convertToByteArray(finalString, "hex"));
        return encodedOutput;
    }

}

export default ToBase58Check;
