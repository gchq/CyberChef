/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import OperationError from "../errors/OperationError.mjs";
import { eaxDecrypt } from "../lib/EAX.mjs";
import { ccmDecrypt } from "../lib/CCM.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * AES Decrypt operation
 */
class AESDecrypt extends Operation {

    /**
     * AESDecrypt constructor
     */
    constructor() {
        super();

        this.name = "AES Decrypt";
        this.module = "Ciphers";
        this.description = "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul><br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used as a default.<br><br><b>Tag:</b> Required for authenticated modes (GCM, CCM, EAX). This is the authentication tag produced during encryption.<br><br><b>CCM nonce:</b> Must be 7\u201313 bytes.<br><br><b>EAX nonce:</b> Can be any length (16 bytes typical).";
        this.infoURL = "https://wikipedia.org/wiki/Advanced_Encryption_Standard";
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
                "name": "IV Length",
                "type": "number",
                "value": 16
            },
            {
                "name": "Mode",
                "type": "argSelector",
                "value": [
                    {
                        name: "CBC",
                        off: [6, 7, 9]
                    },
                    {
                        name: "CFB",
                        off: [6, 7, 9]
                    },
                    {
                        name: "OFB",
                        off: [6, 7, 9]
                    },
                    {
                        name: "CTR",
                        off: [6, 7, 9]
                    },
                    {
                        name: "GCM",
                        on: [6, 7, 9]
                    },
                    {
                        name: "CCM",
                        on: [6, 7, 9]
                    },
                    {
                        name: "EAX",
                        on: [6, 7],
                        off: [9]
                    },
                    {
                        name: "ECB",
                        off: [6, 7, 9]
                    },
                    {
                        name: "CBC/NoPadding",
                        off: [6, 7, 9]
                    },
                    {
                        name: "ECB/NoPadding",
                        off: [6, 7, 9]
                    }
                ]
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
            },
            {
                "name": "Tag",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Additional Authenticated Data",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "IV from input",
                "type": "argSelector",
                "value": [
                    {
                        name: "Off",
                        on: [1],
                        off: [2]
                    },
                    {
                        name: "From start",
                        on: [2],
                        off: [1]
                    }, {
                        name: "From end",
                        on: [2],
                        off: [1]
                    }
                ]
            },
            {
                "name": "Tag Length",
                "type": "number",
                "value": 16,
                "min": 4,
                "max": 16,
                "step": 2
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if cannot decrypt input or invalid key length
     */
    run(input, args) {
        let iv;

        const key = Utils.convertToByteString(args[0].string, args[0].option),
            ivLength = args[2],
            mode = args[3].split("/")[0],
            noPadding = args[3].endsWith("NoPadding"),
            inputType = args[4],
            outputType = args[5],
            tag = Utils.convertToByteString(args[6].string, args[6].option),
            aad = args[7] ? Utils.convertToByteString(args[7].string, args[7].option) : "",
            ivFromInput = args[8],
            tagLength = args[9] != null ? args[9] : 16;


        if ([16, 24, 32].indexOf(key.length) < 0) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
        }

        input = Utils.convertToByteString(input, inputType);

        if (ivFromInput !== "Off") {
            if (input.length <= ivLength) {
                throw new OperationError(`Input is too short to contain an IV of ${ivLength} bytes.`);
            }

            if (ivFromInput === "From start") {
                iv = input.substr(0, ivLength);
                input = input.substr(ivLength);
            } else {
                iv = input.substr(input.length - ivLength);
                input = input.substr(0, input.length - ivLength);
            }
        } else {
            iv = Utils.convertToByteString(args[1].string, args[1].option);
        }

        // --- CCM ---
        if (mode === "CCM") {
            if (iv.length < 7 || iv.length > 13) {
                throw new OperationError(`Invalid CCM nonce length: ${iv.length} bytes.\n\nCCM requires a nonce of 7\u201313 bytes.`);
            }
            try {
                const plaintext = ccmDecrypt(key, iv, input, aad, tag, tagLength);
                return outputType === "Hex" ? toHexFast(Utils.strToByteArray(plaintext)) : plaintext;
            } catch (e) {
                throw new OperationError("Unable to decrypt input with these parameters: " + e.message);
            }
        }

        // --- EAX ---
        if (mode === "EAX") {
            try {
                const plaintext = eaxDecrypt(key, iv, input, aad, tag);
                return outputType === "Hex" ? toHexFast(Utils.strToByteArray(plaintext)) : plaintext;
            } catch (e) {
                throw new OperationError("Unable to decrypt input with these parameters: " + e.message);
            }
        }

        // --- Existing modes (CBC, CFB, OFB, CTR, GCM, ECB) ---
        const decipher = forge.cipher.createDecipher("AES-" + mode, key);

        /* Allow for a "no padding" mode */
        if (noPadding) {
            decipher.mode.unpad = function (output, options) {
                return true;
            };
        }

        decipher.start({
            iv: iv.length === 0 ? "" : iv,
            tag: mode === "GCM" ? tag : undefined,
            tagLength: mode === "GCM" ? tagLength * 8 : undefined,
            additionalData: mode === "GCM" ? aad : undefined
        });
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
        } else {
            throw new OperationError("Unable to decrypt input with these parameters.");
        }
    }

}

export default AESDecrypt;
