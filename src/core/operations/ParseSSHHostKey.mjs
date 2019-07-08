/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { fromBase64 } from "../lib/Base64";
import { fromHex, toHexFast } from "../lib/Hex";

/**
 * Parse SSH Host Key operation
 */
class ParseSSHHostKey extends Operation {

    /**
     * ParseSSHHostKey constructor
     */
    constructor() {
        super();

        this.name = "Parse SSH Host Key";
        this.module = "Default";
        this.description = "Parses a SSH host key and extracts fields from it.<br>The key type can be:<ul><li>ssh-rsa</li><li>ssh-dss</li><li>ecdsa-sha2</li></ul>The key format can be either Hex or Base64.";
        this.infoURL = "https://wikipedia.org/wiki/Secure_Shell";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input Format",
                type: "option",
                value: [
                    "Auto",
                    "Base64",
                    "Hex"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat] = args,
            inputKey = this.convertKeyToBinary(input.trim(), inputFormat),
            fields = this.parseKey(inputKey),
            keyType = Utils.byteArrayToChars(fromHex(fields[0]), "");

        let output = `Key type: ${keyType}`;

        if (keyType === "ssh-rsa") {
            output += `\nExponent: 0x${fields[1]}`;
            output += `\nModulus: 0x${fields[2]}`;
        } else if (keyType === "ssh-dss") {
            output += `\np: 0x${fields[1]}`;
            output += `\nq: 0x${fields[2]}`;
            output += `\ng: 0x${fields[3]}`;
            output += `\ny: 0x${fields[4]}`;
        } else if (keyType.startsWith("ecdsa-sha2")) {
            output += `\nCurve: ${Utils.byteArrayToChars(fromHex(fields[0]))}`;
            output += `\nPoint: 0x${fields.slice(2)}`;
        } else {
            output += "\nUnsupported key type.";
            output += `\nParameters: ${fields.slice(1)}`;
        }

        return output;
    }

    /**
     * Converts the key to binary format from either hex or base64
     *
     * @param {string} inputKey
     * @param {string} inputFormat
     * @returns {byteArray}
     */
    convertKeyToBinary(inputKey, inputFormat) {
        const keyPattern = new RegExp(/^(?:[ssh]|[ecdsa-sha2])\S+\s+(\S*)/),
            keyMatch = inputKey.match(keyPattern);

        if (keyMatch) {
            inputKey = keyMatch[1];
        }

        if (inputFormat === "Auto") {
            inputFormat = this.detectKeyFormat(inputKey);
        }
        if (inputFormat === "Hex") {
            return fromHex(inputKey);
        } else if (inputFormat === "Base64") {
            return fromBase64(inputKey, null, "byteArray");
        } else {
            throw new OperationError("Invalid input format.");
        }
    }


    /**
     * Detects if the key is base64 or hex encoded
     *
     * @param {string} inputKey
     * @returns {string}
     */
    detectKeyFormat(inputKey) {
        const hexPattern = new RegExp(/^(?:[\dA-Fa-f]{2}[ ,;:]?)+$/);
        const b64Pattern = new RegExp(/^\s*(?:[A-Za-z\d+/]{4})+(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?\s*$/);

        if (hexPattern.test(inputKey)) {
            return "Hex";
        } else if (b64Pattern.test(inputKey)) {
            return "Base64";
        } else {
            throw new OperationError("Unable to detect input key format.");
        }
    }


    /**
     * Parses fields from the key
     *
     * @param {byteArray} key
     */
    parseKey(key) {
        const fields = [];
        while (key.length > 0) {
            const lengthField = key.slice(0, 4);
            let decodedLength = 0;
            for (let i = 0; i < lengthField.length; i++) {
                decodedLength += lengthField[i];
                decodedLength = decodedLength << 8;
            }
            decodedLength = decodedLength >> 8;
            // Break if length wasn't decoded correctly
            if (decodedLength <= 0) break;

            fields.push(toHexFast(key.slice(4, 4 + decodedLength)));
            key = key.slice(4 + decodedLength);
        }

        return fields;
    }

}

export default ParseSSHHostKey;
