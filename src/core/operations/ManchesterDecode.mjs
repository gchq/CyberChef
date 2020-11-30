/**
 * @author mt3571 [mt3571@protonmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

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

        if (input.length % 2 != 0){
            throw new OperationError(`Length of an input should be a multiple of 2, the input is ${input.length} long.`);
        }

        for (let i = 0; i < input.length; i +=2){
            const bit1 = input[i];
            const bit2 = input[i+1];

            if (bit1 == 1 && bit2 == 0){
                result.push(0);
            } else if (bit1 == 0 && bit2 == 1){
                result.push(1);
            } else {
                throw new OperationError(`Invalid input.`);
            }

        }

        return result;
    }

}

export default ManchesterDecode;
