/**
 * @author Flavio Diez [flaviofdiez+cyberchef@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Rail Fence Cypher Decode operation
 */
class RailFenceCypherDecode extends Operation {

    /**
     * RailFenceCypherDecode constructor
     */
    constructor() {
        super();

        this.name = "Rail Fence Cypher Decode";
        this.module = "Ciphers";
        this.description = "Decodes Strings that were created using the Rail fence Cypher provided a key and an offset";
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

        let cipher = input;

        const rest = cipher.length % key;

        if (rest !== 0) {
            cipher = cipher + (" ".repeat(rest));
        }

        const blockLen = cipher.length / key;

        let plaintext = "";

        for (let i = 0; i < blockLen; i++) {
            for (let j = 0; j < key; j++) {
                plaintext += cipher[i + (j * blockLen)];
            }
        }

        return plaintext;
    }

    /**
     * Highlight Rail Fence Cypher Decode
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
     * Highlight Rail Fence Cypher Decode in reverse
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


export default RailFenceCypherDecode;
