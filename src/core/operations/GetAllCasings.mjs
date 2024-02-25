/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Permutate String operation
 */
class GetAllCasings extends Operation {
    /**
     * GetAllCasings constructor
     */
    constructor() {
        super();

        this.name = "Get All Casings";
        this.module = "Default";
        this.description =
            "Outputs all possible casing variations of a string.";
        this.infoURL = "";
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
        const length = input.length;
        const max = 1 << length;
        input = input.toLowerCase();
        let result = "";

        for (let i = 0; i < max; i++) {
            const temp = input.split("");
            for (let j = 0; j < length; j++) {
                if (((i >> j) & 1) === 1) {
                    temp[j] = temp[j].toUpperCase();
                }
            }
            result += temp.join("") + "\n";
        }
        return result.slice(0, -1);
    }
}

export default GetAllCasings;
