/**
 * @author cbeuw [cbeuw.andy@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import Chacha20 from "../lib/Chacha20";
import Chacha20Poly1305 from "../lib/Chacha20Poly1305";

/**
 * Chacha20-Poly1305 Encrypt operation
 */
class Chacha20Poly1305Encrypt extends Operation {

    /**
     * Chacha20Poly1305Encrypt constructor
     */
    constructor() {
        super();

        this.name = "Chacha20-Poly1305 Encrypt";
        this.module = "Crypto";
        this.description = "Chacha20 is a stream cipher developed by Daniel Bernstein based on Salsa20. The cipher and the massage authentication code Poly1305 are defined by RFC8439. Chacha20 and Poly1305 are frequently used together for authenticated encryption, and has been included in TLS 1.3 protocol.<br><br><b>Key:</b> Key length should be 32 bytes (256 bits).<br><br><b>Nonce:</b> The one-time nonce should be 8 or 12 bytes long (64 or 96 bits).";
        this.infoURL = "https://tools.ietf.org/html/rfc8439";
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
                "name": "Authenticated Encryption",
                "type": "boolean",
                "value": "true"
            },
            {
                "name": "Additional Authentication Data",
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
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            nonce = Utils.convertToByteArray(args[1].string, args[1].option),
            useAEAD = args[2],
            aad = Utils.convertToByteArray(args[3].string, args[3].option),
            inputType = args[4],
            outputType = args[5];

        if (key.length !== 32) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

Chacha20 requires a key length of 32 bytes`);
        }
        if (nonce.length !== 8 && nonce.length !== 12) {
            throw new OperationError(`Invalid nonce length: ${nonce.length} bytes

Chacha20 requires a nonce length of 8 or 12 bytes`);
        }
        input = Utils.convertToByteArray(input, inputType);

        if (useAEAD) {
            const aead = new Chacha20Poly1305(key, nonce);
            const ret = aead.seal(input, aad);
            if (outputType === "Hex") {
                return Buffer.from(ret[0]).toString("hex") + "\n\n" +
                "Tag: " + Buffer.from(ret[1]).toString("hex");
            } else {
                return Buffer.from(ret[0]).toString() + "\n\n" +
                "Tag: " + Buffer.from(ret[1]).toString();
            }
        } else {
            const cipher = new Chacha20(key, nonce);
            const output = cipher.encrypt(input);
            if (outputType === "Hex") {
                return Buffer.from(output).toString("hex");
            } else {
                return Buffer.from(output).toString();
            }
        }
    }

}

export default Chacha20Poly1305Encrypt;
