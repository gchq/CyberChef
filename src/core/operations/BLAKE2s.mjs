/**
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import blakejs from "blakejs";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { toBase64 } from "../lib/Base64";
/**
 * BLAKE2s Operation
 */
class BLAKE2s extends Operation {

    /**
     * BLAKE2s constructor
     */
    constructor() {
        super();

        this.name = "BLAKE2s";
        this.module = "Hashing";
        this.description = "Performs BLAKE2s hashing on the input. Returns the output HEX encoded.";
        this.infoURL = "https://wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["256", "160", "128"]
            }, {
                "name": "Output Encoding",
                "type": "option",
                "value": ["Hex", "Base64", "Raw"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} The input having been hashed with BLAKE2s in the encoding format speicifed.
     */
    run(input, args) {
        const [outSize, outFormat] = args;
        switch (outFormat) {
            case "Hex":
                return blakejs.blake2sHex(input, null, outSize / 8);
            case "Base64":
                return toBase64(blakejs.blake2s(input, null, outSize / 8));
            case "Raw":
                return Utils.arrayBufferToStr(blakejs.blake2s(input, null, outSize / 8).buffer);
            default:
                return new OperationError("Unsupported Output Type");
        }
    }

}

export default BLAKE2s;
