/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { fromYEnc } from "../lib/YEnc.mjs";

/**
 * From yEnc operation
 */
class FromYEnc extends Operation {

    /**
     * FromYEnc constructor
     */
    constructor() {
        super();

        this.name = "From yEnc";
        this.module = "Default";
        this.description = "Decodes yEnc data blocks back to their original bytes.";
        this.infoURL = "http://www.yenc.org/yEnc1-formal1.txt";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
        this.checks = [
            {
                pattern: "(?:^|\\r?\\n)=ybegin\\s+.*\\bline=\\d+\\b.*\\bsize=\\d+\\b.*\\bname=.+\\r?\\n[\\s\\S]*\\r?\\n=yend\\s+.*\\bsize=\\d+\\b",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return fromYEnc(input);
    }

}

export default FromYEnc;
