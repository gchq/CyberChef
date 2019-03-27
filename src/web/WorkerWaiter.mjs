/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import ChefWorker from "worker-loader?inline&fallback=false!../core/ChefWorker";

/**
 * Waiter to handle conversations with the ChefWorker.
 */
class WorkerWaiter {

    /**
     * WorkerWaiter constructor.
     *
     * @param {App} app - The main view object for CyberChef
     * @param {Manager} manager - The CyberChef event manager.
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.callbacks = {};
        this.callbackID = 0;
        this.pendingInputs = [];
        this.runningWorkers = 0;
        this.chefWorkers = [];
        this.outputs = [];
    }

    /**
     * Sets up a pool of ChefWorkers to be used for baking
     */
    setupChefWorkers() {
        const threads = navigator.hardwareConcurrency || 4; // Default to 4

        for (let i = 0; i < threads; i++) {
            const newWorker = new ChefWorker();
            newWorker.addEventListener("message", this.handleChefMessage.bind(this));
            let docURL = document.location.href.split(/[#?]/)[0];
            const index = docURL.lastIndexOf("/");
            if (index > 0) {
                docURL = docURL.substring(0, index);
            }
            newWorker.postMessage({"action": "docURL", "data": docURL});
            newWorker.postMessage({"action": "inputNum", "data": 0});

            this.chefWorkers.push({
                worker: newWorker,
                inputNum: 0
            });
        }
    }


    /**
     * Handler for messages sent back by the ChefWorker.
     *
     * @param {MessageEvent} e
     */
    handleChefMessage(e) {
        const r = e.data;
        log.debug("Receiving '" + r.action + "' from ChefWorker");

        switch (r.action) {
            case "bakeComplete":
                this.runningWorkers -= 1;
                this.outputs.push({
                    data: r.data,
                    inputNum: r.data.inputNum
                });
                log.error(this.pendingInputs);
                if (this.pendingInputs.length > 0) {
                    log.debug("Bake complete. Baking next input");
                    this.bakeNextInput(r.data.inputNum);
                } else if (this.runningWorkers <= 0) {
                    this.recipeConfig = undefined;
                    this.options = undefined;
                    this.progress = undefined;
                    this.step = undefined;
                    this.bakingComplete();
                }
                break;
            case "bakeError":
                this.app.handleError(r.data);
                this.setBakingStatus(false);
                break;
            case "dishReturned":
                this.callbacks[r.data.id](r.data);
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
    }


    /**
     * Updates the UI to show if baking is in process or not.
     *
     * @param {bakingStatus}
     */
    setBakingStatus(bakingStatus) {
        this.app.baking = bakingStatus;

        this.manager.output.toggleLoader(bakingStatus);
    }


    /**
     * Calcels the current bake by terminating and removing all ChefWorkers,
     * and creating a new one
     */
    cancelBake() {
        for (let i = this.chefWorkers.length - 1; i >= 0; i--) {
            this.chefWorkers[i].worker.terminate();
            this.chefWorkers.pop();
        }
        this.setupChefWorkers();
        this.setBakingStatus(false);
        this.manager.controls.showStaleIndicator();
    }


    /**
     * Handler for completed bakes
     */
    bakingComplete() {
        this.setBakingStatus(false);

        if (this.pendingInputs.length !== 0) return;

        for (let i = 0; i < this.outputs.length; i++) {
            if (this.outputs[i].error) {
                this.app.handleError(this.outputs[i].error);
            }
        }

        this.app.progress = this.outputs[0].data.progress;
        this.app.dish = this.outputs[0].data.dish;
        this.manager.recipe.updateBreakpointIndicator(this.app.progress);
        this.manager.output.multiSet(this.outputs);
        log.debug("--- Bake complete ---");
    }

    /**
     * Handler for completed bakes
     *
     * @param {Object} response
     */
    bakingCompleteOld(response) {
        this.setBakingStatus(false);

        if (!response) return;

        if (response.error) {
            this.app.handleError(response.error);
        }

        this.app.progress = response.progress;
        this.app.dish = response.dish;
        this.manager.recipe.updateBreakpointIndicator(response.progress);
        this.manager.output.set(response.result, response.type, response.duration);
        log.debug("--- Bake complete ---");
    }

    /**
     * Asks the ChefWorker to bake the current input using the current recipe.
     *
     * @param {string | Array} input
     * @param {Object[]} recipeConfig
     * @param {Object} options
     * @param {number} progress
     * @param {boolean} step
     */
    bake(input, recipeConfig, options, progress, step) {
        this.setBakingStatus(true);

        this.recipeConfig = recipeConfig;
        this.options = options;
        this.progress = progress;
        this.step = step;
        this.outputs = [];

        if (typeof input === "string") {
            input = [{
                input: input,
                inputNum: 0
            }];
        }

        const initialInputs = input.slice(0, this.chefWorkers.length);
        this.pendingInputs = input.slice(this.chefWorkers.length, input.length);

        for (let i = 0; i < initialInputs.length; i++) {
            this.runningWorkers += 1;
            this.chefWorkers[i].inputNum = initialInputs[i].inputNum;
            this.chefWorkers[i].worker.postMessage({
                action: "bake",
                data: {
                    input: initialInputs[i].input,
                    recipeConfig: recipeConfig,
                    options: options,
                    progress: progress,
                    step: step,
                    inputNum: initialInputs[i].inputNum
                }
            });
        }
    }


    /**
     *
     * @param inputNum
     */
    bakeNextInput(inputNum) {
        this.runningWorkers += 1;
        const nextInput = this.pendingInputs.pop();
        for (let i = 0; i < this.chefWorkers.length; i++) {
            if (this.chefWorkers[i].inputNum === inputNum) {
                this.chefWorkers[i].inputNum = nextInput.inputNum;
                this.chefWorkers[i].worker.postMessage({
                    action: "bake",
                    data: {
                        input: nextInput.input,
                        recipeConfig: this.recipeConfig,
                        options: this.options,
                        progress: this.progress,
                        step: this.step,
                        inputNum: nextInput.inputNum
                    }
                });
            }
        }
    }


    /**
     * Asks the ChefWorker to run a silent bake, forcing the browser to load and cache all the relevant
     * JavaScript code needed to do a real bake.
     *
     * @param {Object[]} [recipeConfig]
     */
    silentBake(recipeConfig) {
        this.chefWorkers[0].worker.postMessage({
            action: "silentBake",
            data: {
                recipeConfig: recipeConfig
            }
        });
    }


    /**
     * Asks the ChefWorker to calculate highlight offsets if possible.
     *
     * @param {Object[]} recipeConfig
     * @param {string} direction
     * @param {Object} pos - The position object for the highlight.
     * @param {number} pos.start - The start offset.
     * @param {number} pos.end - The end offset.
     */
    highlight(recipeConfig, direction, pos) {
        this.chefWorkers[0].postMessage({
            action: "highlight",
            data: {
                recipeConfig: recipeConfig,
                direction: direction,
                pos: pos
            }
        });
    }


    /**
     * Asks the ChefWorker to return the dish as the specified type
     *
     * @param {Dish} dish
     * @param {string} type
     * @param {Function} callback
     */
    getDishAs(dish, type, callback) {
        const id = this.callbackID++;
        this.callbacks[id] = callback;
        this.chefWorkers[0].worker.postMessage({
            action: "getDishAs",
            data: {
                dish: dish,
                type: type,
                id: id
            }
        });
    }


    /**
     * Sets the console log level in the worker.
     *
     * @param {string} level
     */
    setLogLevel(level) {
        if (!this.chefWorkers || !this.chefWorkers.length > 0) return;

        for (let i = 0; i < this.chefWorkers.length; i++) {
            this.chefWorkers[i].worker.postMessage({
                action: "setLogLevel",
                data: log.getLevel()
            });
        }
    }
}


export default WorkerWaiter;
