/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * Return operation
 */
class Return extends Operation {

    /**
     * Return constructor
     */
    constructor() {
        super();

        this.name = "Return";
        this.flowControl = true;
        this.module = "Default";
        this.description = "End execution of operations at this point in the recipe.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * Return operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    run(state) {
        state.progress = state.opList.length;
        return state;
    }

}

export default Return;
