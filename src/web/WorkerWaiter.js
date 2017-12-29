import ChefWorker from "worker-loader?inline&fallback=false!../core/ChefWorker.js";

/**
 * Waiter to handle conversations with the ChefWorker.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @constructor
 * @param {App} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
const WorkerWaiter = function(app, manager) {
    this.app = app;
    this.manager = manager;
};


/**
 * Sets up the ChefWorker and associated listeners.
 */
WorkerWaiter.prototype.registerChefWorker = function() {
    log.debug("Registering new ChefWorker");
    this.chefWorker = new ChefWorker();
    this.chefWorker.addEventListener("message", this.handleChefMessage.bind(this));
    this.setLogLevel();

    let docURL = document.location.href.split(/[#?]/)[0];
    const index = docURL.lastIndexOf("/");
    if (index > 0) {
        docURL = docURL.substring(0, index);
    }
    this.chefWorker.postMessage({"action": "docURL", "data": docURL});
};


/**
 * Handler for messages sent back by the ChefWorker.
 *
 * @param {MessageEvent} e
 */
WorkerWaiter.prototype.handleChefMessage = function(e) {
    const r = e.data;
    log.debug("Receiving '" + r.action + "' from ChefWorker");

    switch (r.action) {
        case "bakeComplete":
            this.bakingComplete(r.data);
            break;
        case "bakeError":
            this.app.handleError(r.data);
            this.setBakingStatus(false);
            break;
        case "silentBakeComplete":
            break;
        case "workerLoaded":
            this.app.workerLoaded = true;
            log.debug("ChefWorker loaded");
            this.app.loaded();
            break;
        case "statusMessage":
            this.manager.output.setStatusMsg(r.data);
            break;
        case "optionUpdate":
            log.debug(`Setting ${r.data.option} to ${r.data.value}`);
            this.app.options[r.data.option] = r.data.value;
            break;
        case "setRegisters":
            this.manager.recipe.setRegisters(r.data.opIndex, r.data.numPrevRegisters, r.data.registers);
            break;
        case "highlightsCalculated":
            this.manager.highlighter.displayHighlights(r.data.pos, r.data.direction);
            break;
        default:
            log.error("Unrecognised message from ChefWorker", e);
            break;
    }
};


/**
 * Updates the UI to show if baking is in process or not.
 *
 * @param {bakingStatus}
 */
WorkerWaiter.prototype.setBakingStatus = function(bakingStatus) {
    this.app.baking = bakingStatus;

    this.manager.output.toggleLoader(bakingStatus);
};


/**
 * Cancels the current bake by terminating the ChefWorker and creating a new one.
 */
WorkerWaiter.prototype.cancelBake = function() {
    this.chefWorker.terminate();
    this.registerChefWorker();
    this.setBakingStatus(false);
    this.manager.controls.showStaleIndicator();
};


/**
 * Handler for completed bakes.
 *
 * @param {Object} response
 */
WorkerWaiter.prototype.bakingComplete = function(response) {
    this.setBakingStatus(false);

    if (!response) return;

    if (response.error) {
        this.app.handleError(response.error);
    }

    this.app.progress = response.progress;
    this.manager.recipe.updateBreakpointIndicator(response.progress);
    this.manager.output.set(response.result, response.type, response.duration);
    log.debug("--- Bake complete ---");
};


/**
 * Asks the ChefWorker to bake the current input using the current recipe.
 *
 * @param {string} input
 * @param {Object[]} recipeConfig
 * @param {Object} options
 * @param {number} progress
 * @param {boolean} step
 */
WorkerWaiter.prototype.bake = function(input, recipeConfig, options, progress, step) {
    this.setBakingStatus(true);

    this.chefWorker.postMessage({
        action: "bake",
        data: {
            input: input,
            recipeConfig: recipeConfig,
            options: options,
            progress: progress,
            step: step
        }
    });
};


/**
 * Asks the ChefWorker to run a silent bake, forcing the browser to load and cache all the relevant
 * JavaScript code needed to do a real bake.
 *
 * @param {Object[]} [recipeConfig]
 */
WorkerWaiter.prototype.silentBake = function(recipeConfig) {
    this.chefWorker.postMessage({
        action: "silentBake",
        data: {
            recipeConfig: recipeConfig
        }
    });
};


/**
 * Asks the ChefWorker to calculate highlight offsets if possible.
 *
 * @param {Object[]} recipeConfig
 * @param {string} direction
 * @param {Object} pos - The position object for the highlight.
 * @param {number} pos.start - The start offset.
 * @param {number} pos.end - The end offset.
 */
WorkerWaiter.prototype.highlight = function(recipeConfig, direction, pos) {
    this.chefWorker.postMessage({
        action: "highlight",
        data: {
            recipeConfig: recipeConfig,
            direction: direction,
            pos: pos
        }
    });
};


/**
 * Sets the console log level in the worker.
 *
 * @param {string} level
 */
WorkerWaiter.prototype.setLogLevel = function(level) {
    if (!this.chefWorker) return;

    this.chefWorker.postMessage({
        action: "setLogLevel",
        data: log.getLevel()
    });
};


export default WorkerWaiter;
