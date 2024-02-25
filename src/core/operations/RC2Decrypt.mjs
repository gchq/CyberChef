/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";

/**
 * RC2 Decrypt operation
 */
class RC2Decrypt extends Operation {
    /**
     * RC2Decrypt constructor
     */
    constructor() {
        super();

        this.name = "RC2 Decrypt";
        this.module = "Ciphers";
        this.description
            = "RC2 (also known as ARC2) is a symmetric-key block cipher designed by Ron Rivest in 1987. 'RC' stands for 'Rivest Cipher'.<br><br><b>Key:</b> RC2 uses a variable size key.<br><br><b>IV:</b> To run the cipher in CBC mode, the Initialization Vector should be 8 bytes long. If the IV is left blank, the cipher will run in ECB mode.<br><br><b>Padding:</b> In both CBC and ECB mode, PKCS#7 padding will be used.";
        this.infoURL = "https://wikipedia.org/wiki/RC2";
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
                "name": "Input",
                "type": "option",
                "value": ["Hex", "Raw"]
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            [, , inputType, outputType] = args,
            decipher = forge.rc2.createDecryptionCipher(key);

        input = Utils.convertToByteString(input, inputType);

        decipher.start(iv || null);
        decipher.update(forge.util.createBuffer(input));
        decipher.finish();

        return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
    }
}

export default RC2Decrypt;
