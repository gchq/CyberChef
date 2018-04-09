/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils";
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
        this.description = "Get the cartesian product of two sets";
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
     * Run the product operation
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

        return Utils.escapeHtml(this.runCartesianProduct(...sets.map(s => s.split(this.itemDelimiter))));
    }

    /**
    * Return the cartesian product of the two inputted sets.
    *
    * @param {Object[]} a
    * @param {Object[]} b
    * @returns {String[]}
    */
    runCartesianProduct(a, b) {
        return Array(Math.max(a.length, b.length))
            .fill(null)
            .map((item, index) => `(${a[index] || undefined},${b[index] || undefined})`)
            .join(this.itemDelimiter);
    }
}

export default CartesianProduct;
