/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Dish from "./Dish";
import Recipe from "./Recipe";
import log from "loglevel";

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
     * @param {Object} options - The options object storing various user choices
     * @param {boolean} options.attempHighlight - Whether or not to attempt highlighting
     * @param {number} progress - The position in the recipe to start from
     * @param {number} [step] - Whether to only execute one operation in the recipe
     *
     * @returns {Object} response
     * @returns {string} response.result - The output of the recipe
     * @returns {string} response.type - The data type of the result
     * @returns {number} response.progress - The position that we have got to in the recipe
     * @returns {number} response.duration - The number of ms it took to execute the recipe
     * @returns {number} response.error - The error object thrown by a failed operation (false if no error)
    */
    async bake(input, recipeConfig, options, progress, step) {
        log.debug("Chef baking");
        const startTime = new Date().getTime(),
            recipe      = new Recipe(recipeConfig),
            containsFc  = recipe.containsFlowControl(),
            notUTF8     = options && options.hasOwnProperty("treatAsUtf8") && !options.treatAsUtf8;
        let error = false;

        if (containsFc && ENVIRONMENT_IS_WORKER()) self.setOption("attemptHighlight", false);

        // Clean up progress
        if (progress >= recipeConfig.length) {
            progress = 0;
        }

        if (step) {
            // Unset breakpoint on this step
            recipe.setBreakpoint(progress, false);
            // Set breakpoint on next step
            recipe.setBreakpoint(progress + 1, true);
        }

        // If the previously run operation presented a different value to its
        // normal output, we need to recalculate it.
        if (recipe.lastOpPresented(progress)) {
            progress = 0;
        }

        // If stepping with flow control, we have to start from the beginning
        // but still want to skip all previous breakpoints
        if (progress > 0 && containsFc) {
            recipe.removeBreaksUpTo(progress);
            progress = 0;
        }

        // If starting from scratch, load data
        if (progress === 0) {
            const type = input instanceof ArrayBuffer ? Dish.ARRAY_BUFFER : Dish.STRING;
            this.dish.set(input, type);
        }

        try {
            progress = await recipe.execute(this.dish, progress);
        } catch (err) {
            log.error(err);
            error = {
                displayStr: err.displayStr,
            };
            progress = err.progress;
        }

        // Depending on the size of the output, we may send it back as a string or an ArrayBuffer.
        // This can prevent unnecessary casting as an ArrayBuffer can be easily downloaded as a file.
        // The threshold is specified in KiB.
        const threshold = (options.ioDisplayThreshold || 1024) * 1024;
        const returnType = this.dish.size > threshold ? Dish.ARRAY_BUFFER : Dish.STRING;

        // Create a raw version of the dish, unpresented
        const rawDish = this.dish.clone();

        // Present the raw result
        await recipe.present(this.dish);

        return {
            dish: rawDish,
            result: this.dish.type === Dish.HTML ?
                await this.dish.get(Dish.HTML, notUTF8) :
                await this.dish.get(returnType, notUTF8),
            type: Dish.enumLookup(this.dish.type),
            progress: progress,
            duration: new Date().getTime() - startTime,
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

        const startTime = new Date().getTime(),
            recipe = new Recipe(recipeConfig),
            dish = new Dish();

        try {
            recipe.execute(dish);
        } catch (err) {
            // Suppress all errors
        }
        return new Date().getTime() - startTime;
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
    calculateHighlights(recipeConfig, direction, pos) {
        const recipe = new Recipe(recipeConfig);
        const highlights = recipe.generateHighlightList();

        if (!highlights) return false;

        for (let i = 0; i < highlights.length; i++) {
            // Remove multiple highlights before processing again
            pos = [pos[0]];

            const func = direction === "forward" ? highlights[i].f : highlights[i].b;

            if (typeof func == "function") {
                pos = func(pos, highlights[i].args);
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

}

export default Chef;
