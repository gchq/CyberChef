/**
 * @author mt3571 [mt3571@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Manchester encoding operation
 */
class ManchesterEncode extends Operation {

    /**
     * ManchesterEncode constructor
     */
    constructor() {
        super();

        this.name = "Manchester Encode";
        this.module = "Encodings";
        this.description = "Performs the Manchester encoding on the data (also known as phase encoding). A <code>1</code> is converted to <code>01</code> and a <code>0</code> is converted to <code>10</code>. ";
        this.infoURL = "https://en.wikipedia.org/wiki/Manchester_code";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const encoding = [];

        for (let i = 0; i < input.length; i ++){
            const bit = input[i];

            if (bit == 0){
                encoding.push(1);
                encoding.push(0);
            } else if (bit == 1){
                encoding.push(0);
                encoding.push(1);
            } else {
                throw new OperationError(`Invalid input character ${bit}. Input should be in binary.`);
            }

        }
        const output = encoding.join("");
        return output;
    }

}

export default ManchesterEncode;
