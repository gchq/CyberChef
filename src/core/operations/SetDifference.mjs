/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";

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
        this.description = "Calculates the difference of two sets.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Sample delimiter",
                type: "binaryString",
                value: "\\n\\n"
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
     *
     * @param {Object[]} sets
     * @throws {Error} if not two sets
     */
    validateSampleNumbers(sets) {
        if (!sets || (sets.length !== 2)) {
            throw new OperationError("Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?");
        }
    }

    /**
     * Run the difference operation
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     * @throws {OperationError}
     */
    run(input, args) {
        [this.sampleDelim, this.itemDelimiter] = args;
        const sets = input.split(this.sampleDelim);

        this.validateSampleNumbers(sets);

        return this.runSetDifference(...sets.map(s => s.split(this.itemDelimiter)));
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
