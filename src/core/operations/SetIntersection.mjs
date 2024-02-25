/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Set Intersection operation
 */
class SetIntersection extends Operation {

    /**
     * Set Intersection constructor
     */
    constructor() {
        super();

        this.name = "Set Intersection";
        this.module = "Default";
        this.description = "Calculates the intersection of two sets.";
        this.infoURL = "https://wikipedia.org/wiki/Intersection_(set_theory)";
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
     * Run the intersection operation
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

        return this.runIntersect(...sets.map(s => s.split(this.itemDelimiter)));
    }

    /**
     * Get the intersection of the two sets.
     *
     * @param {Object[]} a
     * @param {Object[]} b
     * @returns {Object[]}
     */
    runIntersect(a, b) {
        return a
            .filter((item) => {
                return b.indexOf(item) > -1;
            })
            .join(this.itemDelimiter);
    }

}

export default SetIntersection;
