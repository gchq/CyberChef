/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Chi Square operation
 */
class ChiSquare extends Operation {

    /**
     * ChiSquare constructor
     */
    constructor() {
        super();

        this.name = "Chi Square";
        this.module = "Default";
        this.description = "Calculates the Chi Square distribution of values.";
        this.inputType = "ArrayBuffer";
        this.outputType = "number";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {number}
     */
    run(input, args) {
        const data = new Uint8Array(input);
        const distArray = new Array(256).fill(0);
        let total = 0;

        for (let i = 0; i < data.length; i++) {
            distArray[data[i]]++;
        }

        for (let i = 0; i < distArray.length; i++) {
            if (distArray[i] > 0) {
                total += Math.pow(distArray[i] - data.length / 256, 2) / (data.length / 256);
            }
        }

        return total;
    }

}

export default ChiSquare;
