/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import * as LS47 from "../lib/LS47.mjs";

/**
 * LS47 Decrypt operation
 */
class LS47Decrypt extends Operation {

    /**
     * LS47Decrypt constructor
     */
    constructor() {
        super();

        this.name = "LS47 Decrypt";
        this.module = "Crypto";
        this.description = "";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Password",
                type: "string",
                value: ""
            },
            {
                name: "Padding",
                type: "number",
                value: 10
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {

        this.paddingSize = parseInt(args[1], 10);

        LS47.initTiles();

        const key = LS47.deriveKey(args[0]);
        return LS47.decryptPad(key, input, this.paddingSize);
    }

}

export default LS47Decrypt;
