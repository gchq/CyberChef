/**
 * @author d98762625 [d98762625@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import {operations} from "./index.mjs";
import { sanitise } from "./apiUtils.mjs";
import Utils from "../core/Utils";


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
            }

            throw new TypeError(`Couldn't find an operation with name '${ing}'.`);

        } else if (typeof ing === "function") {
            if (operations.includes(ing)) {
                return ing;
            } else {
                throw new TypeError("Inputted function not a Chef operation.");
            }
        // CASE: op, maybe with configuration
        } else if (ing.op) {
            const sanitisedOp = this._validateIngredient(ing.op);
            if (ing.args) {

                // disabled, breakpoint options sometimes come from parsed
                // recipes pasted from UI
                return {
                    op: sanitisedOp,
                    args: ing.args,
                    disabled: ing.disabled,
                    breakpoint: ing.breakpoint
                };
            }
            return sanitisedOp;
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

        // Case for when recipeConfig is a chef format recipe string
        if (typeof recipeConfig == "string" || recipeConfig instanceof String) {
            const attemptedParseResult = Utils.parseRecipeConfig(recipeConfig);
            if (attemptedParseResult.length > 0) {
                recipeConfig = attemptedParseResult;
            }
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
        for (const op of this.opList) {
            if (
                Object.prototype.hasOwnProperty.call(op, "op") &&
                Object.prototype.hasOwnProperty.call(op, "args")
            ) {

                if (op.breakpoint) {
                    break;
                }

                if (op.disabled) {
                    continue;
                }

                dish = op.op(dish, op.args);
            } else {
                dish = op(dish);
            }
        }

        return dish;
    }
}

export default NodeRecipe;
