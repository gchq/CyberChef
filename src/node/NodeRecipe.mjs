/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import { operations } from "./index.mjs";
import { sanitise } from "./apiUtils.mjs";

/**
 * Similar to core/Recipe, Recipe controls a list of operations and
 * the NodeDish the operate on. However, this Recipe is for the node
 * environment.
 */
class NodeRecipe {
    /**
     * Recipe constructor
     * @param recipeConfig
     */
    constructor(recipeConfig) {
        this._parseConfig(recipeConfig);
    }

    /**
     * Validate an ingredient & coerce to operation if necessary.
     * @param {String | Function | Object} ing
     * @returns {Function || Object} The operation, or an object with the
     *  operation and its arguments
     * @throws {TypeError} If it cannot find the operation in chef's list of operations.
     */
    _validateIngredient(ing) {
        // CASE operation name given. Find operation and validate
        if (typeof ing === "string") {
            const op = operations.find((op) => {
                return sanitise(op.opName) === sanitise(ing);
            });
            if (op) {
                // Need to validate against case 2
                return this._validateIngredient(op);
            } else {
                throw new TypeError(
                    `Couldn't find an operation with name '${ing}'.`,
                );
            }
            // CASE operation given. Check its a chef operation and check its not flowcontrol
        } else if (typeof ing === "function") {
            if (ing.flowControl) {
                throw new TypeError(
                    `flowControl operations like ${ing.opName} are not currently allowed in recipes for chef.bake in the Node API`,
                );
            }

            if (operations.includes(ing)) {
                return ing;
            } else {
                throw new TypeError("Inputted function not a Chef operation.");
            }
            // CASE: op, maybe with configuration
        } else if (ing.op) {
            const sanitisedOp = this._validateIngredient(ing.op);
            if (ing.args) {
                return { op: sanitisedOp, args: ing.args };
            }
            return sanitisedOp;
        } else {
            throw new TypeError(
                "Recipe can only contain function names or functions",
            );
        }
    }

    /**
     * Parse an opList from a recipeConfig and assign it to the recipe's opList.
     * @param {String | Function | String[] | Function[] | [String | Function]} recipeConfig
     */
    _parseConfig(recipeConfig) {
        if (!recipeConfig) {
            this.opList = [];
            return;
        }

        if (!Array.isArray(recipeConfig)) {
            recipeConfig = [recipeConfig];
        }

        this.opList = recipeConfig.map((ing) => this._validateIngredient(ing));
    }

    /**
     * Run the dish through each operation, one at a time.
     * @param {NodeDish} dish
     * @returns {NodeDish}
     */
    execute(dish) {
        return this.opList.reduce((prev, curr) => {
            // CASE where opList item is op and args
            if (
                Object.prototype.hasOwnProperty.call(curr, "op") &&
                Object.prototype.hasOwnProperty.call(curr, "args")
            ) {
                return curr.op(prev, curr.args);
            }
            // CASE opList item is just op.
            return curr(prev);
        }, dish);
    }
}

export default NodeRecipe;
