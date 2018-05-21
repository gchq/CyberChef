/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Recipe from "../Recipe";
import Dish from "../Dish";

/**
 * Fork operation
 */
class Fork extends Operation {

    /**
     * Fork constructor
     */
    constructor() {
        super();

        this.name = "Fork";
        this.flowControl = true;
        this.module = "Default";
        this.description = "Split the input data up based on the specified delimiter and run all subsequent operations on each branch separately.<br><br>For example, to decode multiple Base64 strings, enter them all on separate lines then add the 'Fork' and 'From Base64' operations to the recipe. Each string will be decoded separately.";
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
     * Fork operation.
     *
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
            splitDelim   = ings[0],
            mergeDelim   = ings[1],
            ignoreErrors = ings[2],
            subOpList    = [];
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
                subOpList.push(opList[i]);
            }
        }

        const recipe = new Recipe();
        let output = "",
            progress = 0;

        state.forkOffset += state.progress + 1;

        recipe.addOperations(subOpList);

        // Take a deep(ish) copy of the ingredient values
        const ingValues = subOpList.map(op => JSON.parse(JSON.stringify(op.ingValues)));

        // Run recipe over each tranche
        for (i = 0; i < inputs.length; i++) {
            // Baseline ing values for each tranche so that registers are reset
            subOpList.forEach((op, i) => {
                op.ingValues = JSON.parse(JSON.stringify(ingValues[i]));
            });

            const dish = new Dish();
            dish.set(inputs[i], inputType);

            try {
                progress = await recipe.execute(dish, 0, state);
            } catch (err) {
                if (!ignoreErrors) {
                    throw err;
                }
                progress = err.progress + 1;
            }
            output += await dish.get(outputType) + mergeDelim;
        }

        state.dish.set(output, outputType);
        state.progress += progress;
        return state;
    }

}

export default Fork;
