/**
 * Web Worker to handle communications between the front-end and the core.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import "babel-polyfill";
import Chef from "./Chef.js";
import OperationConfig from "./config/MetaConfig.js";
import OpModules from "./config/modules/Default.js";


// Set up Chef instance
self.chef = new Chef();

self.OpModules = OpModules;
self.OperationConfig = OperationConfig;

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
    const r = e.data;
    switch (r.action) {
        case "bake":
            bake(r.data);
            break;
        case "silentBake":
            silentBake(r.data);
            break;
        case "docURL":
            // Used to set the URL of the current document so that scripts can be
            // imported into an inline worker.
            self.docURL = r.data;
            break;
        case "highlight":
            calculateHighlights(
                r.data.recipeConfig,
                r.data.direction,
                r.data.pos
            );
            break;
        default:
            break;
    }
});


/**
 * Baking handler
 *
 * @param {Object} data
 */
async function bake(data) {
    // Ensure the relevant modules are loaded
    loadRequiredModules(data.recipeConfig);

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
            data: err.message
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


/**
 * Checks that all required modules are loaded and loads them if not.
 *
 * @param {Object} recipeConfig
 */
function loadRequiredModules(recipeConfig) {
    recipeConfig.forEach(op => {
        let module = self.OperationConfig[op.op].module;

        if (!OpModules.hasOwnProperty(module)) {
            console.log("Loading module " + module);
            self.sendStatusMessage("Loading module " + module);
            self.importScripts(self.docURL + "/" + module + ".js");
        }
    });
}


/**
 * Calculates highlight offsets if possible.
 *
 * @param {Object[]} recipeConfig
 * @param {string} direction
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
function calculateHighlights(recipeConfig, direction, pos) {
    pos = self.chef.calculateHighlights(recipeConfig, direction, pos);

    self.postMessage({
        action: "highlightsCalculated",
        data: pos
    });
}


/**
 * Send status update to the app.
 *
 * @param {string} msg
 */
self.sendStatusMessage = function(msg) {
    self.postMessage({
        action: "statusMessage",
        data: msg
    });
};


/**
 * Send an option value update to the app.
 *
 * @param {string} option
 * @param {*} value
 */
self.setOption = function(option, value) {
    self.postMessage({
        action: "optionUpdate",
        data: {
            option: option,
            value: value
        }
    });
};
