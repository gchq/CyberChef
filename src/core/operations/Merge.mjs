/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Merge operation
 */
class Merge extends Operation {

    /**
     * Merge constructor
     */
    constructor() {
        super();

        this.name = "Merge";
        this.flowControl = true;
        this.module = "Default";
        this.description = "Consolidate all branches back into a single trunk. The opposite of Fork. Unticking the Merge All checkbox will only consolidate all branches up to the nearest Fork/Subsection.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Merge All",
                type: "boolean",
                value: true,
            }
        ];
    }

    /**
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    run(state) {
        // No need to actually do anything here. The fork operation will
        // merge when it sees this operation.
        return state;
    }

}

export default Merge;
