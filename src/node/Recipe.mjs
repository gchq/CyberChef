/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import {operations} from "./index";
import { sanitise } from "./apiUtils";

/**
 * Similar to core/Recipe, Recipe controls a list of operations and
 * the SyncDish the operate on. However, this Recipe is for the node
 * environment.
 */
class Recipe {

    /**
     * Recipe constructor
     * @param recipeConfig 
     */
    constructor(recipeConfig) {
        this._parseConfig(recipeConfig);
    }


    /**
     * Validate an ingredient $ coerce to operation if necessary.
     * @param {String | Function | Object} ing
     */
    _validateIngredient(ing) {
        if (typeof ing === "string") {
            const op = operations.find((op) => {
                return sanitise(op.opName) === sanitise(ing);
            });
            if (op) {
                return op;
            } else {
                throw new TypeError(`Couldn't find an operation with name '${ing}'.`);
            }
        } else if (typeof ing === "function") {
            if (operations.findIndex(o => o === ing) > -1) {
                return ing;
            } else {
                throw new TypeError("Inputted function not a Chef operation.");
            }
        // CASE: op with configuration
        } else if (ing.op && ing.args) {
            // Return op and args pair for opList item.
            const sanitisedOp = this._validateIngredient(ing.op);
            return {op: sanitisedOp, args: ing.args};
        } else {
            throw new TypeError("Recipe can only contain function names or functions");
        }
    }


    /**
     * Parse config for recipe.
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
     * @param {SyncDish} dish
     * @returns {SyncDish}
     */
    execute(dish) {
        return this.opList.reduce((prev, curr) => {
            // CASE where opLis item is op and args
            if (curr.hasOwnProperty("op") && curr.hasOwnProperty("args")) {
                return curr.op(prev, curr.args);
            }
            // CASE opList item is just op.
            return curr(prev);
        }, dish);
    }
}

export default Recipe;
