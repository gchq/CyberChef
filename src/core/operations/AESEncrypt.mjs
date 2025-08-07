/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import OperationError from "../errors/OperationError.mjs";

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
        this.description = "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul>You can generate a password-based key using one of the KDF operations.<br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used.";
        this.infoURL = "https://wikipedia.org/wiki/Advanced_Encryption_Standard";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
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
                        off: [5]
                    },
                    {
                        name: "CFB",
                        off: [5]
                    },
                    {
                        name: "OFB",
                        off: [5]
                    },
                    {
                        name: "CTR",
                        off: [5]
                    },
                    {
                        name: "GCM",
                        on: [5]
                    },
                    {
                        name: "ECB",
                        off: [5]
                    },
                    {
                        name: "CBC/NoPadding",
                        off: [5]
                    },
                    {
                        name: "ECB/NoPadding",
                        off: [5]
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
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     *
     * @throws {OperationError} if invalid key length
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            mode = args[2].split("/")[0],
            noPadding =  args[2].endsWith("NoPadding"),
            inputType = args[3],
            outputType = args[4],
            aad = Utils.convertToByteString(args[5].string, args[5].option);

        if ([16, 24, 32].indexOf(key.length) < 0) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
        }

        input = input.map((c) => String.fromCharCode(c)).join("");
        input = Utils.convertToByteString(input, inputType);

        // Handle NoPadding modes
        if (noPadding && input.length % 16 !== 0) {
            throw new OperationError("Input length must be a multiple of 16 bytes for NoPadding modes.");
        }
        const cipher = forge.cipher.createCipher("AES-" + mode, key);
        cipher.start({
            iv: iv,
            additionalData: mode === "GCM" ? aad : undefined
        });
        if (noPadding) {
            cipher.mode.pad = function(output, options) {
                return true;
            };
        }
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        let output;
        if (outputType === "Hex") {
            if (mode === "GCM") {
                output = cipher.output.toHex() + "\n\n" +
                    "Tag: " + cipher.mode.tag.toHex();
            } else {
                output = cipher.output.toHex();
            }
        } else {
            if (mode === "GCM") {
                output = cipher.output.getBytes() + "\n\n" +
                    "Tag: " + cipher.mode.tag.getBytes();
            } else {
                output = cipher.output.getBytes();
            }
        }
        return Array.from(output).map((c) => c.charCodeAt(0));
    }

}

export default AESEncrypt;
