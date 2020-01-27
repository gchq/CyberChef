/**
 * @author Flavio Diez [flaviofdiez+cyberchef@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Rail Fence Cypher Encode operation
 */
class RailFenceCypherEncode extends Operation {

    /**
     * RailFenceCypherEncode constructor
     */
    constructor() {
        super();

        this.name = "Rail Fence Cypher Encode";
        this.module = "Ciphers";
        this.description = "Encodes Strings using the Rail fence Cypher provided a key and an offset";
        this.infoURL = "https://en.wikipedia.org/wiki/Rail_fence_cipher";
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
        const [key] = args;
        // const [key, offset] = args;

        const plaintext = input;

        if (key < 2) {
            return "Key has to be bigger than 2";
        } else if (key > plaintext.length) {
            return "Key should be smaller than the plain text's length";
        }

        let cipher = "";

        for (let block = 0; block < key; block++) {
            for (let pos = block; pos < plaintext.length; pos += key) {
                cipher += plaintext[pos];
            }
        }

        return cipher;
    }

    /**
     * Highlight Rail Fence Cypher Encode
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Rail Fence Cypher Encode in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

export default RailFenceCypherEncode;
