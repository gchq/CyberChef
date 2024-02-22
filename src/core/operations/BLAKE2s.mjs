/**
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import blakejs from "blakejs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toBase64 } from "../lib/Base64.mjs";

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
        this.description = `Performs BLAKE2s hashing on the input.  
        <br><br>BLAKE2s is a flavour of the BLAKE cryptographic hash function that is optimized for 8- to 32-bit platforms and produces digests of any size between 1 and 32 bytes.
        <br><br>Supports the use of an optional key.`;
        this.infoURL = "https://wikipedia.org/wiki/BLAKE_(hash_function)#BLAKE2";
        this.inputType = "ArrayBuffer";
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
            },
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["UTF8", "Decimal", "Base64", "Hex", "Latin1"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string} The input having been hashed with BLAKE2s in the encoding format specified.
     */
    run(input, args) {
        const [outSize, outFormat] = args;
        let key = Utils.convertToByteArray(args[2].string || "", args[2].option);
        if (key.length === 0) {
            key = null;
        } else if (key.length > 32) {
            throw new OperationError(["Key cannot be greater than 32 bytes", "It is currently " + key.length + " bytes."].join("\n"));
        }

        input = new Uint8Array(input);
        switch (outFormat) {
            case "Hex":
                return blakejs.blake2sHex(input, key, outSize / 8);
            case "Base64":
                return toBase64(blakejs.blake2s(input, key, outSize / 8));
            case "Raw":
                return Utils.arrayBufferToStr(blakejs.blake2s(input, key, outSize / 8).buffer);
            default:
                return new OperationError("Unsupported Output Type");
        }
    }

}

export default BLAKE2s;
