/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import OpModules from "./config/modules/OpModules";
import OperationConfig from "./config/OperationConfig.json";
import OperationError from "./errors/OperationError";
import DishError from "./errors/DishError";
import log from "loglevel";

/**
 * The Recipe controls a list of Operations and the Dish they operate on.
 */
class Recipe  {

    /**
     * Recipe constructor
     *
     * @param {Object} recipeConfig
     */
    constructor(recipeConfig) {
        this.opList = [];

        if (recipeConfig) {
            this._parseConfig(recipeConfig);
        }
    }


    /**
     * Reads and parses the given config.
     *
     * @private
     * @param {Object} recipeConfig
     */
    _parseConfig(recipeConfig) {
        for (let c = 0; c < recipeConfig.length; c++) {
            const operationName = recipeConfig[c].op;
            const opConf = OperationConfig[operationName];
            const opObj = OpModules[opConf.module][operationName];
            const operation = new opObj();
            operation.ingValues = recipeConfig[c].args;
            operation.breakpoint = recipeConfig[c].breakpoint;
            operation.disabled = recipeConfig[c].disabled;
            this.addOperation(operation);
        }
    }


    /**
     * Returns the value of the Recipe as it should be displayed in a recipe config.
     *
     * @returns {Object[]}
     */
    get config() {
        return this.opList.map(op => op.config);
    }


    /**
     * Adds a new Operation to this Recipe.
     *
     * @param {Operation} operation
     */
    addOperation(operation) {
        this.opList.push(operation);
    }


    /**
     * Adds a list of Operations to this Recipe.
     *
     * @param {Operation[]} operations
     */
    addOperations(operations) {
        this.opList = this.opList.concat(operations);
    }


    /**
     * Set a breakpoint on a specified Operation.
     *
     * @param {number} position - The index of the Operation
     * @param {boolean} value
     */
    setBreakpoint(position, value) {
        try {
            this.opList[position].breakpoint = value;
        } catch (err) {
            // Ignore index error
        }
    }


    /**
     * Remove breakpoints on all Operations in the Recipe up to the specified position. Used by Flow
     * Control Fork operation.
     *
     * @param {number} pos
     */
    removeBreaksUpTo(pos) {
        for (let i = 0; i < pos; i++) {
            this.opList[i].breakpoint = false;
        }
    }


    /**
     * Returns true if there is an Flow Control Operation in this Recipe.
     *
     * @returns {boolean}
     */
    containsFlowControl() {
        return this.opList.reduce((acc, curr) => {
            return acc || curr.flowControl;
        }, false);
    }


    /**
     * Executes each operation in the recipe over the given Dish.
     *
     * @param {Dish} dish
     * @param {number} [startFrom=0]
     *     - The index of the Operation to start executing from
     * @param {number} [forkState={}]
     *     - If this is a forked recipe, the state of the recipe up to this point
     * @returns {number}
     *     - The final progress through the recipe
     */
    async execute(dish, startFrom=0, forkState={}) {
        let op, input, output,
            numJumps = 0,
            numRegisters = forkState.numRegisters || 0;

        if (startFrom === 0) this.lastRunOp = null;

        log.debug(`[*] Executing recipe of ${this.opList.length} operations, starting at ${startFrom}`);

        for (let i = startFrom; i < this.opList.length; i++) {
            op = this.opList[i];
            log.debug(`[${i}] ${op.name} ${JSON.stringify(op.ingValues)}`);
            if (op.disabled) {
                log.debug("Operation is disabled, skipping");
                continue;
            }
            if (op.breakpoint) {
                log.debug("Pausing at breakpoint");
                return i;
            }

            try {
                input = await dish.get(op.inputType);
                log.debug("Executing operation");

                if (op.flowControl) {
                    // Package up the current state
                    let state = {
                        "progress":     i,
                        "dish":         dish,
                        "opList":       this.opList,
                        "numJumps":     numJumps,
                        "numRegisters": numRegisters,
                        "forkOffset":   forkState.forkOffset || 0
                    };

                    state = await op.run(state);
                    i = state.progress;
                    numJumps = state.numJumps;
                    numRegisters = state.numRegisters;
                } else {
                    output = await op.run(input, op.ingValues);
                    dish.set(output, op.outputType);
                }
                this.lastRunOp = op;
            } catch (err) {
                // Return expected errors as output
                if (err instanceof OperationError ||
                    (err.type && err.type === "OperationError")) {
                    // Cannot rely on `err instanceof OperationError` here as extending
                    // native types is not fully supported yet.
                    dish.set(err.message, "string");
                    return i;
                } else if (err instanceof DishError ||
                    (err.type && err.type === "DishError")) {
                    dish.set(err.message, "string");
                    return i;
                } else {
                    const e = typeof err == "string" ? { message: err } : err;

                    e.progress = i;
                    if (e.fileName) {
                        e.displayStr = `${op.name} - ${e.name} in ${e.fileName} on line ` +
                            `${e.lineNumber}.<br><br>Message: ${e.displayStr || e.message}`;
                    } else {
                        e.displayStr = `${op.name} - ${e.displayStr || e.message}`;
                    }

                    throw e;
                }
            }
        }

        log.debug("Recipe complete");
        return this.opList.length;
    }


    /**
     * Present the results of the final operation.
     *
     * @param {Dish} dish
     */
    async present(dish) {
        if (!this.lastRunOp) return;

        const output = await this.lastRunOp.present(
            await dish.get(this.lastRunOp.outputType),
            this.lastRunOp.ingValues
        );
        dish.set(output, this.lastRunOp.presentType);
    }


    /**
     * Returns the recipe configuration in string format.
     *
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.config);
    }


    /**
     * Creates a Recipe from a given configuration string.
     *
     * @param {string} recipeStr
     */
    fromString(recipeStr) {
        const recipeConfig = JSON.parse(recipeStr);
        this._parseConfig(recipeConfig);
    }


    /**
     * Generates a list of all the highlight functions assigned to operations in the recipe, if the
     * entire recipe supports highlighting.
     *
     * @returns {Object[]} highlights
     * @returns {function} highlights[].f
     * @returns {function} highlights[].b
     * @returns {Object[]} highlights[].args
     */
    generateHighlightList() {
        const highlights = [];

        for (let i = 0; i < this.opList.length; i++) {
            const op = this.opList[i];
            if (op.disabled) continue;

            // If any breakpoints are set, do not attempt to highlight
            if (op.breakpoint) return false;

            // If any of the operations do not support highlighting, fail immediately.
            if (op.highlight === false || op.highlight === undefined) return false;

            highlights.push({
                f: op.highlight,
                b: op.highlightReverse,
                args: op.ingValues
            });
        }

        return highlights;
    }


    /**
     * Determines whether the previous operation has a different presentation type to its normal output.
     *
     * @param {number} progress
     * @returns {boolean}
     */
    lastOpPresented(progress) {
        if (progress < 1) return false;
        return this.opList[progress-1].presentType !== this.opList[progress-1].outputType;
    }

}

export default Recipe;
