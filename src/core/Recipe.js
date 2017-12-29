import Operation from "./Operation.js";


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
const Recipe = function(recipeConfig) {
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
    for (let c = 0; c < recipeConfig.length; c++) {
        const operationName = recipeConfig[c].op;
        const operation = new Operation(operationName);
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
    const recipeConfig = [];

    for (let o = 0; o < this.opList.length; o++) {
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
    for (let i = 0; i < pos; i++) {
        this.opList[i].setBreakpoint(false);
    }
};


/**
 * Returns true if there is an Flow Control Operation in this Recipe.
 *
 * @returns {boolean}
 */
Recipe.prototype.containsFlowControl = function() {
    for (let i = 0; i < this.opList.length; i++) {
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
    let i = startIndex + 1 || 0,
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
 * @param {number} [startFrom=0] - The index of the Operation to start executing from
 * @returns {number} - The final progress through the recipe
 */
Recipe.prototype.execute = async function(dish, startFrom) {
    startFrom = startFrom || 0;
    let op, input, output, numJumps = 0, numRegisters = 0;
    log.debug(`[*] Executing recipe of ${this.opList.length} operations, starting at ${startFrom}`);

    for (let i = startFrom; i < this.opList.length; i++) {
        op = this.opList[i];
        log.debug(`[${i}] ${op.name} ${JSON.stringify(op.getIngValues())}`);
        if (op.isDisabled()) {
            log.debug("Operation is disabled, skipping");
            continue;
        }
        if (op.isBreakpoint()) {
            log.debug("Pausing at breakpoint");
            return i;
        }

        try {
            input = dish.get(op.inputType);
            log.debug("Executing operation");

            if (op.isFlowControl()) {
                // Package up the current state
                let state = {
                    "progress":     i,
                    "dish":         dish,
                    "opList":       this.opList,
                    "numJumps":     numJumps,
                    "numRegisters": numRegisters
                };

                state = await op.run(state);
                i = state.progress;
                numJumps = state.numJumps;
                numRegisters = state.numRegisters;
            } else {
                output = await op.run(input, op.getIngValues());
                dish.set(output, op.outputType);
            }
        } catch (err) {
            const e = typeof err == "string" ? { message: err } : err;

            e.progress = i;
            if (e.fileName) {
                e.displayStr = op.name + " - " + e.name + " in " +
                    e.fileName + " on line " + e.lineNumber +
                    ".<br><br>Message: " + (e.displayStr || e.message);
            } else {
                e.displayStr = op.name + " - " + (e.displayStr || e.message);
            }

            throw e;
        }
    }

    log.debug("Recipe complete");
    return this.opList.length;
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
    const recipeConfig = JSON.parse(recipeStr);
    this._parseConfig(recipeConfig);
};


/**
 * Generates a list of all the highlight functions assigned to operations in the recipe, if the
 * entire recipe supports highlighting.
 *
 * @returns {Object[]} highlights
 * @returns {function} highlights[].f
 * @returns {function} highlights[].b
 * @returns {Object[]} highlights[].args
 */
Recipe.prototype.generateHighlightList = function() {
    const highlights = [];

    for (let i = 0; i < this.opList.length; i++) {
        let op = this.opList[i];
        if (op.isDisabled()) continue;

        // If any breakpoints are set, do not attempt to highlight
        if (op.isBreakpoint()) return false;

        // If any of the operations do not support highlighting, fail immediately.
        if (op.highlight === false || op.highlight === undefined) return false;

        highlights.push({
            f: op.highlight,
            b: op.highlightReverse,
            args: op.getIngValues()
        });
    }

    return highlights;
};

export default Recipe;
