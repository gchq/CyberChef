import Recipe from "./Recipe.js";
import Dish from "./Dish.js";


/**
 * Flow Control operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const FlowControl = {

    /**
     * Fork operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runFork: async function(state) {
        let opList       = state.opList,
            inputType    = opList[state.progress].inputType,
            outputType   = opList[state.progress].outputType,
            input        = state.dish.get(inputType),
            ings         = opList[state.progress].getIngValues(),
            splitDelim   = ings[0],
            mergeDelim   = ings[1],
            ignoreErrors = ings[2],
            subOpList    = [],
            inputs       = [],
            i;

        if (input)
            inputs = input.split(splitDelim);

        // Create subOpList for each tranche to operate on
        // (all remaining operations unless we encounter a Merge)
        for (i = state.progress + 1; i < opList.length; i++) {
            if (opList[i].name === "Merge" && !opList[i].isDisabled()) {
                break;
            } else {
                subOpList.push(opList[i]);
            }
        }

        let recipe = new Recipe(),
            output = "",
            progress = 0;

        recipe.addOperations(subOpList);

        // Run recipe over each tranche
        for (i = 0; i < inputs.length; i++) {
            const dish = new Dish(inputs[i], inputType);
            try {
                progress = await recipe.execute(dish, 0);
            } catch (err) {
                if (!ignoreErrors) {
                    throw err;
                }
                progress = err.progress + 1;
            }
            output += dish.get(outputType) + mergeDelim;
        }

        state.dish.set(output, outputType);
        state.progress += progress;
        return state;
    },


    /**
     * Merge operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runMerge: function(state) {
        // No need to actually do anything here. The fork operation will
        // merge when it sees this operation.
        return state;
    },


    /**
     * Register operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runRegister: function(state) {
        const ings = state.opList[state.progress].getIngValues(),
            extractorStr = ings[0],
            i = ings[1],
            m = ings[2];

        let modifiers = "";
        if (i) modifiers += "i";
        if (m) modifiers += "m";

        const extractor = new RegExp(extractorStr, modifiers),
            input = state.dish.get(Dish.STRING),
            registers = input.match(extractor);

        if (!registers) return state;

        if (ENVIRONMENT_IS_WORKER()) {
            self.setRegisters(state.progress, state.numRegisters, registers.slice(1));
        }

        /**
         * Replaces references to registers (e.g. $R0) with the contents of those registers.
         *
         * @param {string} str
         * @returns {string}
         */
        function replaceRegister(str) {
            // Replace references to registers ($Rn) with contents of registers
            return str.replace(/(\\*)\$R(\d{1,2})/g, (match, slashes, regNum) => {
                const index = parseInt(regNum, 10) + 1;
                if (index <= state.numRegisters || index >= state.numRegisters + registers.length)
                    return match;
                if (slashes.length % 2 !== 0) return match.slice(1); // Remove escape
                return slashes + registers[index - state.numRegisters];
            });
        }

        // Step through all subsequent ops and replace registers in args with extracted content
        for (let i = state.progress + 1; i < state.opList.length; i++) {
            if (state.opList[i].isDisabled()) continue;

            let args = state.opList[i].getIngValues();
            args = args.map(arg => {
                if (typeof arg !== "string" && typeof arg !== "object") return arg;

                if (typeof arg === "object" && arg.hasOwnProperty("string")) {
                    arg.string = replaceRegister(arg.string);
                    return arg;
                }
                return replaceRegister(arg);
            });
            state.opList[i].setIngValues(args);
        }

        state.numRegisters += registers.length - 1;
        return state;
    },


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
    runJump: function(state) {
        let ings     = state.opList[state.progress].getIngValues(),
            jmpIndex = FlowControl._getLabelIndex(ings[0], state),
            maxJumps = ings[1];

        if (state.numJumps >= maxJumps || jmpIndex == -1) {
            return state;
        }

        state.progress = jmpIndex;
        state.numJumps++;
        return state;
    },


    /**
     * Conditional Jump operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @param {number} state.numJumps - The number of jumps taken so far.
     * @returns {Object} The updated state of the recipe.
     */
    runCondJump: function(state) {
        let ings     = state.opList[state.progress].getIngValues(),
            dish     = state.dish,
            regexStr = ings[0],
            invert   = ings[1],
            jmpIndex = FlowControl._getLabelIndex(ings[2], state),
            maxJumps = ings[3];

        if (state.numJumps >= maxJumps || jmpIndex == -1) {
            return state;
        }

        if (regexStr !== "") {
            let strMatch = dish.get(Dish.STRING).search(regexStr) > -1;
            if (!invert && strMatch || invert && !strMatch) {
                state.progress = jmpIndex;
                state.numJumps++;
            }
        }

        return state;
    },

    /**
     * Returns the index of a label.
     *
     * @param {Object} state
     * @param {string} name
     * @returns {number}
     */

    _getLabelIndex: function(name, state) {
        let index = -1;
        for (let o = 0; o < state.opList.length; o++) {
            let operation = state.opList[o];
            if (operation.getConfig()["op"] === "Label"){
                let ings = operation.getIngValues();
                if (name === ings[0]) {
                    index = o;
                    break;
                }
            }
        }
        return index;
    },




    /**
     * Return operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runReturn: function(state) {
        state.progress = state.opList.length;
        return state;
    },


    /**
     * Comment operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runComment: function(state) {
        return state;
    },

};

export default FlowControl;
