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
        this.description = "Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.<br><br><b>Key:</b> The following algorithms will be used based on the size of the key:<ul><li>16 bytes = AES-128</li><li>24 bytes = AES-192</li><li>32 bytes = AES-256</li></ul><br><br><b>IV:</b> The Initialization Vector should be 16 bytes long. If not entered, it will default to 16 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used as a default.<br><br><b>GCM Tag:</b> This field is ignored unless 'GCM' mode is used.";
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
                "name": "IV Location",
                "type": "option",
                "value": ["Start of input", "End of input"],
            },
            {
                "name": "Mode",
                "type": "argSelector",
                "value": [
                    {
                        name: "CBC",
                        off: [7, 8]
                    },
                    {
                        name: "CFB",
                        off: [7, 8]
                    },
                    {
                        name: "OFB",
                        off: [7, 8]
                    },
                    {
                        name: "CTR",
                        off: [7, 8]
                    },
                    {
                        name: "GCM",
                        on: [7, 8]
                    },
                    {
                        name: "ECB",
                        off: [7, 8]
                    },
                    {
                        name: "CBC/NoPadding",
                        off: [7, 8]
                    },
                    {
                        name: "ECB/NoPadding",
                        off: [7, 8]
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
                "name": "GCM Tag",
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
                        off: [2, 3]
                    },
                    {
                        name: "On",
                        on: [2, 3],
                        off: [1]
                    }
                ]
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
            ivFromStart = args[3] === "Start of input",
            mode = args[4].split("/")[0],
            noPadding = args[4].endsWith("NoPadding"),
            inputType = args[5],
            outputType = args[6],
            gcmTag = Utils.convertToByteString(args[7].string, args[7].option),
            aad = Utils.convertToByteString(args[8].string, args[8].option),
            ivFromInput = args[9] === "On";


        if ([16, 24, 32].indexOf(key.length) < 0) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`);
        }

        input = Utils.convertToByteString(input, inputType);

        if (ivFromInput) {
            if (input.length <= ivLength) {
                throw new OperationError(`Input is too short to contain an IV of ${ivLength} bytes.`);
            }

            if (ivFromStart) {
                iv = input.substr(0, ivLength);
                input = input.substr(ivLength);
            } else {
                iv = input.substr(input.length - ivLength);
                input = input.substr(0, input.length - ivLength);
            }
        } else {
            iv = Utils.convertToByteString(args[1].string, args[1].option);
        }

        const decipher = forge.cipher.createDecipher("AES-" + mode, key);

        /* Allow for a "no padding" mode */
        if (noPadding) {
            decipher.mode.unpad = function(output, options) {
                return true;
            };
        }

        decipher.start({
            iv: iv.length === 0 ? "" : iv,
            tag: mode === "GCM" ? gcmTag : undefined,
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
