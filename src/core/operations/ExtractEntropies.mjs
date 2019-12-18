/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
//import Entropy from "./Entropy.mjs";

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
                type: "argSelector",
                value: [
                    {
                        name: "High",
                        off: [2, 3]
                    },
                    {
                        name: "Low",
                        off: [2, 3]
                    },
                    {
                        name: "Low and High",
                        off: [2, 3]
                    },
                    {
                        name: "Ascii Range",
                        off: [2, 3]
                    },
                    {
                        name: "Enter Value Range",
                        on: [2, 3]
                    }
                ]
            },
            {
                name: "Block Size",
                type: "number",
                value: "8"
            },
            {
                name: "Lower Entropy Bound",
                type: "number",
                value: 0
            },
            {
                name: "Upper Entropy Bound",
                type: "number",
                value: 0
            }
        ];
    }

        /**
     * Calculates the frequency of bytes in the input.
     *
     * @param {Uint8Array} input
     * @returns {number}
     */
    calculateShannonEntropy(input) {
        const prob = [],
            occurrences = new Array(256).fill(0);

        // Count occurrences of each byte in the input
        let i;
        for (i = 0; i < input.length; i++) {
            occurrences[input[i]]++;
        }

        // Store probability list
        for (i = 0; i < occurrences.length; i++) {
            if (occurrences[i] > 0) {
                prob.push(occurrences[i] / input.length);
            }
        }

        // Calculate Shannon entropy
        let entropy = 0,
            p;

        for (i = 0; i < prob.length; i++) {
            p = prob[i];
            entropy += p * Math.log(p) / Math.log(2);
        }

        return -entropy;
    }

    /**
     * Calculates the scanning entropy of the input
     *
     * @param {Uint8Array} inputBytes
     * @returns {Object}
     */
    calculateScanningEntropy(inputBytes, binWidth) {
        const entropyData = [];
        // const binWidth = inputBytes.length < 256 ? 8 : 256;

        for (let bytePos = 0; bytePos < inputBytes.length; bytePos += binWidth) {
            const block = inputBytes.slice(bytePos, bytePos+binWidth);
            entropyData.push(this.calculateShannonEntropy(block));
        }

        return { entropyData, binWidth };
    }

    generateAverage(entropies) {
        return entropies.reduce((previous, current) => current += previous) / entropies.length;
    }

    getAboveMean(entropies, meanEntropy) {
        const result = [];
        entropies.forEach((element) =>{
            if (element > meanEntropy)
                result.push(element - meanEntropy);
        });
        return this.generateAverage(result);
    }
    
    getBelowMean(entropies, meanEntropy) {
        const result = [];
        entropies.forEach((element) =>{
            if (element < meanEntropy)
                result.push(meanEntropy - element);
        });
        return this.generateAverage(result);
    }

    getAllAbove(entropies, highEntropy) {
        const result = [];
        entropies.forEach((element, index) => {
            if(element > highEntropy)
                result.push([element, index]);
        });
        return result;
    }

    getAllBelow(entropies, lowEntropy) {
        const result = [];
        entropies.forEach((element, index) => {
            if(element < lowEntropy)
                result.push([element, index]);
        });
        return result;
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        args[1] = parseInt(args[1]);
        if (args[2] < 0)
            throw new OperationError("Cannot have a lower bound entropy lower than 0");
        if (args[3] > 8)
            throw new OperationError("Cannot have an upper bound entropy greater than 8");
        if (args[1] >= input.byteLength)
            throw new OperationError("Block size is larger than the input");
        
        let highMean = 0;
        let lowMean = 0;
        let highResults = [];
        let lowResults = [];
        switch (args[0]) {
            case "Ascii Range":
                break;
            case "Enter Value Range":
                if (args[2] === args[3])
                    throw new OperationError("Should not have the upper bound entropy and the lower bound entropy equal to one another");
                break;
            default:
                const entropies = this.calculateScanningEntropy(new Uint8Array(input), args[1]);
                const meanEntropy = this.generateAverage(entropies.entropyData);
                switch (args[0]) {
                    case "High":
                        highMean = this.getAboveMean(entropies.entropyData, meanEntropy);
                        highResults = this.getAllAbove(entropies.entropyData, meanEntropy+highMean);
                        break;
                    case "Low":
                        lowMean = this.getBelowMean(entropies.entropyData, meanEntropy);
                        lowResults = this.getAllBelow(entropies.entropyData, meanEntropy-lowMean);
                        console.log(lowResults);
                        console.log("All entropies: ", entropies);
                        break;
                    case "Low and High":
                        highMean = this.getAboveMean(entropies.entropyData, meanEntropy);
                        highResults = this.getAllAbove(entropies.entropyData, meanEntropy+highMean);
                        lowMean = this.getBelowMean(entropies.entropyData, meanEntropy);
                        lowResults = this.getAllBelow(entropies.entropyData, meanEntropy-lowMean);
                        break;                        
                }
        }
        return " ";
    }

}

export default ExtractEntropies;
