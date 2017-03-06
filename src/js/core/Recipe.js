/**
 * The Recipe controls a list of Operations and the Dish they operate on.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 * @param {Object} recipeConfig
 */
var Recipe = function(recipeConfig) {
    this.opList = [];

    if (recipeConfig) {
        this._parseConfig(recipeConfig);
    }
};


/**
 * Reads and parses the given config.
 *
 * @private
 * @param {Object} recipeConfig
 */
Recipe.prototype._parseConfig = function(recipeConfig) {
    for (var c = 0; c < recipeConfig.length; c++) {
        var operationName = recipeConfig[c].op;
        var operationConfig = OperationConfig[operationName];
        var operation = new Operation(operationName, operationConfig);
        operation.setIngValues(recipeConfig[c].args);
        operation.setBreakpoint(recipeConfig[c].breakpoint);
        operation.setDisabled(recipeConfig[c].disabled);
        this.addOperation(operation);
    }
};


/**
 * Returns the value of the Recipe as it should be displayed in a recipe config.
 *
 * @returns {*}
 */
Recipe.prototype.getConfig = function() {
    var recipeConfig = [];

    for (var o = 0; o < this.opList.length; o++) {
        recipeConfig.push(this.opList[o].getConfig());
    }

    return recipeConfig;
};


/**
 * Adds a new Operation to this Recipe.
 *
 * @param {Operation} operation
 */
Recipe.prototype.addOperation = function(operation) {
    this.opList.push(operation);
};


/**
 * Adds a list of Operations to this Recipe.
 *
 * @param {Operation[]} operations
 */
Recipe.prototype.addOperations = function(operations) {
    this.opList = this.opList.concat(operations);
};


/**
 * Set a breakpoint on a specified Operation.
 *
 * @param {number} position - The index of the Operation
 * @param {boolean} value
 */
Recipe.prototype.setBreakpoint = function(position, value) {
    try {
        this.opList[position].setBreakpoint(value);
    } catch (err) {
        // Ignore index error
    }
};


/**
 * Remove breakpoints on all Operations in the Recipe up to the specified position. Used by Flow
 * Control Fork operation.
 *
 * @param {number} pos
 */
Recipe.prototype.removeBreaksUpTo = function(pos) {
    for (var i = 0; i < pos; i++) {
        this.opList[i].setBreakpoint(false);
    }
};


/**
 * Returns true if there is an Flow Control Operation in this Recipe.
 *
 * @returns {boolean}
 */
Recipe.prototype.containsFlowControl = function() {
    for (var i = 0; i < this.opList.length; i++) {
        if (this.opList[i].isFlowControl()) return true;
    }
    return false;
};


/**
 * Returns the index of the last Operation index that will be executed, taking into account disabled
 * Operations and breakpoints.
 *
 * @param {number} [startIndex=0] - The index to start searching from
 * @returns (number}
 */
Recipe.prototype.lastOpIndex = function(startIndex) {
    var i = startIndex + 1 || 0,
        op;

    for (; i < this.opList.length; i++) {
        op = this.opList[i];
        if (op.isDisabled()) return i-1;
        if (op.isBreakpoint()) return i-1;
    }

    return i-1;
};


/**
 * Executes each operation in the recipe over the given Dish.
 *
 * @param {Dish} dish
 * @param {number} [currentStep=0] - The index of the Operation to start executing from
 * @returns {number} - The final progress through the recipe
 */
Recipe.prototype.execute = function(dish, currentStep, state) {
    var recipe = this;

    var formatErrMsg = function(err, step, op) {
        var e = typeof err == "string" ? { message: err } : err;

        e.progress = step;
        if (e.fileName) {
            e.displayStr = op.name + " - " + e.name + " in " +
                e.fileName + " on line " + e.lineNumber +
                ".<br><br>Message: " + (e.displayStr || e.message);
        } else {
            e.displayStr = op.name + " - " + (e.displayStr || e.message);
        }

        return e;
    };

    // Operations can be asynchronous so we have to return a Promise to a future value.
    return new Promise(function(resolve, reject) {
        // Helper function to clean up recursing to the next recipe step.
        // It is a closure to avoid having to pass in resolve and reject.
        var execRecipe = function(recipe, dish, step, state) {
            return recipe.execute(dish, step, state)
                .then(function(progress) {
                    resolve(progress);
                })
                .catch(function(err) {
                    // Pass back the error to the previous caller.
                    // We don't want to handle the error here as the current
                    // operation did not cause the error, and so it should
                    // not appear in the error message.
                    reject(err);
                });
        };

        currentStep = currentStep || 0;

        if (currentStep >= recipe.opList.length) {
            resolve(currentStep);
            return;
        }

        var op = recipe.opList[currentStep],
            input = dish.get(op.inputType);

        if (op.isDisabled()) {
            // Skip to next operation
            var nextStep = currentStep + 1;
            execRecipe(recipe, dish, nextStep, state);
        } else if (op.isBreakpoint()) {
            // We are at a breakpoint, we shouldn't recurse to the next op.
            resolve(currentStep);
        } else  {
            var operationResult;

            // We must try/catch here because op.run can either return
            // A) a value
            // B) a promise
            // Promise.resolve -> .catch will handle errors from promises
            // try/catch will handle errors from values
            try {
                if (op.isFlowControl()) {
                    state = {
                        progress: currentStep,
                        dish: dish,
                        opList: recipe.opList,
                        numJumps: (state && state.numJumps) || 0,
                    };
                    operationResult = op.run(state);
                } else {
                    operationResult = op.run(input, op.getIngValues());
                }
            } catch (err) {
                reject(formatErrMsg(err, currentStep, op));
                return;
            }

            if (op.isFlowControl()) {
                Promise.resolve(operationResult)
                    .then(function(state) {
                        return recipe.execute(state.dish, state.progress + 1);
                    })
                    .then(function(progress) {
                        resolve(progress);
                    })
                    .catch(function(err) {
                        reject(formatErrMsg(err, currentStep, op));
                    });
            } else {
                Promise.resolve(operationResult)
                    .then(function(output) {
                        dish.set(output, op.outputType);
                        var nextStep = currentStep + 1;
                        execRecipe(recipe, dish, nextStep, state);
                    })
                    .catch(function(err) {
                        reject(formatErrMsg(err, currentStep, op));
                    });
            }
        }
    });
};


/**
 * Returns the recipe configuration in string format.
 *
 * @returns {string}
 */
Recipe.prototype.toString = function() {
    return JSON.stringify(this.getConfig());
};


/**
 * Creates a Recipe from a given configuration string.
 *
 * @param {string} recipeStr
 */
Recipe.prototype.fromString = function(recipeStr) {
    var recipeConfig = JSON.parse(recipeStr);
    this._parseConfig(recipeConfig);
};
