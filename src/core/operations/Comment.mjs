/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Comment operation
 */
class Comment extends Operation {
    /**
     * Comment constructor
     */
    constructor() {
        super();

        this.name = "Comment";
        this.flowControl = true;
        this.module = "Default";
        this.description =
            "Provides a place to write comments within the flow of the recipe. This operation has no computational effect.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "",
                type: "text",
                value: "",
            },
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
        return state;
    }
}

export default Comment;
