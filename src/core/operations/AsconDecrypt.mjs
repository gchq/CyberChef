/**
 * @author Medjedtxm 
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import JsAscon from "js-ascon";

/**
 * Ascon Decrypt operation
 */
class AsconDecrypt extends Operation {

    /**
     * AsconDecrypt constructor
     */
    constructor() {
        super();

        this.name = "Ascon Decrypt";
        this.module = "Ciphers";
        this.description = "Ascon-AEAD128 authenticated decryption as standardised in NIST SP 800-232. Decrypts ciphertext and verifies the authentication tag. Decryption will fail if the ciphertext or associated data has been tampered with.<br><br><b>Key:</b> Must be exactly 16 bytes (128 bits).<br><br><b>Nonce:</b> Must be exactly 16 bytes (128 bits). Must match the nonce used during encryption.<br><br><b>Associated Data:</b> Must match the associated data used during encryption. Any mismatch will cause authentication failure.";
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
     * @throws {OperationError} if invalid key or nonce length, or authentication fails
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            nonce = Utils.convertToByteArray(args[1].string, args[1].option),
            ad = Utils.convertToByteArray(args[2].string, args[2].option),
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

        const keyUint8 = new Uint8Array(key);
        const nonceUint8 = new Uint8Array(nonce);
        const adUint8 = new Uint8Array(ad);
        const ciphertextUint8 = new Uint8Array(inputData);

        try {
            // Decrypt (returns Uint8Array containing plaintext)
            const plaintext = JsAscon.decrypt(keyUint8, nonceUint8, adUint8, ciphertextUint8);

            // Return in requested format
            if (outputType === "Hex") {
                return toHexFast(plaintext);
            } else {
                return Utils.arrayBufferToStr(Uint8Array.from(plaintext).buffer);
            }
        } catch (e) {
            throw new OperationError("Unable to decrypt: authentication failed. The ciphertext, key, nonce, or associated data may be incorrect or tampered with.");
        }
    }

}

export default AsconDecrypt;
