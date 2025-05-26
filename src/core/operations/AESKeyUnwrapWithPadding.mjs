/**
 * @author aosterhage [aaron.osterhage@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import { aesKeyUnwrap } from "../lib/AESKeyWrap.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * AES Key Unwrap With Padding operation
 */
class AESKeyUnwrapWithPadding extends Operation {

    /**
     * AESKeyUnwrapWithPadding constructor
     */
    constructor() {
        super();

        this.name = "AES Key Unwrap With Padding";
        this.module = "Ciphers";
        this.description = "Decryptor for a key wrapping algorithm defined in RFC 3394 combined with a padding convention defined in RFC 5649.";
        this.infoURL = "https://wikipedia.org/wiki/Key_wrap";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Key (KEK)",
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
                "value": ["Hex", "Raw"]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const kek = Utils.convertToByteString(args[0].string, args[0].option),
            inputType = args[1],
            outputType = args[2];

        if (kek.length !== 16 && kek.length !== 24 && kek.length !== 32) {
            throw new OperationError("KEK must be either 16, 24, or 32 bytes (currently " + kek.length + " bytes)");
        }

        input = Utils.convertToByteString(input, inputType);
        if (input.length % 8 !== 0 || input.length < 16) {
            throw new OperationError("input must be 8n (n>=2) bytes (currently " + input.length + " bytes)");
        }

        const decipher = forge.cipher.createDecipher("AES-ECB", kek);
        let output, aiv;

        if (input.length === 16) {
            // Special case where the unwrapped data is one 64-bit block.
            decipher.start();
            decipher.update(forge.util.createBuffer(input));
            decipher.finish();
            output = decipher.output.getBytes();
            aiv = output.substring(0, 8);
            output = output.substring(8, 16);
        } else {
            // Otherwise, follow the unwrapping process from RFC 3394 (AESKeyUnwrap operation).
            [output, aiv] = aesKeyUnwrap(input, kek);
        }

        // Get the unpadded length from the AIV (which is the MLI). Remove the padding from the output.
        const unpaddedLength = Utils.byteArrayToInt(Utils.strToByteArray(aiv.substring(4, 8)), "big");
        if (aiv.substring(0, 4) !== "\xa6\x59\x59\xa6" || unpaddedLength > output.length) {
            throw new OperationError("invalid AIV found");
        }
        output = output.substring(0, unpaddedLength);

        return outputType === "Hex" ? toHexFast(Utils.strToArrayBuffer(output)) : output;
    }

}

export default AESKeyUnwrapWithPadding;
