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
 * BLAKE2b operation
 */
class BLAKE2b extends Operation {

    /**
     * BLAKE2b constructor
     */
    constructor() {
        super();

        this.name = "BLAKE2b";
        this.module = "Hashing";
        this.description = "Performs BLAKE2b hashing on the input. Returns the output HEX encoded.";
        this.infoURL = "https://wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2b_algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["512", "384", "256", "160", "128"]
            }, {
                "name": "Output Encoding",
                "type": "option",
                "value": ["Hex", "Base64", "Raw"]
            }, {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8", "Decimal", "Base64", "Hex", "Latin1"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string} The input having been hashed with BLAKE2b in the encoding format speicifed.
     */
    run(input, args) {
        const [outSize, outFormat] = args;
        let key = Utils.convertToByteArray(args[2].string || "", args[2].option);
        if (key.length === 0){
            key = null;
        } else if (key.length > 64){
            throw new OperationError(["Key cannot be greater than 64 bytes", "It is currently " + key.length +" bytes."].join("\n"));
        }
        switch (outFormat) {
            case "Hex":
                return blakejs.blake2bHex(input, key, outSize / 8);
            case "Base64":
                return toBase64(blakejs.blake2b(input, key, outSize / 8));
            case "Raw":
                return Utils.arrayBufferToStr(blakejs.blake2b(input, key, outSize / 8).buffer);
            default:
                return new OperationError("Unsupported Output Type");
        }
    }

}

export default BLAKE2b;
