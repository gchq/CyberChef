/**
 * @author Jarmo van Lenthe [github.com/jarmovanlenthe]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {DELIM_OPTIONS} from "../lib/Delim";
import OperationError from "../errors/OperationError";

/**
 * A1Z26 Cipher Decode operation
 */
class A1Z26CipherDecode extends Operation {

    /**
     * A1Z26CipherDecode constructor
     */
    constructor() {
        super();

        this.name = "A1Z26 Cipher Decode";
        this.module = "Ciphers";
        this.description = "Converts alphabet order numbers into their corresponding  alphabet character.<br><br>e.g. <code>1</code> becomes <code>a</code> and <code>2</code> becomes <code>b</code>.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0] || "Space");

        if (input.length === 0) {
            return [];
        }

        const bites = input.split(delim);
        let latin1 = "";
        for (let i = 0; i < bites.length; i++) {
            if (bites[i] < 1 || bites[i] > 26) {
                throw new OperationError("Error: all numbers must be between 1 and 26.");
            }
            latin1 += Utils.chr(parseInt(bites[i], 10) + 96);
        }
        return latin1;
    }

}

export default A1Z26CipherDecode;
