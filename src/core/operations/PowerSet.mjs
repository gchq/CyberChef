/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils";
import Operation from "../Operation";

/**
 * Power Set operation
 */
class PowerSet extends Operation {

    /**
     * Power set constructor
     */
    constructor() {
        super();

        this.name = "Power Set";
        this.module = "Default";
        this.description = "Generate the power set of a set";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Item delimiter",
                type: "binaryString",
                value: ","
            },
        ];
    }

    /**
     * Generate the power set
     * @param input
     * @param args
     */
    run(input, args) {
        [this.itemDelimiter] = args;
        // Split and filter empty strings
        const inputArray = input.split(this.itemDelimiter).filter(a => a);

        if (inputArray.length) {
            return Utils.escapeHtml(this.runPowerSet(inputArray));
        }

        return "";
    }

    /**
     * Return the power set of the inputted set.
     *
     * @param {Object[]} a
     * @returns {Object[]}
     */
    runPowerSet(a) {
        // empty array items getting picked up
        a = a.filter(i => i.length);
        if (!a.length) {
            return [];
        }

        /**
         * Decimal to binary function
         * @param {*} dec
         */
        const toBinary = (dec) => (dec >>> 0).toString(2);
        const result = new Set();
        // Get the decimal number to make a binary as long as the input
        const maxBinaryValue = parseInt(Number(a.map(i => "1").reduce((p, c) => p + c)), 2);
        // Make an array of each binary number from 0 to maximum
        const binaries = [...Array(maxBinaryValue + 1).keys()]
            .map(toBinary)
            .map(i => i.padStart(toBinary(maxBinaryValue).length, "0"));

        // XOR the input with each binary to get each unique permutation
        binaries.forEach((binary) => {
            const split = binary.split("");
            result.add(a.filter((item, index) => split[index] === "1"));
        });

        // map for formatting & put in length order.
        return [...result]
            .map(r => r.join(this.itemDelimiter)).sort((a, b) => a.length - b.length)
            .map(i => `${i}\n`).join("");
    }
}

export default PowerSet;
