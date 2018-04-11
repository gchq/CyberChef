/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Set cartesian product operation
 */
class CartesianProduct extends Operation {

    /**
     * Cartesian Product constructor
     */
    constructor() {
        super();

        this.name = "Cartesian Product";
        this.module = "Default";
        this.description = "Calculates the cartesian product of multiple sets of data, returning all possible combinations.";
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
     * @throws {Error} if fewer than 2 sets
     */
    validateSampleNumbers(sets) {
        if (!sets || sets.length < 2) {
            throw "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?";
        }
    }

    /**
     * Run the product operation
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        [this.sampleDelim, this.itemDelimiter] = args;
        const sets = input.split(this.sampleDelim);

        try {
            this.validateSampleNumbers(sets);
        } catch (e) {
            return e;
        }

        return this.runCartesianProduct(...sets.map(s => s.split(this.itemDelimiter)));
    }

    /**
    * Return the cartesian product of the two inputted sets.
    *
    * @param {Object[]} a
    * @param {Object[]} b
    * @param {Object[]} c
    * @returns {string}
    */
    runCartesianProduct(a, b, ...c) {
        /**
         * https://stackoverflow.com/a/43053803/7200497
         * @returns {Object[]}
         */
        const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));
        /**
         * https://stackoverflow.com/a/43053803/7200497
         * @returns {Object[][]}
         */
        const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);

        return cartesian(a, b, ...c)
            .map(set => `(${set.join(",")})`)
            .join(this.itemDelimiter);
    }
}

export default CartesianProduct;
