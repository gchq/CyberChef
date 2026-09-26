/**
 * @author CyberChef Contributors
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import crypto from "crypto";

/**
 * ChaCha20-Poly1305 Encrypt operation
 */
class ChaCha20Poly1305Encrypt extends Operation {

    /**
     * ChaCha20Poly1305Encrypt constructor
     */
    constructor() {
        super();

        this.name = "ChaCha20-Poly1305 Encrypt";
        this.module = "Ciphers";
        this.description = "ChaCha20-Poly1305 is an Authenticated Encryption with Associated Data (AEAD) algorithm combining the ChaCha20 stream cipher with the Poly1305 message authentication code, as standardised in RFC 8439.<br><br><b>Key:</b> Must be exactly 32 bytes (256 bits).<br><br><b>Nonce:</b> Must be exactly 12 bytes (96 bits). Should be unique for each encryption with the same key.<br><br><b>AAD:</b> Optional additional data that is authenticated but not encrypted.";
        this.infoURL = "https://wikipedia.org/wiki/ChaCha20-Poly1305";
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
                "name": "AAD",
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
     * @throws {OperationError} if invalid key or nonce length
     */
    run(input, args) {
        const keyArr = Utils.convertToByteArray(args[0].string, args[0].option),
            nonceArr = Utils.convertToByteArray(args[1].string, args[1].option),
            aadArr = Utils.convertToByteArray(args[2].string, args[2].option),
            inputType = args[3],
            outputType = args[4];

        if (keyArr.length !== 32) {
            throw new OperationError(`Invalid key length: ${keyArr.length} bytes.\n\nChaCha20-Poly1305 requires a key of exactly 32 bytes (256 bits).`);
        }

        if (nonceArr.length !== 12) {
            throw new OperationError(`Invalid nonce length: ${nonceArr.length} bytes.\n\nChaCha20-Poly1305 requires a nonce of exactly 12 bytes (96 bits).`);
        }

        const inputData = Utils.convertToByteArray(input, inputType);

        const key = Buffer.from(keyArr);
        const nonce = Buffer.from(nonceArr);
        const aad = Buffer.from(aadArr);
        const plaintext = Buffer.from(inputData);

        const cipher = crypto.createCipheriv("chacha20-poly1305", key, nonce, {authTagLength: 16});
        if (aad.length > 0) {
            cipher.setAAD(aad);
        }
        const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
        const tag = cipher.getAuthTag();

        if (outputType === "Hex") {
            return toHexFast(ciphertext) + "\n\nTag: " + toHexFast(tag);
        }
        return Utils.arrayBufferToStr(ciphertext.buffer.slice(ciphertext.byteOffset, ciphertext.byteOffset + ciphertext.byteLength)) + "\n\nTag: " +
            Utils.arrayBufferToStr(tag.buffer.slice(tag.byteOffset, tag.byteOffset + tag.byteLength));
    }

}

export default ChaCha20Poly1305Encrypt;
