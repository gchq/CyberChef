/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils";
import Operation from "../Operation";

/**
 * Set Symmetric Difference operation
 */
class SymmetricDifference extends Operation {

    /**
     * Symmetric Difference constructor
     */
    constructor() {
        super();

        this.name = "Symmetric Difference";
        this.module = "Default";
        this.description = "Get the symmetric difference of two sets";
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

        return Utils.escapeHtml(this.runSymmetricDifference(...sets.map(s => s.split(this.itemDelimiter))));
    }

    /**
     * Get elements in set a that are not in set b
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runSetDifference(a, b) {
        return a.filter((item) => {
            return b.indexOf(item) === -1;
        });
    }

    /**
     * Get elements of each set that aren't in the other set.
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @return {Object[]}
     */
    runSymmetricDifference(a, b) {
        return this.runSetDifference(a, b)
            .concat(this.runSetDifference(b, a))
            .join(this.itemDelimiter);
    }

}

export default SymmetricDifference;
