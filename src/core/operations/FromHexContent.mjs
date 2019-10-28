/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {fromHex} from "../lib/Hex.mjs";

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
        this.description = "Translates hexadecimal bytes in text back to raw bytes. This format is used by SNORT for representing hex within ASCII text.<br><br>e.g. <code>foo|3d|bar</code> becomes <code>foo=bar</code>.";
        this.infoURL = "http://manual-snort-org.s3-website-us-east-1.amazonaws.com/node32.html#SECTION00451000000000000000";
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
