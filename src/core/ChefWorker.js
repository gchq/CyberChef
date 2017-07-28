/**
 * Web Worker to handle communications between the front-end and the core.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import "babel-polyfill";
import Chef from "./Chef.js";

// Set up Chef instance
self.chef = new Chef();

// Tell the app that the worker has loaded and is ready to operate
self.postMessage({
    action: "workerLoaded",
    data: {}
});

/**
 * Respond to message from parent thread.
 *
 * Messages should have the following format:
 * {
 *     action: "bake" | "silentBake",
 *     data: {
 *         input: {string},
 *         recipeConfig: {[Object]},
 *         options: {Object},
 *         progress: {number},
 *         step: {boolean}
 *     } | undefined
 * }
 */
self.addEventListener("message", function(e) {
    // Handle message
    switch (e.data.action) {
        case "bake":
            bake(e.data.data);
            break;
        case "silentBake":
            silentBake(e.data.data);
            break;
        default:
            break;
    }
});


/**
 * Baking handler
 */
async function bake(data) {
    try {
        const response = await self.chef.bake(
            data.input,          // The user's input
            data.recipeConfig,   // The configuration of the recipe
            data.options,        // Options set by the user
            data.progress,       // The current position in the recipe
            data.step            // Whether or not to take one step or execute the whole recipe
        );

        self.postMessage({
            action: "bakeSuccess",
            data: response
        });
    } catch (err) {
        self.postMessage({
            action: "bakeError",
            data: err
        });
    }
}


/**
 * Silent baking handler
 */
function silentBake(data) {
    const duration = self.chef.silentBake(data.recipeConfig);

    self.postMessage({
        action: "silentBakeComplete",
        data: duration
    });
}
