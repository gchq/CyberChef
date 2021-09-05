/**
 * @author cbeuw [cbeuw.andy@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import Salsa20 from "../lib/Salsa20";

/**
 * Salsa20 Decrypt operation
 */
class Salsa20Decrypt extends Operation {

    /**
     * Salsa20Decrypt constructor
     */
    constructor() {
        super();

        this.name = "Salsa20 Decrypt";
        this.module = "Crypto";
        this.description = "Salsa20 is a stream cipher developed by Daniel Bernstein in 2005.<br><br><b>Key:</b> Key length should be 16 or 32 bytes (128 or 256 bits).<br><br><b>Nonce:</b> The one-time nonce should be 8 bytes long.";
        this.infoURL = "https://en.wikipedia.org/wiki/Salsa20";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Nonce",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Input",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            nonce = Utils.convertToByteArray(args[1].string, args[1].option),
            inputType = args[2],
            outputType = args[3];

        if (key.length !== 16 && key.length !== 32) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

Salsa20 requires a key length of either 16 bytes or 32 bytes`);
        }
        if (nonce.length !== 8) {
            throw new OperationError(`Invalid nonce length: ${nonce.length} bytes

Salsa20 requires a nonce length of 8 bytes`);
        }
        input = Utils.convertToByteArray(input, inputType);

        const cipher = new Salsa20(key, nonce);
        const output = cipher.decrypt(input);

        if (outputType === "Hex") {
            return Buffer.from(output).toString("hex");
        } else {
            return Buffer.from(output).toString();
        }
    }

}

export default Salsa20Decrypt;
