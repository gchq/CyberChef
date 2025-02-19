/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import OperationError from "../errors/OperationError.mjs";
import { Blowfish } from "../lib/Blowfish.mjs";

/**
 * Blowfish Decrypt operation
 */
class BlowfishDecrypt extends Operation {

    /**
     * BlowfishDecrypt constructor
     */
    constructor() {
        super();

        this.name = "Blowfish Decrypt";
        this.module = "Ciphers";
        this.description = "Blowfish is a symmetric-key block cipher designed in 1993 by Bruce Schneier and included in a large number of cipher suites and encryption products. AES now receives more attention.<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.";
        this.infoURL = "https://wikipedia.org/wiki/Blowfish_(cipher)";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Key",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Mode",
                "type": "option",
                "value": ["CBC", "CFB", "OFB", "CTR", "ECB"]
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
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length < 4 || key.length > 56) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

Blowfish's key length needs to be between 4 and 56 bytes (32-448 bits).`);
        }

        if (mode !== "ECB" && iv.length !== 8) {
            throw new OperationError(`Invalid IV length: ${iv.length} bytes. Expected 8 bytes.`);
        }

        input = input.map((c) => String.fromCharCode(c)).join("");
        input = Utils.convertToByteString(input, inputType);

        const decipher = Blowfish.createDecipher(key, mode);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            const output = outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
            return Array.from(output).map((c) => c.charCodeAt(0));
        } else {
            throw new OperationError("Unable to decrypt input with these parameters.");
        }
    }

}

export default BlowfishDecrypt;
