import Dish from "./Dish.js";
import Recipe from "./Recipe.js";


/**
 * The main controller for CyberChef.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @class
 */
var Chef = function() {
    this.dish = new Dish();
};


/**
 * Runs the recipe over the input.
 *
 * @param {string} inputText - The input data as a string
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
 * @returns {number} response.options - The app options object (which may have been changed)
 * @returns {number} response.duration - The number of ms it took to execute the recipe
 * @returns {number} response.error - The error object thrown by a failed operation (false if no error)
*/
Chef.prototype.bake = async function(inputText, recipeConfig, options, progress, step) {
    var startTime  = new Date().getTime(),
        recipe     = new Recipe(recipeConfig),
        containsFc = recipe.containsFlowControl(),
        error      = false;

    // Reset attemptHighlight flag
    if (options.hasOwnProperty("attemptHighlight")) {
        options.attemptHighlight = true;
    }

    if (containsFc) options.attemptHighlight = false;

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

    // If stepping with flow control, we have to start from the beginning
    // but still want to skip all previous breakpoints
    if (progress > 0 && containsFc) {
        recipe.removeBreaksUpTo(progress);
        progress = 0;
    }

    // If starting from scratch, load data
    if (progress === 0) {
        this.dish.set(inputText, Dish.STRING);
    }

    try {
        progress = await recipe.execute(this.dish, progress);
    } catch (err) {
        // Return the error in the result so that everything else gets correctly updated
        // rather than throwing it here and losing state info.
        error = err;
        progress = err.progress;
    }

    return {
        result: this.dish.type === Dish.HTML ?
            this.dish.get(Dish.HTML) :
            this.dish.get(Dish.STRING),
        type: Dish.enumLookup(this.dish.type),
        progress: progress,
        options: options,
        duration: new Date().getTime() - startTime,
        error: error
    };
};


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
Chef.prototype.silentBake = function(recipeConfig) {
    var startTime = new Date().getTime(),
        recipe    = new Recipe(recipeConfig),
        dish      = new Dish("", Dish.STRING);

    try {
        recipe.execute(dish);
    } catch (err) {
        // Suppress all errors
    }
    return new Date().getTime() - startTime;
};

export default Chef;
