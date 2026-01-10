/**
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * Ascon Encrypt operation
 */
class AsconEncrypt extends Operation {

    /**
     * AsconEncrypt constructor
     */
    constructor() {
        super();

        this.name = "Ascon Encrypt";
        this.module = "Ciphers";
        this.description = "Ascon-AEAD128 authenticated encryption as standardised in NIST SP 800-232. Ascon is a family of lightweight authenticated encryption algorithms designed for constrained devices such as IoT sensors and embedded systems.<br><br><b>Key:</b> Must be exactly 16 bytes (128 bits).<br><br><b>Nonce:</b> Must be exactly 16 bytes (128 bits). Should be unique for each encryption with the same key. Never reuse a nonce with the same key.<br><br><b>Associated Data:</b> Optional additional data that is authenticated but not encrypted. Useful for including metadata like headers or timestamps.<br><br>The output includes both the ciphertext and a 128-bit authentication tag.";
        this.infoURL = "https://wikipedia.org/wiki/Ascon_(cipher)";
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
                "name": "Associated Data",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
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
    async run(input, args) {
        const JsAscon = (await import("js-ascon")).default;

        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            nonce = Utils.convertToByteArray(args[1].string, args[1].option),
            ad = Utils.convertToByteString(args[2].string, args[2].option),
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 16) {
            throw new OperationError(`Invalid key length: ${key.length} bytes.

Ascon-AEAD128 requires a key of exactly 16 bytes (128 bits).`);
        }

        if (nonce.length !== 16) {
            throw new OperationError(`Invalid nonce length: ${nonce.length} bytes.

Ascon-AEAD128 requires a nonce of exactly 16 bytes (128 bits).`);
        }

        // Convert input to byte array
        const inputData = Utils.convertToByteArray(input, inputType);

        // Convert to format expected by js-ascon
        const keyUint8 = new Uint8Array(key);
        const nonceUint8 = new Uint8Array(nonce);
        const inputStr = Utils.byteArrayToChars(inputData);

        // Encrypt (returns Uint8Array containing ciphertext + tag)
        const ciphertext = JsAscon.encrypt(keyUint8, nonceUint8, ad, inputStr);

        // Return in requested format
        if (outputType === "Hex") {
            return toHexFast(ciphertext);
        } else {
            return Utils.arrayBufferToStr(Uint8Array.from(ciphertext).buffer);
        }
    }

}

export default AsconEncrypt;
