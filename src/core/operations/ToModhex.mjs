/**
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { TO_MODHEX_DELIM_OPTIONS, toModhex } from "../lib/Modhex.mjs";
import Utils from "../Utils.mjs";

/**
 * To Modhex operation
 */
class ToModhex extends Operation {

    /**
     * ToModhex constructor
     */
    constructor() {
        super();

        this.name = "To Modhex";
        this.module = "Default";
        this.description = "Converts the input string to modhex bytes separated by the specified delimiter.";
        this.infoURL = "https://en.wikipedia.org/wiki/YubiKey#ModHex";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: TO_MODHEX_DELIM_OPTIONS
            },
            {
                name: "Bytes per line",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]);
        const lineSize = args[1];

        return toModhex(new Uint8Array(input), delim, 2, "", lineSize);
    }
}

export default ToModhex;
