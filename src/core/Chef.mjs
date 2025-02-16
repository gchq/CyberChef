/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Dish from "./Dish.mjs";
import Recipe from "./Recipe.mjs";
import log from "loglevel";
import { isWorkerEnvironment } from "./Utils.mjs";

/**
 * The main controller for CyberChef.
 */
class Chef {

    /**
     * Chef constructor
     */
    constructor() {
        this.dish = new Dish();
    }


    /**
     * Runs the recipe over the input.
     *
     * @param {string|ArrayBuffer} input - The input data as a string or ArrayBuffer
     * @param {Object[]} recipeConfig - The recipe configuration object
     * @param {Object} [options={}] - The options object storing various user choices
     * @param {string} [options.returnType] - What type to return the result as
     *
     * @returns {Object} response
     * @returns {string} response.result - The output of the recipe
     * @returns {string} response.type - The data type of the result
     * @returns {number} response.progress - The position that we have got to in the recipe
     * @returns {number} response.duration - The number of ms it took to execute the recipe
     * @returns {number} response.error - The error object thrown by a failed operation (false if no error)
    */
    async bake(input, recipeConfig, options={}) {
        log.debug("Chef baking");
        const startTime = Date.now(),
            recipe      = new Recipe(recipeConfig),
            containsFc  = recipe.containsFlowControl();
        let error = false,
            progress = 0;

        if (containsFc && isWorkerEnvironment()) self.setOption("attemptHighlight", false);

        // Load data
        const type = input instanceof ArrayBuffer ? Dish.ARRAY_BUFFER : Dish.STRING;
        this.dish.set(input, type);

        try {
            progress = await recipe.execute(this.dish, progress);
        } catch (err) {
            log.error(err);
            error = {
                displayStr: err.displayStr,
            };
            progress = err.progress;
        }

        // Create a raw version of the dish, unpresented
        const rawDish = this.dish.clone();

        // Present the raw result
        await recipe.present(this.dish);

        const returnType =
            this.dish.type === Dish.HTML ? Dish.HTML :
                options?.returnType ? options.returnType : Dish.ARRAY_BUFFER;

        return {
            dish: rawDish,
            result: await this.dish.get(returnType),
            type: Dish.enumLookup(this.dish.type),
            progress: progress,
            duration: Date.now() - startTime,
            error: error
        };
    }


    /**
     * When a browser tab is unfocused and the browser has to run lots of dynamic content in other tabs,
     * it swaps out the memory for that tab. If the CyberChef tab has been unfocused for more than a
     * minute, we run a silent bake which will force the browser to load and cache all the relevant
     * JavaScript code needed to do a real bake.
     *
     * This will stop baking taking a long time when the CyberChef browser tab has been unfocused for a
     * long time and the browser has swapped out all its memory.
     *
     * The output will not be modified (hence "silent" bake).
     *
     * This will only actually execute the recipe if auto-bake is enabled, otherwise it will just load
     * the recipe, ingredients and dish.
     *
     * @param {Object[]} recipeConfig - The recipe configuration object
     * @returns {number} The time it took to run the silent bake in milliseconds.
    */
    silentBake(recipeConfig) {
        log.debug("Running silent bake");

        const startTime = Date.now(),
            recipe = new Recipe(recipeConfig),
            dish = new Dish();

        try {
            recipe.execute(dish);
        } catch (err) {
            // Suppress all errors
        }
        return Date.now() - startTime;
    }


    /**
     * Calculates highlight offsets if possible.
     *
     * @param {Object[]} recipeConfig
     * @param {string} direction
     * @param {Object} pos - The position object for the highlight.
     * @param {number} pos.start - The start offset.
     * @param {number} pos.end - The end offset.
     * @returns {Object}
     */
    async calculateHighlights(recipeConfig, direction, pos) {
        const recipe = new Recipe(recipeConfig);
        const highlights = await recipe.generateHighlightList();

        if (!highlights) return false;

        for (let i = 0; i < highlights.length; i++) {
            // Remove multiple highlights before processing again
            pos = [pos[0]];

            const func = direction === "forward" ? highlights[i].f : highlights[i].b;

            if (typeof func == "function") {
                try {
                    pos = func(pos, highlights[i].args);
                } catch (err) {
                    // Throw away highlighting errors
                    pos = [];
                }
            }
        }

        return {
            pos: pos,
            direction: direction
        };
    }


    /**
     * Translates the dish to a specified type and returns it.
     *
     * @param {Dish} dish
     * @param {string} type
     * @returns {Dish}
     */
    async getDishAs(dish, type) {
        const newDish = new Dish(dish);
        return await newDish.get(type);
    }

    /**
     * Gets the title of a dish and returns it
     *
     * @param {Dish} dish
     * @param {number} [maxLength=100]
     * @returns {string}
     */
    async getDishTitle(dish, maxLength=100) {
        const newDish = new Dish(dish);
        return await newDish.getTitle(maxLength);
    }

}

export default Chef;
