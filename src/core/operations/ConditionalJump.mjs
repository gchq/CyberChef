/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Dish from "../Dish.mjs";
import { getLabelIndex } from "../lib/FlowControl.mjs";

/**
 * Conditional Jump operation
 */
class ConditionalJump extends Operation {

    /**
     * ConditionalJump constructor
     */
    constructor() {
        super();

        this.name = "Conditional Jump";
        this.flowControl = true;
        this.module = "Default";
        this.description = "Conditionally jump forwards or backwards to the specified Label  based on whether the data matches the specified regular expression.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Match (regex)",
                "type": "string",
                "value": ""
            },
            {
                "name": "Invert match",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Label name",
                "type": "shortString",
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
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @param {number} state.numJumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    async run(state) {
        const ings   = state.opList[state.progress].ingValues,
            dish     = state.dish,
            [regexStr, invert, label, maxJumps] = ings,
            jmpIndex = getLabelIndex(label, state);

        if (state.numJumps >= maxJumps || jmpIndex === -1) {
            state.numJumps = 0;
            return state;
        }

        if (regexStr !== "") {
            const str = await dish.get(Dish.STRING);
            const strMatch = str.search(regexStr) > -1;
            if (!invert && strMatch || invert && !strMatch) {
                state.progress = jmpIndex;
                state.numJumps++;
            } else {
                state.numJumps = 0;
            }
        }

        return state;
    }

}

export default ConditionalJump;
