/**
 * @author masq [github.cyberchef@masq.cc]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Recipe from "../Recipe";
import Dish from "../Dish";

/**
 * Disjoin operation
 */
class Disjoin extends Operation {

    /**
     * Disjoin constructor
     */
    constructor() {
        super();

        this.name = "Disjoin";
        this.flowControl = true;
        this.module = "Default";
        this.description = "Runs further operations in parallel on the same input until a Join operation is reached";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Split delimiter",
                "type": "binaryShortString",
                "value": "\\n"
            },
            {
                "name": "Merge delimiter",
                "type": "binaryShortString",
                "value": "\\n"
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
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    async run(state) {
        const opList     = state.opList,
            inputType    = opList[state.progress].inputType,
            outputType   = opList[state.progress].outputType,
            input        = await state.dish.get(inputType),
            ings         = opList[state.progress].ingValues,
            [splitDelim, mergeDelim, ignoreErrors] = ings,
            subRecList   = [];
        let inputs       = [],
            i;

        if (input)
            inputs = input.split(splitDelim);

        // Create subOpList for each tranche to operate on
        // (all remaining operations unless we encounter a Merge)
        for (i = state.progress + 1; i < opList.length; i++) {
            if (opList[i].name === "Merge" && !opList[i].disabled) {
                break;
            } else {
                const subRec = new Recipe();
                subRec.addOperations(opList[i]);
                subRecList.push(subRec);
            }
        }

        let output = "",
            tmpProg = 0,
            progress = 0;

        state.forkOffset += state.progress + 1;

        for (i = 0; i < subRecList.length; i++) {
            const recipe = subRecList[i];

            // Take a deep(ish) copy of the ingredient values
            const ingValues = recipe.opList.map(op => JSON.parse(JSON.stringify(op.ingValues)));

            // Run recipe over each input
            for (let j = 0; j < inputs.length; j++) {
                // Baseline ing values for each tranche so that registers are reset
                recipe.opList.forEach((op, i) => {
                    op.ingValues = JSON.parse(JSON.stringify(ingValues[i]));
                });

                const dish = new Dish();
                dish.set(inputs[j], inputType);

                try {
                    tmpProg = await recipe.execute(dish, 0, state);
                } catch (err) {
                    if (!ignoreErrors) {
                        throw err;
                    }
                    tmpProg = err.progress + 1;
                }
                output += await dish.get(outputType) + mergeDelim;
            }
            progress += tmpProg;
        }

        state.dish.set(output, outputType);
        state.progress += progress;
        return state;
    }


}

export default Disjoin;
