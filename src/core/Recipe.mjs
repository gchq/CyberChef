/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import OperationConfig from "./config/OperationConfig.json";
import OperationError from "./errors/OperationError.mjs";
import Operation from "./Operation.mjs";
import DishError from "./errors/DishError.mjs";
import log from "loglevel";
import { isWorkerEnvironment } from "./Utils.mjs";

// Cache container for modules
let modules = null;

/**
 * The Recipe controls a list of Operations and the Dish they operate on.
 */
class Recipe  {

    /**
     * Recipe constructor
     *
     * @param {Object} recipeConfig
     */
    constructor(operations=[]) {
        this.state = new RecipeState();
        this.state.opList = operations;
    }


    /**
     * Returns the value of the Recipe as it should be displayed in a recipe config.
     *
     * @returns {Object[]}
     */
    get config() {
        return this.state.opList.map(op => ({
            op: op.name,
            args: op.ingValues,
        }));
    }


    /**
     * Adds a new Operation to this Recipe.
     *
     * @param {Operation} operation
     */
    addOperation(operation) {
        this.state.addOperation(operation);
    }


    /**
     * Adds a list of Operations to this Recipe.
     *
     * @param {Operation[]} operations
     */
    addOperations(operations) {
        operations.forEach(o => {
            this.state.addOperation(o);
        });
    }


    /**
     * Executes each operation in the recipe over the given Dish.
     *
     * @param {Dish} dish
     * @param {number} [forkState={}]
     *     - If this is a forked recipe, the state of the recipe up to this point
     * @returns {number}
     *     - The final progress through the recipe
     */
    async execute(dish, forkState={}) {
        let op, input, output;
        this.state.dish = dish;
        this.state.updateForkState(forkState);
        this.lastRunOp = null;

        log.debug(`[*] Executing recipe of ${this.state.opList.length} operations`);

        while (this.state.progress < this.state.opList.length) {
            const i = this.state.progress;
            op = this.state.currentOp;
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
                input = await this.state.dish.get(op.inputType);
                log.debug(`Executing operation '${op.name}'`);

                if (isWorkerEnvironment()) {
                    self.sendStatusMessage(`Baking... (${i+1}/${this.state.opList.length})`);
                    self.sendProgressMessage(i + 1, this.state.opList.length);
                }

                if (op.flowControl) {
                    this.state = await op.run(this.state);
                    this.state.progress++;
                } else {
                    output = await op.run(input, op.ingValues);
                    this.state.dish.set(output, op.outputType);
                    this.state.progress++;
                }
                this.lastRunOp = op;
            } catch (err) {
                // Return expected errors as output
                if (err instanceof OperationError ||
                    (err.type && err.type === "OperationError")) {
                    // Cannot rely on `err instanceof OperationError` here as extending
                    // native types is not fully supported yet.
                    this.state.dish.set(err.message, "string");
                    return i;
                } else if (err instanceof DishError ||
                    (err.type && err.type === "DishError")) {
                    this.state.dish.set(err.message, "string");
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
        return this.state.opList.length;
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
        while (this.state.progress < this.state.opList.length) {
        // for (let i = 0; i < this.state.opList.length; i++) {
            const op = this.state.currentOp;
            if (op.disabled) {
                this.state.progress++;
                continue;
            }

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
     * Build a recipe using a recipeConfig
     *
     * Hydrate the recipeConfig before using the hydrated operations
     * in the Recipe constructor. This decouples the hydration of
     * the operations from the Recipe logic.
     *
     * @param {recipeConfig} recipeConfig
     */
    static async buildRecipe(recipeConfig) {
        const operations = [];
        recipeConfig.forEach(c => {
            operations.push({
                name: c.op,
                module: OperationConfig[c.op].module,
                ingValues: c.args,
                breakpoint: c.breakpoint,
                disabled: c.disabled,
            });
        });

        if (!modules) {
            // Using Webpack Magic Comments to force the dynamic import to be included in the main chunk
            // https://webpack.js.org/api/module-methods/
            modules = await import(/* webpackMode: "eager" */ "./config/modules/OpModules.mjs");
            modules = modules.default;
        }

        const hydratedOperations = operations.map(o => {
            if (o instanceof Operation) {
                return o;
            } else {
                const op = new modules[o.module][o.name]();
                op.ingValues = o.ingValues;
                op.breakpoint = o.breakpoint;
                op.disabled = o.disabled;
                return op;
            }
        });

        return new Recipe(hydratedOperations);
    }

}

/**
 * Encapsulate the state of a Recipe
 *
 * Encapsulating the state makes it cleaner when passing the state
 * between operations.
 */
class RecipeState {

    /**
     * initialise a RecipeState
     */
    constructor() {
        this.dish = null;
        this.opList = [];
        this.progress = 0;
        this.forkOffset = 0;
        this.numRegisters = 0;
        this.numJumps = 0;
    }

    /**
     * get the next operation due to be run.
     * @return {Operation}
     */
    get currentOp() {
        return this.opList[this.progress];
    }

    /**
     * add an operation to the end of RecipeState's opList
     * @param {Operation} operation
     */
    addOperation(operation) {
        this.opList.push(operation);
    }

    /**
     * @returns {boolean} whether there's a flowControl operation in
     * the RecipeState's opList
     */
    containsFlowControl() {
        return this.opList.reduce((p, c) => {
            return p || c.flowControl;
        }, false);
    }

    /**
     * Update the RecipeState with state from a fork. Used at the end
     * of the Fork operation.
     * @param {Object} forkState
     */
    updateForkState(forkState) {
        if (forkState.progress || forkState.progress === 0) {
            this.progress = forkState.progress;
        }

        if (forkState.numRegisters || forkState.numRegisters === 0) {
            this.numRegisters = forkState.numRegisters;
        }

        if (forkState.numJumps || forkState.numJumps === 0) {
            this.numJumps = forkState.numJumps;
        }

        if (forkState.forkOffset || forkState.forkOffset === 0) {
            this.forkOffset = forkState.forkOffset;
        }
    }
}

export default Recipe;
export { RecipeState };
