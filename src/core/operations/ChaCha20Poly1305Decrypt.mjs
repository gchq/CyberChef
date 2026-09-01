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
 * ChaCha20-Poly1305 Decrypt operation
 */
class ChaCha20Poly1305Decrypt extends Operation {

    /**
     * ChaCha20Poly1305Decrypt constructor
     */
    constructor() {
        super();

        this.name = "ChaCha20-Poly1305 Decrypt";
        this.module = "Ciphers";
        this.description = "ChaCha20-Poly1305 is an Authenticated Encryption with Associated Data (AEAD) algorithm combining the ChaCha20 stream cipher with the Poly1305 message authentication code, as standardised in RFC 8439.<br><br><b>Key:</b> Must be exactly 32 bytes (256 bits).<br><br><b>Nonce:</b> Must be exactly 12 bytes (96 bits). Must match the nonce used during encryption.<br><br><b>AAD:</b> Must match the associated data used during encryption.<br><br><b>Tag:</b> The 16-byte authentication tag produced during encryption.";
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
                "name": "Tag",
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
     * @throws {OperationError} if invalid key/nonce length or authentication fails
     */
    run(input, args) {
        const keyArr = Utils.convertToByteArray(args[0].string, args[0].option),
            nonceArr = Utils.convertToByteArray(args[1].string, args[1].option),
            aadArr = Utils.convertToByteArray(args[2].string, args[2].option),
            tagArr = Utils.convertToByteArray(args[3].string, args[3].option),
            inputType = args[4],
            outputType = args[5];

        if (keyArr.length !== 32) {
            throw new OperationError(`Invalid key length: ${keyArr.length} bytes.\n\nChaCha20-Poly1305 requires a key of exactly 32 bytes (256 bits).`);
        }

        if (nonceArr.length !== 12) {
            throw new OperationError(`Invalid nonce length: ${nonceArr.length} bytes.\n\nChaCha20-Poly1305 requires a nonce of exactly 12 bytes (96 bits).`);
        }

        if (tagArr.length !== 16) {
            throw new OperationError(`Invalid tag length: ${tagArr.length} bytes.\n\nChaCha20-Poly1305 requires a tag of exactly 16 bytes (128 bits).`);
        }

        const inputData = Utils.convertToByteArray(input, inputType);

        const key = Buffer.from(keyArr);
        const nonce = Buffer.from(nonceArr);
        const aad = Buffer.from(aadArr);
        const tag = Buffer.from(tagArr);
        const ciphertext = Buffer.from(inputData);

        try {
            const decipher = crypto.createDecipheriv("chacha20-poly1305", key, nonce, {authTagLength: 16});
            decipher.setAuthTag(tag);
            if (aad.length > 0) {
                decipher.setAAD(aad);
            }
            const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

            if (outputType === "Hex") {
                return toHexFast(plaintext);
            }
            return Utils.arrayBufferToStr(plaintext.buffer);
        } catch (e) {
            throw new OperationError("Unable to decrypt: authentication failed. The ciphertext, key, nonce, AAD, or tag may be incorrect.");
        }
    }

}

export default ChaCha20Poly1305Decrypt;
