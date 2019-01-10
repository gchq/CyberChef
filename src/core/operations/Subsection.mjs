/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import XRegExp from "xregexp";
import Operation from "../Operation";
import Recipe from "../Recipe";
import Dish from "../Dish";

/**
 * Subsection operation
 */
class Subsection extends Operation {

    /**
     * Subsection constructor
     */
    constructor() {
        super();

        this.name = "Subsection";
        this.flowControl = true;
        this.module = "Regex";
        this.description = "Select a part of the input data using a regular expression (regex), and run all subsequent operations on each match separately.<br><br>You can use up to one capture group, where the recipe will only be run on the data in the capture group. If there's more than one capture group, only the first one will be operated on.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Section (regex)",
                "type": "string",
                "value": ""
            },
            {
                "name": "Case sensitive matching",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Ignore errors",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.Dish - The Dish being operated on
     * @param {Operation[]} state.opList - The list of operations in the recipe
     * @returns {Object} - The updated state of the recipe
     */
    async run(state) {
        const opList    = state.opList,
            inputType   = opList[state.progress].inputType,
            outputType  = opList[state.progress].outputType,
            input       = await state.dish.get(inputType),
            ings        = opList[state.progress].ingValues,
            [section, caseSensitive, ignoreErrors]   = ings,
            subOpList   = [];

        if (input && section !== "") {
            // Create subOpList for each tranche to operate on
            // (all remaining operations unless we encounter a Merge)
            for (let i = state.progress + 1; i < opList.length; i++) {
                if (opList[i].name === "Merge" && !opList[i].disabled) {
                    break;
                } else {
                    subOpList.push(opList[i]);
                }
            }

            let flags = "g",
                inOffset = 0,
                output = "",
                m,
                progress = 0;
            if (!caseSensitive)
                flags += "i";
            const regex = new XRegExp(section, flags),
                recipe = new Recipe();

            recipe.addOperations(subOpList);
            state.forkOffset += state.progress + 1;

            // Take a deep(ish) copy of the ingredient values
            const ingValues = subOpList.map(op => JSON.parse(JSON.stringify(op.ingValues)));
            let matched = false;

            // Run recipe over each match
            while ((m = regex.exec(input))) {
                matched = true;
                // Add up to match
                let matchStr = m[0];
                if (m.length === 1) {
                    output += input.slice(inOffset, m.index);
                    inOffset = regex.lastIndex;
                } else if (m.length >= 2) {
                    matchStr = m[1];
                    // Need to add some of the matched string that isn't in the capture group
                    output += input.slice(inOffset, m.index + m[0].indexOf(m[1]));
                    // Set i to be after the end of the first capture group
                    inOffset = regex.lastIndex - (m[0].length - (m[0].indexOf(m[1]) + m[1].length));
                }
                // Baseline ing values for each tranche so that registers are reset
                subOpList.forEach((op, i) => {
                    op.ingValues = JSON.parse(JSON.stringify(ingValues[i]));
                });

                const dish = new Dish();
                dish.set(matchStr, inputType);

                try {
                    progress = await recipe.execute(dish, 0, state);
                } catch (err) {
                    if (!ignoreErrors) {
                        throw err;
                    }
                    progress = err.progress + 1;
                }
                output += await dish.get(outputType);
            }
            // If no matches were found, advance progress to after a Merge op
            // Otherwise, the operations below Subsection will be run on all the input data
            if (!matched) {
                state.progress += subOpList.length + 1;
            }

            output += input.slice(inOffset);
            state.progress += progress;
            state.dish.set(output, outputType);
        }
        return state;
    }

}

export default Subsection;
