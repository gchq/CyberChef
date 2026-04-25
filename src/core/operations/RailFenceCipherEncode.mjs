/**
 * @author Flavio Diez [flaviofdiez+cyberchef@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Rail Fence Cipher Encode operation
 */
class RailFenceCipherEncode extends Operation {

    /**
     * RailFenceCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Rail Fence Cipher Encode";
        this.module = "Ciphers";
        this.description = "Encodes Strings using the Rail fence Cipher provided a key and an offset";
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

        const plaintext = input;
        if (key < 2) {
            throw new OperationError("Key has to be bigger than 2");
        } else if (key > plaintext.length) {
            throw new OperationError("Key should be smaller than the plain text's length");
        }

        if (offset < 0) {
            throw new OperationError("Offset has to be a positive integer");
        }

        const cycle = (key - 1) * 2;
        const rows = new Array(key).fill("");

        for (let pos = 0; pos < plaintext.length; pos++) {
            const rowIdx = key - 1 - Math.abs(cycle / 2 - (pos + offset) % cycle);

            rows[rowIdx] += plaintext[pos];
        }

        return rows.join("");
    }

}

export default RailFenceCipherEncode;
