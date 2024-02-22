/**
 * Web Worker to handle communications between the front-end and the core.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Chef from "./Chef.mjs";
import OperationConfig from "./config/OperationConfig.json" assert {type: "json"};
import OpModules from "./config/modules/OpModules.mjs";
import loglevelMessagePrefix from "loglevel-message-prefix";


// Set up Chef instance
self.chef = new Chef();

self.OpModules = OpModules;
self.OperationConfig = OperationConfig;
self.inputNum = -1;


// Tell the app that the worker has loaded and is ready to operate
self.postMessage({
    action: "workerLoaded",
    data: {}
});

/**
 * Respond to message from parent thread.
 *
 * inputNum is optional and only used for baking multiple inputs.
 * Defaults to -1 when one isn't sent with the bake message.
 *
 * Messages should have the following format:
 * {
 *     action: "bake" | "silentBake",
 *     data: {
 *         input: {string},
 *         recipeConfig: {[Object]},
 *         options: {Object},
 *         progress: {number},
 *         step: {boolean},
 *         [inputNum=-1]: {number}
 *     }
 * }
 */
self.addEventListener("message", function(e) {
    // Handle message
    const r = e.data;
    log.debug(`Receiving command '${r.action}'`);

    switch (r.action) {
        case "bake":
            bake(r.data);
            break;
        case "silentBake":
            silentBake(r.data);
            break;
        case "getDishAs":
            getDishAs(r.data);
            break;
        case "getDishTitle":
            getDishTitle(r.data);
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
        case "setLogLevel":
            log.setLevel(r.data, false);
            break;
        case "setLogPrefix":
            loglevelMessagePrefix(log, {
                prefixes: [],
                staticPrefixes: [r.data]
            });
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
    self.loadRequiredModules(data.recipeConfig);
    try {
        self.inputNum = data.inputNum === undefined ? -1 : data.inputNum;
        const response = await self.chef.bake(
            data.input,          // The user's input
            data.recipeConfig,   // The configuration of the recipe
            data.options         // Options set by the user
        );

        const transferable = (response.dish.value instanceof ArrayBuffer) ?
            [response.dish.value] :
            undefined;

        self.postMessage({
            action: "bakeComplete",
            data: Object.assign(response, {
                id: data.id,
                inputNum: data.inputNum,
                bakeId: data.bakeId
            })
        }, transferable);

    } catch (err) {
        self.postMessage({
            action: "bakeError",
            data: {
                error: err.message || err,
                id: data.id,
                inputNum: data.inputNum
            }
        });
    }
    self.inputNum = -1;
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
 * Translates the dish to a given type.
 */
async function getDishAs(data) {
    const value = await self.chef.getDishAs(data.dish, data.type);
    const transferable = (data.type === "ArrayBuffer") ? [value] : undefined;
    self.postMessage({
        action: "dishReturned",
        data: {
            value: value,
            id: data.id
        }
    }, transferable);
}


/**
 * Gets the dish title
 *
 * @param {object} data
 * @param {Dish} data.dish
 * @param {number} data.maxLength
 * @param {number} data.id
 */
async function getDishTitle(data) {
    const title = await self.chef.getDishTitle(data.dish, data.maxLength);
    self.postMessage({
        action: "dishReturned",
        data: {
            value: title,
            id: data.id
        }
    });
}


/**
 * Calculates highlight offsets if possible.
 *
 * @param {Object[]} recipeConfig
 * @param {string} direction
 * @param {Object[]} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
async function calculateHighlights(recipeConfig, direction, pos) {
    pos = await self.chef.calculateHighlights(recipeConfig, direction, pos);

    self.postMessage({
        action: "highlightsCalculated",
        data: pos
    });
}


/**
 * Checks that all required modules are loaded and loads them if not.
 *
 * @param {Object} recipeConfig
 */
self.loadRequiredModules = function(recipeConfig) {
    recipeConfig.forEach(op => {
        const module = self.OperationConfig[op.op].module;

        if (!(module in OpModules)) {
            log.info(`Loading ${module} module`);
            self.sendStatusMessage(`Loading ${module} module`);
            self.importScripts(`${self.docURL}/modules/${module}.js`); // lgtm [js/client-side-unvalidated-url-redirection]
            self.sendStatusMessage("");
        }
    });
};


/**
 * Send status update to the app.
 *
 * @param {string} msg
 */
self.sendStatusMessage = function(msg) {
    self.postMessage({
        action: "statusMessage",
        data: {
            message: msg,
            inputNum: self.inputNum
        }
    });
};


/**
 * Send progress update to the app.
 *
 * @param {number} progress
 * @param {number} total
 */
self.sendProgressMessage = function(progress, total) {
    self.postMessage({
        action: "progressMessage",
        data: {
            progress: progress,
            total: total,
            inputNum: self.inputNum
        }
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


/**
 * Send register values back to the app.
 *
 * @param {number} opIndex
 * @param {number} numPrevRegisters
 * @param {string[]} registers
 */
self.setRegisters = function(opIndex, numPrevRegisters, registers) {
    self.postMessage({
        action: "setRegisters",
        data: {
            opIndex: opIndex,
            numPrevRegisters: numPrevRegisters,
            registers: registers
        }
    });
};
