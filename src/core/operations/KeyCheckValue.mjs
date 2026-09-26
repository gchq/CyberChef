/**
 * @author J8k3 [https://jacobmarks.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import forge from "node-forge";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import CMAC from "./CMAC.mjs";

/**
 * Key Check Value operation.
 *
 * A KCV is a short public value derived from a symmetric key so operators can
 * verify two systems hold the same key without exposing the key itself.
 *
 * Three standard methods are supported:
 *   - TDES-ECB (Zeros): ANSI X9.24-1 legacy KCV — encrypt an 8-byte zero block.
 *   - AES-ECB (Zeros): encrypt a 16-byte zero block, an AES analogue of the TDES form.
 *   - AES-CMAC (Empty): RFC 4493 / TR-31 KC-block KCV — CMAC of the empty message.
 */
class KeyCheckValue extends Operation {

    /**
     * KeyCheckValue constructor
     */
    constructor() {
        super();

        this.name = "Key Check Value";
        this.module = "Crypto";
        this.description = "Computes a Key Check Value (KCV) for a symmetric key. A KCV lets two parties verify they hold the same key without revealing it.<br><br><ul><li><b>TDES-ECB (Zeros)</b> — ANSI X9.24-1 legacy KCV: encrypt an 8-byte zero block with the key.</li><li><b>AES-ECB (Zeros)</b> — encrypt a 16-byte zero block with the key.</li><li><b>AES-CMAC (Empty)</b> — RFC 4493 CMAC of the empty message, used by TR-31 (ANSI X9.143) KC optional blocks.</li></ul>Returns the leading N hex characters of the resulting cryptogram. N must be a whole number between 1 and the cryptogram length (16 for TDES-ECB, 32 for AES-ECB and AES-CMAC).";
        this.infoURL = "https://wikipedia.org/wiki/Key_checksum_value";
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
                "name": "Method",
                "type": "option",
                "value": ["TDES-ECB (Zeros)", "AES-ECB (Zeros)", "AES-CMAC (Empty)"]
            },
            {
                "name": "Output length (hex chars)",
                "type": "number",
                "value": 6,
                "min": 1,
                "max": 32,
                "step": 1,
                "integer": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [keyArg, method, outputLength] = args;
        const keyBytes = Utils.convertToByteString(keyArg.string, keyArg.option);

        if (!keyBytes.length) {
            throw new OperationError("No key material was provided.");
        }

        if (!Number.isInteger(outputLength) || outputLength < 1) {
            throw new OperationError(`Invalid output length: ${outputLength}

Output length must be a whole number of hex characters, 1 or greater.`);
        }

        let hexOut;

        switch (method) {
            case "TDES-ECB (Zeros)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24) {
                    throw new OperationError("TDES key must be 16 or 24 bytes (currently " + keyBytes.length + " bytes).");
                }
                const key = keyBytes.length === 16 ? keyBytes + keyBytes.substring(0, 8) : keyBytes;
                const cipher = forge.cipher.createCipher("3DES-ECB", key);
                cipher.mode.pad = function() {
                    return true;
                };
                cipher.start();
                cipher.update(forge.util.createBuffer("\x00\x00\x00\x00\x00\x00\x00\x00"));
                cipher.finish();
                hexOut = cipher.output.toHex().toUpperCase();
                break;
            }
            case "AES-ECB (Zeros)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24 && keyBytes.length !== 32) {
                    throw new OperationError("AES key must be 16, 24, or 32 bytes (currently " + keyBytes.length + " bytes).");
                }
                const cipher = forge.cipher.createCipher("AES-ECB", keyBytes);
                cipher.mode.pad = function() {
                    return true;
                };
                cipher.start();
                cipher.update(forge.util.createBuffer("\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"));
                cipher.finish();
                hexOut = cipher.output.toHex().toUpperCase();
                break;
            }
            case "AES-CMAC (Empty)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24 && keyBytes.length !== 32) {
                    throw new OperationError("AES key must be 16, 24, or 32 bytes (currently " + keyBytes.length + " bytes).");
                }
                const cmacOp = new CMAC();
                const emptyInput = new ArrayBuffer(0);
                hexOut = cmacOp.run(emptyInput, [{string: keyBytes, option: "Latin1"}, "AES"]).toUpperCase();
                break;
            }
            default:
                throw new OperationError("Unsupported method: " + method);
        }

        if (outputLength > hexOut.length) {
            throw new OperationError(`Invalid output length: ${outputLength}

${method} produces a ${hexOut.length} hex character cryptogram, so the output length must be between 1 and ${hexOut.length}.`);
        }

        return hexOut.substring(0, outputLength);
    }

}

export default KeyCheckValue;
