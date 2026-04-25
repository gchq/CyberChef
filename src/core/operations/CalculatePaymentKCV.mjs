/**
 * @license Apache-2.0
 */

import forge from "node-forge";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import CMAC from "./CMAC.mjs";

/**
 * Calculate payment KCV operation
 */
class CalculatePaymentKCV extends Operation {

    /**
     * CalculatePaymentKCV constructor
     */
    constructor() {
        super();

        this.name = "Calculate Payment KCV";
        this.module = "Payment";
        this.description = "Paste the key into the input field and choose how that key is encoded using <b>Key format</b>.<br><br>Use <b>Method</b> to choose the KCV style: TDES, AES-CMAC, AES-ECB, or HMAC.<br><br><b>Input:</b> raw key material such as hex, UTF-8, Latin1, or Base64.<br><b>Arguments:</b> select the key format, method, and output length in hex characters.<br><br>Returns an uppercase truncated hex KCV value.";
        this.inlineHelp = "<strong>Input:</strong> key material.<br><strong>Args:</strong> tell the op how the key is encoded, choose the KCV method, then set the output length.";
        this.testDataSamples = [
            {
                name: "Random AES-CMAC sample",
                input: "__RANDOM_AES_128_HEX__",
                args: ["Hex", "AES-CMAC (Empty)", 6]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Message_authentication_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key format",
                "type": "option",
                "value": ["Hex", "UTF8", "Latin1", "Base64"],
                "comment": "How the input field should be decoded before KCV calculation. Use <code>Hex</code> for payment keys entered as hexadecimal characters."
            },
            {
                "name": "Method",
                "type": "option",
                "value": ["TDES-ECB (Zeros)", "AES-CMAC (Empty)", "AES-CMAC (Zeros)", "AES-CMAC (Ones)", "AES-ECB (Zeros)", "HMAC SHA-224", "HMAC SHA-256", "HMAC SHA-384", "HMAC SHA-512"],
                "comment": "Assumption: TDES expects a 16-byte or 24-byte key, AES expects 16/24/32 bytes, and the method name states the exact data block used for the KCV."
            },
            {
                "name": "Output hex chars",
                "type": "number",
                "value": 6,
                "comment": "Number of uppercase hex characters returned from the left side of the calculated value. Common payment KCV length is <code>6</code>."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [keyFormat, method, outputHexChars] = args;
        const truncLength = Math.max(1, Number(outputHexChars) || 6);
        const keyBytes = Utils.convertToByteString(input || "", keyFormat);

        if (!keyBytes.length) {
            throw new OperationError("No key material was provided.");
        }

        let hexOut;

        switch (method) {
            case "TDES-ECB (Zeros)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24) {
                    throw new OperationError("TDES key must be 16 or 24 bytes.");
                }
                const key = keyBytes.length === 16 ? keyBytes + keyBytes.substring(0, 8) : keyBytes;
                const cipher = forge.cipher.createCipher("3DES-ECB", key);
                cipher.start();
                cipher.update(forge.util.createBuffer("\x00\x00\x00\x00\x00\x00\x00\x00"));
                cipher.finish();
                hexOut = cipher.output.toHex().toUpperCase();
                break;
            }
            case "AES-CMAC (Empty)":
            case "AES-CMAC (Zeros)":
            case "AES-CMAC (Ones)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24 && keyBytes.length !== 32) {
                    throw new OperationError("AES key must be 16, 24, or 32 bytes.");
                }
                const cmacOp = new CMAC();
                let data;
                if (method === "AES-CMAC (Empty)") {
                    data = new Uint8Array(0).buffer;
                } else if (method === "AES-CMAC (Zeros)") {
                    data = new Uint8Array(16).buffer;
                } else {
                    data = Uint8Array.from(new Array(16).fill(0xFF)).buffer;
                }
                hexOut = cmacOp.run(data, [{ string: keyBytes, option: "Latin1" }, "AES"]).toUpperCase();
                break;
            }
            case "AES-ECB (Zeros)": {
                if (keyBytes.length !== 16 && keyBytes.length !== 24 && keyBytes.length !== 32) {
                    throw new OperationError("AES key must be 16, 24, or 32 bytes.");
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
            case "HMAC SHA-224":
            case "HMAC SHA-256":
            case "HMAC SHA-384":
            case "HMAC SHA-512": {
                const algorithmMap = {
                    "HMAC SHA-224": forge.md.sha512.sha224.create(),
                    "HMAC SHA-256": "sha256",
                    "HMAC SHA-384": "sha384",
                    "HMAC SHA-512": "sha512"
                };
                const hmac = forge.hmac.create();
                hmac.start(algorithmMap[method], keyBytes);
                hmac.update("");
                hexOut = hmac.digest().toHex().toUpperCase();
                break;
            }
            default:
                throw new OperationError("Unsupported method.");
        }

        return hexOut.substring(0, truncLength);
    }

}

export default CalculatePaymentKCV;
