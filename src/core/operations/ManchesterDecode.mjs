/**
 * @author mt3571 [mt3571@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Manchester decoding operation
 */
class ManchesterDecode extends Operation {

    /**
     * ManchesterDecode constructor
     */
    constructor() {
        super();

        this.name = "Manchester Decode";
        this.module = "Encodings";
        this.description = "Decodes data that has been encoded using the Manchester Encoding (also known as phase encoding). A <code>01</code> is converted to <code>1</code> and a <code>10</code> is converted to <code>0</code>. <br><br>As every bit is encoded into two bits when using this encoding, inputs must be a multiple of 2 long.";
        this.infoURL = "https://en.wikipedia.org/wiki/Manchester_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                pattern: "(01|10)*",
                flags: "",
                args: []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const decoding = [];

        if (input.length % 2 != 0){
            throw new OperationError(`Length of an input should be a multiple of 2, the input is ${input.length} long.`);
        }

        for (let i = 0; i < input.length; i +=2){
            const bit1 = input[i];
            const bit2 = input[i+1];

            if (bit1 == 1 && bit2 == 0){
                decoding.push(0);
            } else if (bit1 == 0 && bit2 == 1){
                decoding.push(1);
            } else {
                throw new OperationError(`Invalid input.`);
            }

        }
        const output = decoding.join("");
        return output;
    }

}

export default ManchesterDecode;
