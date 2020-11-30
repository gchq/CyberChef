/**
 * @author mt3571 [mt3571@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

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
        this.description = "";
        this.infoURL = "";
        this.inputType = "binaryArray";
        this.outputType = "binaryArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const result = [];

        for (let i = 0; i < input.length; i ++){
            const bit = input[i];

            if (bit == 0){
                result.push(1);
                result.push(0);
            } else {
                result.push(0);
                result.push(1);
            }

        }

        return result;
    }

}

export default ManchesterEncode;
