/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import forge from "node-forge/dist/forge.min.js";

/**
 * DES Encrypt operation
 */
class DESEncrypt extends Operation {

    /**
     * DESEncrypt constructor
     */
    constructor() {
        super();

        this.name = "DES Encrypt";
        this.module = "Ciphers";
        this.description = "DES is a previously dominant algorithm for encryption, and was published as an official U.S. Federal Information Processing Standard (FIPS). It is now considered to be insecure due to its small key size.<br><br><b>Key:</b> DES uses a key length of 8 bytes (64 bits).<br>Triple DES uses a key length of 24 bytes (192 bits).<br><br>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
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
                "value": ["Raw", "Hex"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Hex", "Raw"]
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

        if (key.length !== 8) {
            return `Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher("DES-" + mode, key);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    }

}

export default DESEncrypt;
