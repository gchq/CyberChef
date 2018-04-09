/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils";
import Operation from "../Operation";

/**
 * Set Difference operation
 */
class SetDifference extends Operation {

    /**
     * Set Difference constructor
     */
    constructor() {
        super();

        this.name = "Set Difference";
        this.module = "Default";
        this.description = "Get the Difference of two sets";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: Utils.escapeHtml("\\n\\n")
            },
            {
                name: "Item delimiter",
                type: "binaryString",
                value: ","
            },
        ];
    }

    /**
     * Validate input length
     * @param {Object[]} sets
     * @throws {Error} if not two sets
     */
    validateSampleNumbers(sets) {
        if (!sets || (sets.length !== 2)) {
            throw "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?";
        }
    }

    /**
     * Run the difference operation
     * @param input
     * @param args
     */
    run(input, args) {
        [this.sampleDelim, this.itemDelimiter] = args;
        const sets = input.split(this.sampleDelim);

        try {
            this.validateSampleNumbers(sets);
        } catch (e) {
            return e;
        }

        return Utils.escapeHtml(this.runSetDifferencez(...sets.map(s => s.split(this.itemDelimiter))));
    }

    /**
     * Get elements in set a that are not in set b
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runSetDifference(a, b) {
        return a
            .filter((item) => {
                return b.indexOf(item) === -1;
            })
            .join(this.itemDelimiter);
    }

}

export default SetDifference;
