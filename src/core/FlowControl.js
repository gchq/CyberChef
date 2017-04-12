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
     * @constant
     * @default
     */
    FORK_DELIM: "\\n",
    /**
     * @constant
     * @default
     */
    MERGE_DELIM: "\\n",
    /**
     * @constant
     * @default
     */
    FORK_IGNORE_ERRORS: false,

    /**
     * Fork operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runFork: function(state) {
        var opList       = state.opList,
            inputType    = opList[state.progress].inputType,
            outputType   = opList[state.progress].outputType,
            input        = state.dish.get(inputType),
            ings         = opList[state.progress].getIngValues(),
            splitDelim   = ings[0],
            mergeDelim   = ings[1],
            ignoreErrors = ings[2],
            subOpList    = [],
            inputs       = [];

        if (input)
            inputs = input.split(splitDelim);

        // Create subOpList for each tranche to operate on
        // (all remaining operations unless we encounter a Merge)
        for (var i = state.progress + 1; i < opList.length; i++) {
            if (opList[i].name === "Merge" && !opList[i].isDisabled()) {
                break;
            } else {
                subOpList.push(opList[i]);
            }
        }

        var recipe = new Recipe();
        recipe.addOperations(subOpList);

        return new Promise(function(resolve, reject) {
            var promises = inputs.map(function(input, i) {
                var forkDish = new Dish(input, inputType);

                return new Promise(function(resolve, reject) {
                    recipe.execute(forkDish, 0)
                        .then(function(progress) {
                            resolve({
                                progress: progress,
                                dish: forkDish,
                            });
                        })
                        .catch(function(err) {
                            if (ignoreErrors) {
                                resolve({
                                    progress: err.progress + 1,
                                    dish: forkDish,
                                });
                            } else {
                                reject(err);
                            }
                        });
                });

            });

            Promise.all(promises)
                .then(function(values) {
                    var progress = 0;

                    var output = values.map(function(value) {
                        progress = value.progress;
                        return value.dish.get(outputType);
                    }).join(mergeDelim);

                    state.progress += progress;
                    state.dish.set(output, outputType);

                    resolve(state);
                })
                .catch(function(err) {
                    reject(err);
                });
        });
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
     * @constant
     * @default
     */
    JUMP_NUM: 0,
    /**
     * @constant
     * @default
     */
    MAX_JUMPS: 10,

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
        var ings     = state.opList[state.progress].getIngValues(),
            jumpNum  = ings[0],
            maxJumps = ings[1];

        if (jumpNum < 0) {
            jumpNum--;
        }

        if (state.numJumps >= maxJumps) {
            return state;
        }

        state.progress += jumpNum;
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
        var ings     = state.opList[state.progress].getIngValues(),
            dish     = state.dish,
            regexStr = ings[0],
            jumpNum  = ings[1],
            maxJumps = ings[2];

        if (jumpNum < 0) {
            jumpNum--;
        }

        if (state.numJumps >= maxJumps) {
            return state;
        }

        if (regexStr !== "" && dish.get(Dish.STRING).search(regexStr) > -1) {
            state.progress += jumpNum;
            state.numJumps++;
        }

        return state;
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
        state.progress = state.opList.length - 1;
        return state;
    },


    /**
     * @constant
     * @default
     */
    SLEEP_TIME: 2500,


    /**
     * Wait operation.
     *
     * @param {Object} state - The current state of the recipe.
     * @param {number} state.progress - The current position in the recipe.
     * @param {Dish} state.dish - The Dish being operated on.
     * @param {Operation[]} state.opList - The list of operations in the recipe.
     * @returns {Object} The updated state of the recipe.
     */
    runWait: function(state) {
        var ings = state.opList[state.progress].getIngValues(),
            sleepTime = ings[0];

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve(state);
            }, sleepTime);
        });
    },

};

export default FlowControl;
