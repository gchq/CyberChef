/**
 * @author GCHQ Contributor [2]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {fromHex} from "../lib/Hex";
import OperationError from "../errors/OperationError";

/**
 * Hamming Distance operation
 */
class HammingDistance extends Operation {

    /**
     * HammingDistance constructor
     */
    constructor() {
        super();

        this.name = "Hamming Distance";
        this.module = "Default";
        this.description = "In information theory, the Hamming distance between two strings of equal length is the number of positions at which the corresponding symbols are different. In other words, it measures the minimum number of substitutions required to change one string into the other, or the minimum number of errors that could have transformed one string into the other. In a more general context, the Hamming distance is one of several string metrics for measuring the edit distance between two sequences.";
        this.infoURL = "https://wikipedia.org/wiki/Hamming_distance";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Delimiter",
                "type": "binaryShortString",
                "value": "\\n\\n"
            },
            {
                "name": "Unit",
                "type": "option",
                "value": ["Byte", "Bit"]
            },
            {
                "name": "Input type",
                "type": "option",
                "value": ["Raw string", "Hex"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = args[0],
            byByte = args[1] === "Byte",
            inputType = args[2],
            samples = input.split(delim);

        if (samples.length !== 2) {
            throw new OperationError("Error: You can only calculae the edit distance between 2 strings. Please ensure exactly two inputs are provided, separated by the specified delimiter.");
        }

        if (samples[0].length !== samples[1].length) {
            throw new OperationError("Error: Both inputs must be of the same length.");
        }

        if (inputType === "Hex") {
            samples[0] = fromHex(samples[0]);
            samples[1] = fromHex(samples[1]);
        } else {
            samples[0] = Utils.strToByteArray(samples[0]);
            samples[1] = Utils.strToByteArray(samples[1]);
        }

        let dist = 0;

        for (let i = 0; i < samples[0].length; i++) {
            const lhs = samples[0][i],
                rhs = samples[1][i];

            if (byByte && lhs !== rhs) {
                dist++;
            } else if (!byByte) {
                let xord = lhs ^ rhs;

                while (xord) {
                    dist++;
                    xord &= xord - 1;
                }
            }
        }

        return dist.toString();
    }

}

export default HammingDistance;
