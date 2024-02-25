/**
 * @author Flavio Diez [flaviofdiez+cyberchef@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Rail Fence Cipher Decode operation
 */
class RailFenceCipherDecode extends Operation {
    /**
     * RailFenceCipherDecode constructor
     */
    constructor() {
        super();

        this.name = "Rail Fence Cipher Decode";
        this.module = "Ciphers";
        this.description = "Decodes Strings that were created using the Rail fence Cipher provided a key and an offset";
        this.infoURL = "https://wikipedia.org/wiki/Rail_fence_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "number",
                value: 2
            },
            {
                name: "Offset",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [key, offset] = args;

        const cipher = input;

        if (key < 2) {
            throw new OperationError("Key has to be bigger than 2");
        } else if (key > cipher.length) {
            throw new OperationError("Key should be smaller than the cipher's length");
        }

        if (offset < 0) {
            throw new OperationError("Offset has to be a positive integer");
        }

        const cycle = (key - 1) * 2;
        const plaintext = new Array(cipher.length);

        let j = 0;
        let x, y;

        for (y = 0; y < key; y++) {
            for (x = 0; x < cipher.length; x++) {
                if ((y + x + offset) % cycle === 0 || (y - x - offset) % cycle === 0) {
                    plaintext[x] = cipher[j++];
                }
            }
        }

        return plaintext.join("").trim();
    }
}

export default RailFenceCipherDecode;
