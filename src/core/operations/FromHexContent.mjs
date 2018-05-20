/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {fromHex} from "../lib/Hex";

/**
 * From Hex Content operation
 */
class FromHexContent extends Operation {

    /**
     * FromHexContent constructor
     */
    constructor() {
        super();

        this.name = "From Hex Content";
        this.module = "Default";
        this.description = "Translates hexadecimal bytes in text back to raw bytes.<br><br>e.g. <code>foo|3d|bar</code> becomes <code>foo=bar</code>.";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const regex = /\|([a-f\d ]{2,})\|/gi,
            output = [];
        let m, i = 0;
        while ((m = regex.exec(input))) {
            // Add up to match
            for (; i < m.index;)
                output.push(Utils.ord(input[i++]));

            // Add match
            const bytes = fromHex(m[1]);
            if (bytes) {
                for (let a = 0; a < bytes.length;)
                    output.push(bytes[a++]);
            } else {
                // Not valid hex, print as normal
                for (; i < regex.lastIndex;)
                    output.push(Utils.ord(input[i++]));
            }

            i = regex.lastIndex;
        }
        // Add all after final match
        for (; i < input.length;)
            output.push(Utils.ord(input[i++]));

        return output;
    }

}

export default FromHexContent;
