/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Entropy from "./Entropy.mjs";

/**
 * Extract Entropies operation
 */
class ExtractEntropies extends Operation {

    /**
     * ExtractEntropies constructor
     */
    constructor() {
        super();

        this.name = "Extract Entropies";
        this.module = "Default";
        this.description = "";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "List<File>";
        this.args = [
            {
                name: "Entropies",
                type: "option",
                value: ["High", "Low", "High and Low", "Value Range"]
            },
            {
                name: "Upper bound Entropy",
                type: "number",
                value: ""
            },
            {
                name: "Lower bound Entropy",
                type: "number",
                value: ""
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        let entropies = new Entropy().calculateScanningEntropy(new Uint8Array(input));
        let currentMin = [8, -1];
        entropies.entropyData.forEach((element, index) => {
            if (element < currentMin[0]) {
                currentMin = [element, index]
            }
        });
        console.log(currentMin);

        return " ";
    }

}

export default ExtractEntropies;
