/**
 * @author aosterhage [aaron.osterhage@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import { aesKeyWrap } from "../lib/AESKeyWrap.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * AES Key Wrap With Padding operation
 */
class AESKeyWrapWithPadding extends Operation {

    /**
     * AESKeyWrapWithPadding constructor
     */
    constructor() {
        super();

        this.name = "AES Key Wrap With Padding";
        this.module = "Ciphers";
        this.description = "A key wrapping algorithm defined in RFC 3394 combined with a padding convention defined in RFC 5649.<br><br>The padding convention defined in RFC 5649 eliminates the requirement that the length of the key to be wrapped be a multiple of 64 bits, allowing a key of any practical length to be wrapped.";
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
        if (input.length <= 0) {
            throw new OperationError("input must be > 0 bytes");
        }

        // Construct the "Alternative Initial Value" (AIV).
        const aiv = "\xa6\x59\x59\xa6" + Utils.byteArrayToChars(Utils.intToByteArray(input.length, 4, "big"));;

        // Pad the input as needed.
        const isMultipleOf8 = (input.length % 8) === 0;
        const paddedLength = input.length + (isMultipleOf8 ? 0 : (8 - (input.length % 8)));
        input = input.padEnd(paddedLength, "\0");

        let output;

        if (paddedLength === 8) {
            // Special case where the padded input is one 64-bit block.

            // Get the cipher ready and disable PKCS#7 padding.
            const cipher = forge.cipher.createCipher("AES-ECB", kek);
            cipher.mode.pad = false;

            cipher.start();
            cipher.update(forge.util.createBuffer(aiv + input));
            cipher.finish();
            output = cipher.output.getBytes();
        } else {
            // Otherwise, follow the wrapping process from RFC 3394 (AESKeyWrap operation).
            output = aesKeyWrap(input, kek, aiv);
        }

        return outputType === "Hex" ? toHexFast(Utils.strToArrayBuffer(output)) : output;
    }

}

export default AESKeyWrapWithPadding;
