/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

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
        this.outputType = "JSON";
        this.presentType = "html";
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
                        name: "English Text",
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
                type: "string",
                value: "10"
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
            },
            {
                name: "Algorithm To Use",
                type: "option",
                value: ["Absolute Mean Deviation", "Standard Deviation"]
            },
            {
                name: "Flip Output",
                type: "boolean",
                value: false
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
     * Calculates the scanning entropy of the input.
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

    /**
     * Calculates the average of a list of entropies.
     *
     * @param {Array} entropies
     * @returns {number}
     */
    generateAverage(entropies) {
        return entropies.reduce((previous, current) => current += previous) / entropies.length;
    }

    /**
     * Caculates the mean of the data above the original mean.
     *
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    getAboveMean(entropies, meanEntropy) {
        let total = 0, count = 0;
        entropies.forEach((element) => {
            if (element > meanEntropy) {
                total += (element - meanEntropy);
                count++;
            }
        });
        return total/count;
    }

    /**
     * Caculates the mean of the data below the original mean.
     *
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    getBelowMean(entropies, meanEntropy) {
        let total = 0, count = 0;
        entropies.forEach((element) => {
            if (element < meanEntropy) {
                total += (meanEntropy - element);
                count++;
            }
        });
        return total/count;
    }

    /**
     * Retrieves all the blocks with entropy higher than the high mean.
     *
     * @param {Array} entropies
     * @param {number} highEntropy
     * @returns {Array}
     */
    getAllAbove(entropies, highEntropy) {
        const result = [];
        entropies.forEach((element, index) => {
            if (element > highEntropy)
                result.push([element, index]);
        });
        return result;
    }

    /**
     * Retrieves all the blocks with entropy lower than the low mean.
     *
     * @param {Array} entropies
     * @param {number} highEntropy
     * @returns {Array}
     */
    getAllBelow(entropies, lowEntropy) {
        const result = [];
        entropies.forEach((element, index) => {
            if (element < lowEntropy)
                result.push([element, index]);
        });
        return result;
    }

    /**
     * Calculates the standard deviation of all of the entropies.
     *
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    calculateStandardDeviation(entropies, meanEntropy) {
        let total = 0;
        entropies.forEach((element) => {
            total += Math.pow((element-meanEntropy), 2);
        });
        return Math.sqrt(total/(entropies.length-1));
    }

    /**
     * Calculates the standard deviation of all of the entropies below the standard deviation of the whole data.
     *
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    getBelowStandardDeviation(entropies, meanEntropy) {
        const result = [];
        entropies.forEach((element) => {
            if (element < meanEntropy) {
                result.push(element);
            }
        });
        return this.calculateStandardDeviation(result, meanEntropy);
    }

    /**
     * Calculates the standard deviation of all of the entropies above the standard deviation of the whole data.
     *
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    getAboveStandardDeviation(entropies, meanEntropy) {
        const result = [];
        entropies.forEach((element) => {
            if (element > meanEntropy) {
                result.push(element);
            }
        });
        return this.calculateStandardDeviation(result, meanEntropy);
    }

    /**
     * Determines which algorithm to use for calculating the deviation.
     *
     * @param {string} algorithm
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    algorithmTypeLow(algorithm, entropies, meanEntropy) {
        switch (algorithm) {
            case "Absolute Mean Deviation":
                return this.getBelowMean(entropies.entropyData, meanEntropy);
            case "Standard Deviation":
                return this.getBelowStandardDeviation(entropies.entropyData, meanEntropy);
        }
    }

    /**
     * Determines which algorithm to use for calculating the deviation.
     *
     * @param {string} algorithm
     * @param {Array} entropies
     * @param {number} meanEntropy
     * @returns {number}
     */
    algorithmTypeHigh(algorithm, entropies, meanEntropy) {
        switch (algorithm) {
            case "Absolute Mean Deviation":
                return this.getAboveMean(entropies.entropyData, meanEntropy);
            case "Standard Deviation":
                return this.getAboveStandardDeviation(entropies.entropyData, meanEntropy);
        }
    }

    /**
     * Retrieves all of the blocks with entropy between the lower bound and upper bound.
     *
     * @param {Array} entropies
     * @param {number} lbound
     * @param {number} ubound
     * @param {ArrayBuffer} input
     * @param {boolean} flipGroupings
     * @param {number} binWidth
     * @returns {string}
     */
    getRange(entropies, lbound, ubound, input, flipGroupings, binWidth) {
        const result = [];
        entropies.forEach((element, index) => {
            if (element > lbound && element < ubound)
                result.push([element, index]);
        });
        return this.generateOutput(result, input, flipGroupings, binWidth);
    }

    /**
     * Determines the data ranges for blocks with similar entropies.
     *
     * @param {Array} data
     * @returns {Array}
     */
    groupings(data) {
        const result = [data[0][1]];
        for (let i = 0; i < data.length - 1; i++) {
            if (Math.abs(data[i][1] - data[i+1][1]) > 3) // I think this needs to be scaled on the bock size rather than a hardcoded value.
                result.push(data[i][1], data[i+1][1]);
        }
        result.push(data[data.length-1][1]);
        return result;
    }

    /**
     * Flips the groups to cover the remaining data.
     *
     * @param {Array} data
     * @param {Number} length
     * @param {Number} binWidth
     * @returns {Array}
     */
    flipGroupings(data, length, binWidth) {
        const result = [];
        if (data[0]) {
            result.push(0, data[0] - 1);
        }
        for (let i = 1; i < data.length-1; i+=2) {
            result.push(data[i]+1, data[i+1]);
        }
        const dataLen = data.length - 1;
        if (data[dataLen] !== length)
            result.push(data[dataLen]+1, (length/binWidth)-1);
        return result;
    }

    /**
     * Frames the data into a html format.
     *
     * @param {Array} ranges
     * @param {ArrayBuffer} input
     * @param {boolean} flipOutput
     * @param {number} binWidth
     * @returns {string}
     */
    generateOutput(ranges, input, flipOutput, binWidth) {
        let output = "";
        if (!(ranges.length))
            return output;
        ranges = this.groupings(ranges);
        if (flipOutput)
            ranges = this.flipGroupings(ranges, input.byteLength, binWidth);

        for (let i = 0; i < ranges.length; i+=2) {
            if (i === 0)
                output +=`
                    <td>${binWidth}</td>
                `;
            else
                output += `
                    <td></td>
                `;
            output += `<td>${(ranges[i]*binWidth).toString(16)}-${(((ranges[i+1]+1)*binWidth)-1).toString(16)}</td>
                <td>${Utils.escapeHtml(Utils.printable(Utils.truncate(Utils.arrayBufferToStr(input.slice(ranges[i]*binWidth, ((ranges[i+1]+1)*binWidth)-1)), 99)))}</td> 
            </tr>`;
        }
        return output;
    }

    /**
     * Puts the remaining data into the table html format.
     *
     * @param {string} data
     * @returns {string}
     */
    generateCompleteOutput(data) {
        if (!(data))
            return "Nothing of interest could be found in the input data.\nHave you tried changing the block size?";

        return `<table
        class='table table-hover table-sm table-bordered'
        style='table-layout: fixed;'>
    <tr>
        <th>Block Size</th>
        <th>Offset</th>
        <th>Result snippet</th>
    </tr>`+ data + "</table><script type='application/javascript'>$('[data-toggle=\"tooltip\"]').tooltip()</script>";
    }

    /**
     * Dispatches on the type of output we want.
     *
     * @param {Array} entropies
     * @param {string} input
     * @param {string} algorithm
     * @param {boolean} flipOutput
     * @param {number} binWidth
     * @param {ArrayBuffer} data
     * @returns {string}
     */
    entropyCalculations(entropies, input, algorithm, flipOutput, binWidth, data) {
        let aboveScale = 0;
        let belowScale = 0;
        let highResults = [];
        let lowResults = [];

        const meanEntropy = this.generateAverage(entropies.entropyData);
        switch (input) {
            case "High":
                aboveScale = this.algorithmTypeHigh(algorithm, entropies, meanEntropy);
                highResults = this.getAllAbove(entropies.entropyData, meanEntropy+aboveScale);
                return this.generateOutput(highResults, data, flipOutput, binWidth);
            case "Low":
                belowScale = this.algorithmTypeLow(algorithm, entropies, meanEntropy);
                lowResults = this.getAllBelow(entropies.entropyData, meanEntropy-belowScale);
                return this.generateOutput(lowResults, data, flipOutput, binWidth);
            case "Low and High":
                aboveScale = this.algorithmTypeHigh(algorithm, entropies, meanEntropy);
                highResults = this.getAllAbove(entropies.entropyData, meanEntropy+aboveScale);
                belowScale = this.algorithmTypeLow(algorithm, entropies, meanEntropy);
                lowResults = this.getAllBelow(entropies.entropyData, meanEntropy-belowScale);
                return this.generateOutput(lowResults, data, flipOutput, binWidth) + this.generateOutput(highResults, data, flipOutput, binWidth);
        }
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    main(input, args) {
        if (args[2] < 0)
            throw new OperationError("Cannot have a lower bound entropy lower than 0");
        if (args[3] > 8)
            throw new OperationError("Cannot have an upper bound entropy greater than 8");
        if (args[1] >= input.byteLength)
            throw new OperationError("Block size is larger than the input");
        if (args[1] < 0)
            throw new OperationError("Cannot have a negative block size");

        let result = [];
        const entropies = this.calculateScanningEntropy(new Uint8Array(input), args[1]);
        switch (args[0]) {
            case "English Text":
                result = this.getRange(entropies.entropyData, 3.5, 5, input, args[5], args[1]);
                break;
            case "Enter Value Range":
                if (args[2] === args[3])
                    throw new OperationError("Should not have the upper bound entropy and the lower bound entropy equal to one another");
                if (args[2] > args[3])
                    throw new OperationError("Should not have lower bound entropy higher than the highere bound entropy");
                result = this.getRange(entropies.entropyData, args[2], args[3], input, args[5], args[1]);
                break;
            default:
                result = this.entropyCalculations(entropies, args[0], args[4], args[5], args[1], input);
        }
        return result;
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        let result = "";
        if (args[1].indexOf("-") !== -1) {
            const temp = args[1].split("-");
            for (let i = parseInt(temp[0], 10); i <parseInt(temp[1], 10); i++) {
                args[1] = i;
                result += this.main(input, args);
            }
        } else {
            args[1] = parseInt(args[1], 10);
            result = this.main(input, args);
        }
        return this.generateCompleteOutput(result);
    }

}

export default ExtractEntropies;
