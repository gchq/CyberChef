/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

/**
 * DES Decrypt operation
 */
class DESDecrypt extends Operation {
    /**
     * DESDecrypt constructor
     */
    constructor() {
        super();

        this.name = "DES Decrypt";
        this.module = "Ciphers";
        this.description =
            "DES is a previously dominant algorithm for encryption, and was published as an official U.S. Federal Information Processing Standard (FIPS). It is now considered to be insecure due to its small key size.<br><br><b>Key:</b> DES uses a key length of 8 bytes (64 bits).<br>Triple DES uses a key length of 24 bytes (192 bits).<br><br><b>IV:</b> The Initialization Vector should be 8 bytes long. If not entered, it will default to 8 null bytes.<br><br><b>Padding:</b> In CBC and ECB mode, PKCS#7 padding will be used as a default.";
        this.infoURL = "https://wikipedia.org/wiki/Data_Encryption_Standard";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "IV",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "Mode",
                type: "option",
                value: [
                    "CBC",
                    "CFB",
                    "OFB",
                    "CTR",
                    "ECB",
                    "CBC/NoPadding",
                    "ECB/NoPadding",
                ],
            },
            {
                name: "Input",
                type: "option",
                value: ["Hex", "Raw"],
            },
            {
                name: "Output",
                type: "option",
                value: ["Raw", "Hex"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2].substring(0, 3),
            noPadding = args[2].endsWith("NoPadding"),
            [, , , inputType, outputType] = args;

        if (key.length !== 8) {
            throw new OperationError(`Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`);
        }
        if (iv.length !== 8 && mode !== "ECB") {
            throw new OperationError(`Invalid IV length: ${iv.length} bytes

DES uses an IV length of 8 bytes (64 bits).
Make sure you have specified the type correctly (e.g. Hex vs UTF8).`);
        }

        input = Utils.convertToByteString(input, inputType);

        const decipher = forge.cipher.createDecipher("DES-" + mode, key);

        /* Allow for a "no padding" mode */
        if (noPadding) {
            decipher.mode.unpad = function (output, options) {
                return true;
            };
        }

        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex"
                ? decipher.output.toHex()
                : decipher.output.getBytes();
        } else {
            throw new OperationError(
                "Unable to decrypt input with these parameters.",
            );
        }
    }
}

export default DESDecrypt;
