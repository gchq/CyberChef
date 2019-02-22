/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import ChefWorker from "worker-loader?inline&fallback=false!../core/ChefWorker";

/**
 * Waiter to handle conversations with a ChefWorker in the background.
 */
class BackgroundWorkerWaiter {

    /**
     * BackgroundWorkerWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef.
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.callbacks = {};
        this.callbackID = 0;
        this.completedCallback = -1;
        this.timeout = null;
    }


    /**
     * Sets up the ChefWorker and associated listeners.
     */
    registerChefWorker() {
        log.debug("Registering new background ChefWorker");
        this.chefWorker = new ChefWorker();
        this.chefWorker.addEventListener("message", this.handleChefMessage.bind(this));

        let docURL = document.location.href.split(/[#?]/)[0];
        const index = docURL.lastIndexOf("/");
        if (index > 0) {
            docURL = docURL.substring(0, index);
        }
        this.chefWorker.postMessage({"action": "docURL", "data": docURL});
    }


    /**
     * Handler for messages sent back by the ChefWorker.
     *
     * @param {MessageEvent} e
     */
    handleChefMessage(e) {
        const r = e.data;
        log.debug("Receiving '" + r.action + "' from ChefWorker in the background");

        switch (r.action) {
            case "bakeComplete":
            case "bakeError":
                if (typeof r.data.id !== "undefined") {
                    clearTimeout(this.timeout);
                    this.callbacks[r.data.id].bind(this)(r.data);
                    this.completedCallback = r.data.id;
                }
                break;
            case "workerLoaded":
                log.debug("Background ChefWorker loaded");
                break;
            case "optionUpdate":
            case "statusMessage":
                // Ignore these messages
                break;
            default:
                log.error("Unrecognised message from background ChefWorker", e);
                break;
        }
    }


    /**
     * Cancels the current bake by terminating the ChefWorker and creating a new one.
     */
    cancelBake() {
        if (this.chefWorker)
            this.chefWorker.terminate();
        this.registerChefWorker();
    }


    /**
     * Asks the ChefWorker to bake the input using the specified recipe.
     *
     * @param {string} input
     * @param {Object[]} recipeConfig
     * @param {Object} options
     * @param {number} progress
     * @param {boolean} step
     * @param {Function} callback
     */
    bake(input, recipeConfig, options, progress, step, callback) {
        const id = this.callbackID++;
        this.callbacks[id] = callback;

        this.chefWorker.postMessage({
            action: "bake",
            data: {
                input: input,
                recipeConfig: recipeConfig,
                options: options,
                progress: progress,
                step: step,
                id: id
            }
        });
    }


    /**
     * Asks the Magic operation what it can do with the input data.
     *
     * @param {string|ArrayBuffer} input
     */
    magic(input) {
        // If we're still working on the previous bake, cancel it before starting a new one.
        if (this.completedCallback + 1 < this.callbackID) {
            clearTimeout(this.timeout);
            this.cancelBake();
        }

        this.bake(input, [
            {
                "op": "Magic",
                "args": [3, false, false]
            }
        ], {}, 0, false, this.magicComplete);

        // Cancel this bake if it takes too long.
        this.timeout = setTimeout(this.cancelBake.bind(this), 3000);
    }


    /**
     * Handler for completed Magic bakes.
     *
     * @param {Object} response
     */
    magicComplete(response) {
        log.debug("--- Background Magic Bake complete ---");
        if (!response || response.error) return;

        this.manager.output.backgroundMagicResult(response.dish.value);
    }

}


export default BackgroundWorkerWaiter;
