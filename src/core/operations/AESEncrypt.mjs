/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import OperationError from "../errors/OperationError.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import { eaxEncrypt } from "../lib/EAX.mjs";
import { ccmEncrypt } from "../lib/CCM.mjs";

/**
 * AES Encrypt operation
 */
class AESEncrypt extends Operation {

    /**
     * AESEncrypt constructor
     */
    constructor() {
        super();

        this.name = "AES Encrypt";
        this.module = "Ciphers";
        this.description = "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.<br><br><b>Authenticated modes (GCM, CCM, EAX):</b> These modes provide both confidentiality and authentication. The output includes a Tag which must be provided during decryption. AAD (Additional Authenticated Data) is optional data that is authenticated but not encrypted.<br><br><b>CCM nonce:</b> Must be 7–13 bytes.<br><br><b>EAX nonce:</b> Can be any length (16 bytes typical).";
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
                "name": "Mode",
                "type": "argSelector",
                "value": [
                    {
                        name: "CBC",
                        off: [5, 7]
                    },
                    {
                        name: "CFB",
                        off: [5, 7]
                    },
                    {
                        name: "OFB",
                        off: [5, 7]
                    },
                    {
                        name: "CTR",
                        off: [5, 7]
                    },
                    {
                        name: "GCM",
                        on: [5, 7]
                    },
                    {
                        name: "CCM",
                        on: [5, 7]
                    },
                    {
                        name: "EAX",
                        on: [5],
                        off: [7]
                    },
                    {
                        name: "ECB",
                        off: [5, 7]
                    },
                    {
                        name: "CBC/NoPadding",
                        off: [5, 7]
                    },
                    {
                        name: "ECB/NoPadding",
                        off: [5, 7]
                    }
                ]
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
            },
            {
                "name": "Additional Authenticated Data",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "Include IV in output",
                "type": "option",
                "value": ["Off", "Prepend", "Append"]
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
     * @throws {OperationError} if invalid key length
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            mode = args[2].split("/")[0],
            noPadding = args[2].endsWith("NoPadding"),
            inputType = args[3],
            outputType = args[4],
            aad = args[5] ? Utils.convertToByteString(args[5].string, args[5].option) : "",
            includeIV = args[6],
            tagLength = args[7] != null ? args[7] : 16;

        if ([16, 24, 32].indexOf(key.length) < 0) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
        }

        input = Utils.convertToByteString(input, inputType);

        // Handle NoPadding modes
        if (noPadding && input.length % 16 !== 0) {
            throw new OperationError("Input length must be a multiple of 16 bytes for NoPadding modes.");
        }

        // --- CCM ---
        if (mode === "CCM") {
            if (iv.length < 7 || iv.length > 13) {
                throw new OperationError(`Invalid CCM nonce length: ${iv.length} bytes.\n\nCCM requires a nonce of 7–13 bytes.`);
            }
            const ccmResult = ccmEncrypt(key, iv, input, aad, tagLength);
            let output = ccmResult.ciphertext;
            if (includeIV === "Prepend") output = iv + output;
            else if (includeIV === "Append") output = output + iv;

            if (outputType === "Hex") {
                return toHexFast(Utils.strToByteArray(output)) + "\n\nTag: " +
                    toHexFast(Utils.strToByteArray(ccmResult.tag));
            }
            return output + "\n\nTag: " + ccmResult.tag;
        }

        // --- EAX ---
        if (mode === "EAX") {
            const eaxResult = eaxEncrypt(key, iv, input, aad);
            let output = eaxResult.ciphertext;
            if (includeIV === "Prepend") output = iv + output;
            else if (includeIV === "Append") output = output + iv;

            if (outputType === "Hex") {
                return toHexFast(Utils.strToByteArray(output)) + "\n\nTag: " +
                    toHexFast(Utils.strToByteArray(eaxResult.tag));
            }
            return output + "\n\nTag: " + eaxResult.tag;
        }

        // --- Existing modes (CBC, CFB, OFB, CTR, GCM, ECB) ---
        const cipher = forge.cipher.createCipher("AES-" + mode, key);
        cipher.start({
            iv: iv,
            additionalData: mode === "GCM" ? aad : undefined,
            tagLength: mode === "GCM" ? tagLength * 8 : undefined
        });
        if (noPadding) {
            cipher.mode.pad = function (output, options) {
                return true;
            };
        }
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        let output = cipher.output.getBytes();

        if (includeIV === "Prepend") {
            output = iv + output;
        } else if (includeIV === "Append") {
            output = output + iv;
        }

        if (outputType === "Hex") {
            output = toHexFast(Utils.strToByteArray(output));

            if (mode === "GCM") {
                return output + "\n\n" +
                    "Tag: " + cipher.mode.tag.toHex();
            }
        } else if (mode === "GCM") {
            return output + "\n\n" +
                "Tag: " + cipher.mode.tag.getBytes();
        }

        return output;
    }

}

export default AESEncrypt;
