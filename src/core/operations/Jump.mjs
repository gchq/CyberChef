/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { getLabelIndex } from "../lib/FlowControl";

/**
 * Jump operation
 */
class Jump extends Operation {

    /**
     * Jump constructor
     */
    constructor() {
        super();

        this.name = "Jump";
        this.flowControl = true;
        this.module = "Default";
        this.description = "Jump forwards or backwards to the specified Label";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Label name",
                "type": "string",
                "value": ""
            },
            {
                "name": "Maximum jumps (if jumping backwards)",
                "type": "number",
                "value": 10
            }
        ];
    }

    /**
     * Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @param {number} state.numJumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    run(state) {
        const ings     = state.opList[state.progress].ingValues;
        const label = ings[0];
        const maxJumps = ings[1];
        const jmpIndex = getLabelIndex(label, state);

        if (state.numJumps >= maxJumps || jmpIndex === -1) {
            return state;
        }

        state.progress = jmpIndex;
        state.numJumps++;
        return state;

    }

}

export default Jump;
