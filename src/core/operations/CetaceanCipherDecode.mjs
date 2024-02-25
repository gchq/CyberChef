/**
 * @author dolphinOnKeys [robin@weird.io]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Cetacean Cipher Decode operation
 */
class CetaceanCipherDecode extends Operation {
    /**
     * CetaceanCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Cetacean Cipher Decode";
        this.module = "Ciphers";
        this.description
            = "Decode Cetacean Cipher input. <br/><br/>e.g. <code>EEEEEEEEEeeEeEEEEEEEEEEEEeeEeEEe</code> becomes <code>hi</code>";
        this.infoURL = "https://hitchhikers.fandom.com/wiki/Dolphins";
        this.inputType = "string";
        this.outputType = "string";

        this.checks = [
            {
                pattern: "^(?:[eE]{16,})(?: [eE]{16,})*$",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const binaryArray = [];
        for (const char of input) {
            if (char === " ") {
                binaryArray.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]);
            } else {
                binaryArray.push(char === "e" ? 1 : 0);
            }
        }

        const byteArray = [];

        for (let i = 0; i < binaryArray.length; i += 16) {
            byteArray.push(binaryArray.slice(i, i + 16).join(""));
        }

        return byteArray.map((byte) => String.fromCharCode(parseInt(byte, 2))).join("");
    }
}

export default CetaceanCipherDecode;
