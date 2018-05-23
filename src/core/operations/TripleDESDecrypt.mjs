/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import forge from "node-forge/dist/forge.min.js";

/**
 * Triple DES Decrypt operation
 */
class TripleDESDecrypt extends Operation {

    /**
     * TripleDESDecrypt constructor
     */
    constructor() {
        super();

        this.name = "Triple DES Decrypt";
        this.module = "Ciphers";
        this.description = "Triple DES applies DES three times to each block to increase key size.<br><br><b>Key:</b> Triple DES uses a key length of 24 bytes (192 bits).<br>DES uses a key length of 8 bytes (64 bits).<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
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
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 24) {
            return `Invalid key length: ${key.length} bytes

Triple DES uses a key length of 24 bytes (192 bits).
DES uses a key length of 8 bytes (64 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const decipher = forge.cipher.createDecipher("3DES-" + mode, key);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
        } else {
            return "Unable to decrypt input with these parameters.";
        }
    }

}

export default TripleDESDecrypt;
