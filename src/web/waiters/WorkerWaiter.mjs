/**
 * @author n1474335 [n1474335@gmail.com]
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import ChefWorker from "worker-loader?inline&fallback=false!../../core/ChefWorker.js";
import DishWorker from "worker-loader?inline&fallback=false!../workers/DishWorker.mjs";
import { debounce } from "../../core/Utils.mjs";

/**
 * Waiter to handle conversations with the ChefWorker
 */
class WorkerWaiter {

    /**
     * WorkerWaiter constructor
     *
     * @param {App} app - The main view object for CyberChef
     * @param {Manager} manager - The CyberChef event manager
     */
    constructor(app, manager) {
        this.app = app;
        this.manager = manager;

        this.loaded = false;
        this.chefWorkers = [];
        this.inputs = [];
        this.inputNums = [];
        this.totalOutputs = 0;
        this.loadingOutputs = 0;
        this.bakeId = 0;
        this.callbacks = {};
        this.callbackID = 0;

        this.maxWorkers = 1;
        if (navigator.hardwareConcurrency !== undefined &&
            navigator.hardwareConcurrency > 1) {
            this.maxWorkers = navigator.hardwareConcurrency - 1;
        }

        // Store dishWorker action (getDishAs or getDishTitle)
        this.dishWorker = {
            worker: null,
            currentAction: ""
        };
        this.dishWorkerQueue = [];
    }

    /**
     * Terminates any existing ChefWorkers and sets up a new worker
     */
    setupChefWorker() {
        for (let i = this.chefWorkers.length - 1; i >= 0; i--) {
            this.removeChefWorker(this.chefWorkers[i]);
        }

        this.addChefWorker();
        this.setupDishWorker();
    }

    /**
     * Sets up a DishWorker to be used for performing Dish operations
     */
    setupDishWorker() {
        if (this.dishWorker.worker !== null) {
            this.dishWorker.worker.terminate();
            this.dishWorker.currentAction = "";
        }
        log.debug("Adding new DishWorker");

        this.dishWorker.worker = new DishWorker();
        this.dishWorker.worker.addEventListener("message", this.handleDishMessage.bind(this));

        if (this.dishWorkerQueue.length > 0) {
            this.postDishMessage(this.dishWorkerQueue.splice(0, 1)[0]);
        }
    }

    /**
     * Adds a new ChefWorker
     *
     * @returns {number} The index of the created worker
     */
    addChefWorker() {
        if (this.chefWorkers.length === this.maxWorkers) {
            // Can't create any more workers
            return -1;
        }

        log.debug("Adding new ChefWorker");

        // Create a new ChefWorker and send it the docURL
        const newWorker = new ChefWorker();
        newWorker.addEventListener("message", this.handleChefMessage.bind(this));
        let docURL = document.location.href.split(/[#?]/)[0];
        const index = docURL.lastIndexOf("/");
        if (index > 0) {
            docURL = docURL.substring(0, index);
        }

        newWorker.postMessage({"action": "docURL", "data": docURL});
        newWorker.postMessage({
            action: "setLogLevel",
            data: log.getLevel()
        });

        // Store the worker, whether or not it's active, and the inputNum as an object
        const newWorkerObj = {
            worker: newWorker,
            active: false,
            inputNum: -1
        };

        this.chefWorkers.push(newWorkerObj);
        return this.chefWorkers.indexOf(newWorkerObj);
    }

    /**
     * Gets an inactive ChefWorker to be used for baking
     *
     * @param {boolean} [setActive=true] - If true, set the worker status to active
     * @returns {number} - The index of the ChefWorker
     */
    getInactiveChefWorker(setActive=true) {
        for (let i = 0; i < this.chefWorkers.length; i++) {
            if (!this.chefWorkers[i].active) {
                this.chefWorkers[i].active = setActive;
                return i;
            }
        }
        return -1;
    }

    /**
     * Removes a ChefWorker
     *
     * @param {Object} workerObj
     */
    removeChefWorker(workerObj) {
        const index = this.chefWorkers.indexOf(workerObj);
        if (index === -1) {
            return;
        }

        if (this.chefWorkers.length > 1 || this.chefWorkers[index].active) {
            log.debug(`Removing ChefWorker at index ${index}`);
            this.chefWorkers[index].worker.terminate();
            this.chefWorkers.splice(index, 1);
        }

        // There should always be a ChefWorker loaded
        if (this.chefWorkers.length === 0) {
            this.addChefWorker();
        }
    }

    /**
     * Finds and returns the object for the ChefWorker of a given inputNum
     *
     * @param {number} inputNum
     */
    getChefWorker(inputNum) {
        for (let i = 0; i < this.chefWorkers.length; i++) {
            if (this.chefWorkers[i].inputNum === inputNum) {
                return this.chefWorkers[i];
            }
        }
    }

    /**
     * Handler for messages sent back by the ChefWorkers
     *
     * @param {MessageEvent} e
     */
    handleChefMessage(e) {
        const r = e.data;
        let inputNum = 0;
        log.debug(`Receiving ${r.action} from ChefWorker.`);

        if (Object.prototype.hasOwnProperty.call(r.data, "inputNum")) {
            inputNum = r.data.inputNum;
        }

        const currentWorker = this.getChefWorker(inputNum);

        switch (r.action) {
            case "bakeComplete":
                log.debug(`Bake ${inputNum} complete.`);

                if (r.data.error) {
                    this.app.handleError(r.data.error);
                    this.manager.output.updateOutputError(r.data.error, inputNum, r.data.progress);
                } else {
                    this.updateOutput(r.data, r.data.inputNum, r.data.bakeId, r.data.progress);
                }

                this.app.progress = r.data.progress;

                if (r.data.progress === this.recipeConfig.length) {
                    this.step = false;
                }

                this.workerFinished(currentWorker);
                break;
            case "bakeError":
                this.app.handleError(r.data.error);
                this.manager.output.updateOutputError(r.data.error, inputNum, r.data.progress);
                this.app.progress = r.data.progress;
                this.workerFinished(currentWorker);
                break;
            case "dishReturned":
                this.callbacks[r.data.id](r.data);
                break;
            case "silentBakeComplete":
                break;
            case "workerLoaded":
                this.app.workerLoaded = true;
                log.debug("ChefWorker loaded.");
                if (!this.loaded) {
                    this.app.loaded();
                    this.loaded = true;
                } else {
                    this.bakeNextInput(this.getInactiveChefWorker(false));
                }
                break;
            case "statusMessage":
                this.manager.output.updateOutputMessage(r.data.message, r.data.inputNum, true);
                break;
            case "progressMessage":
                this.manager.output.updateOutputProgress(r.data.progress, r.data.total, r.data.inputNum);
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
     * Update the value of an output
     *
     * @param {Object} data
     * @param {number} inputNum
     * @param {number} bakeId
     * @param {number} progress
     */
    updateOutput(data, inputNum, bakeId, progress) {
        this.manager.output.updateOutputBakeId(bakeId, inputNum);
        if (progress === this.recipeConfig.length) {
            progress = false;
        }
        this.manager.output.updateOutputProgress(progress, this.recipeConfig.length, inputNum);
        this.manager.output.updateOutputValue(data, inputNum, false);

        if (progress !== false) {
            this.manager.output.updateOutputStatus("error", inputNum);

            if (inputNum === this.manager.tabs.getActiveInputTab()) {
                this.manager.recipe.updateBreakpointIndicator(progress);
            }

        } else {
            this.manager.output.updateOutputStatus("baked", inputNum);
        }
    }

    /**
     * Updates the UI to show if baking is in progress or not.
     *
     * @param {boolean} bakingStatus
     */
    setBakingStatus(bakingStatus) {
        this.app.baking = bakingStatus;
        debounce(this.manager.controls.toggleBakeButtonFunction, 20, "toggleBakeButton", this, [bakingStatus ? "cancel" : "bake"])();

        if (bakingStatus) this.manager.output.hideMagicButton();
    }

    /**
     * Get the progress of the ChefWorkers
     */
    getBakeProgress() {
        const pendingInputs = this.inputNums.length + this.loadingOutputs + this.inputs.length;
        let bakingInputs = 0;

        for (let i = 0; i < this.chefWorkers.length; i++) {
            if (this.chefWorkers[i].active) {
                bakingInputs++;
            }
        }

        const total = this.totalOutputs;
        const bakedInputs = total - pendingInputs - bakingInputs;

        return {
            total: total,
            pending: pendingInputs,
            baking: bakingInputs,
            baked: bakedInputs
        };
    }

    /**
     * Cancels the current bake by terminating and removing all ChefWorkers
     *
     * @param {boolean} [silent=false] - If true, don't set the output
     * @param {boolean} killAll - If true, kills all chefWorkers regardless of status
     */
    cancelBake(silent, killAll) {
        for (let i = this.chefWorkers.length - 1; i >= 0; i--) {
            if (this.chefWorkers[i].active || killAll) {
                const inputNum = this.chefWorkers[i].inputNum;
                this.removeChefWorker(this.chefWorkers[i]);
                this.manager.output.updateOutputStatus("inactive", inputNum);
            }
        }
        this.setBakingStatus(false);

        for (let i = 0; i < this.inputs.length; i++) {
            this.manager.output.updateOutputStatus("inactive", this.inputs[i].inputNum);
        }

        for (let i = 0; i < this.inputNums.length; i++) {
            this.manager.output.updateOutputStatus("inactive", this.inputNums[i]);
        }

        const tabList = this.manager.tabs.getOutputTabList();
        for (let i = 0; i < tabList.length; i++) {
            this.manager.tabs.getOutputTabItem(tabList[i]).style.background = "";
        }

        this.inputs = [];
        this.inputNums = [];
        this.totalOutputs = 0;
        this.loadingOutputs = 0;
        if (!silent) this.manager.output.set(this.manager.tabs.getActiveOutputTab());
    }

    /**
     * Handle a worker completing baking
     *
     * @param {object} workerObj - Object containing the worker information
     * @param {ChefWorker} workerObj.worker - The actual worker object
     * @param {number} workerObj.inputNum - The inputNum of the input being baked by the worker
     * @param {boolean} workerObj.active - If true, the worker is currrently baking an input
     */
    workerFinished(workerObj) {
        const workerIdx = this.chefWorkers.indexOf(workerObj);
        this.chefWorkers[workerIdx].active = false;
        if (this.inputs.length > 0) {
            this.bakeNextInput(workerIdx);
        } else if (this.inputNums.length === 0 && this.loadingOutputs === 0) {
            // The ChefWorker is no longer needed
            log.debug("No more inputs to bake.");
            const progress = this.getBakeProgress();
            if (progress.total === progress.baked) {
                this.bakingComplete();
            }
        }
    }

    /**
     * Handler for completed bakes
     */
    bakingComplete() {
        this.setBakingStatus(false);
        let duration = new Date().getTime() - this.bakeStartTime;
        duration = duration.toLocaleString() + "ms";
        const progress = this.getBakeProgress();

        if (progress.total > 1) {
            let width = progress.total.toLocaleString().length;
            if (duration.length > width) {
                width = duration.length;
            }
            width = width < 2 ? 2 : width;

            const totalStr = progress.total.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            const durationStr = duration.padStart(width, " ").replace(/ /g, "&nbsp;");

            const inputNums = Object.keys(this.manager.output.outputs);
            let avgTime = 0,
                numOutputs = 0;
            for (let i = 0; i < inputNums.length; i++) {
                const output = this.manager.output.outputs[inputNums[i]];
                if (output.status === "baked") {
                    numOutputs++;
                    avgTime += output.data.duration;
                }
            }
            avgTime = Math.round(avgTime / numOutputs).toLocaleString() + "ms";
            avgTime = avgTime.padStart(width, " ").replace(/ /g, "&nbsp;");

            const msg = `total: ${totalStr}<br>time: ${durationStr}<br>average: ${avgTime}`;

            const bakeInfo = document.getElementById("bake-info");
            bakeInfo.innerHTML = msg;
            bakeInfo.style.display = "";
        } else {
            document.getElementById("bake-info").style.display = "none";
        }

        document.getElementById("bake").style.background = "";
        this.totalOutputs = 0; // Reset for next time
        log.debug("--- Bake complete ---");
    }

    /**
     * Bakes the next input and tells the inputWorker to load the next input
     *
     * @param {number} workerIdx - The index of the worker to bake with
     */
    bakeNextInput(workerIdx) {
        if (this.inputs.length === 0) return;
        if (workerIdx === -1) return;
        if (!this.chefWorkers[workerIdx]) return;
        this.chefWorkers[workerIdx].active = true;
        const nextInput = this.inputs.splice(0, 1)[0];
        if (typeof nextInput.inputNum === "string") nextInput.inputNum = parseInt(nextInput.inputNum, 10);

        log.debug(`Baking input ${nextInput.inputNum}.`);
        this.manager.output.updateOutputMessage(`Baking input ${nextInput.inputNum}...`, nextInput.inputNum, false);
        this.manager.output.updateOutputStatus("baking", nextInput.inputNum);

        this.chefWorkers[workerIdx].inputNum = nextInput.inputNum;
        const input = nextInput.input,
            recipeConfig = this.recipeConfig;

        if (this.step) {
            // Remove all breakpoints from the recipe up to progress
            if (nextInput.progress !== false) {
                for (let i = 0; i < nextInput.progress; i++) {
                    if ("breakpoint" in recipeConfig[i]) {
                        delete recipeConfig[i].breakpoint;
                    }
                }
            }

            // Set a breakpoint at the next operation so we stop baking there
            if (recipeConfig[this.app.progress]) recipeConfig[this.app.progress].breakpoint = true;
        }

        let transferable;
        if (input instanceof ArrayBuffer || ArrayBuffer.isView(input)) {
            transferable = [input];
        }
        this.chefWorkers[workerIdx].worker.postMessage({
            action: "bake",
            data: {
                input: input,
                recipeConfig: recipeConfig,
                options: this.options,
                inputNum: nextInput.inputNum,
                bakeId: this.bakeId
            }
        }, transferable);

        if (this.inputNums.length > 0) {
            this.manager.input.inputWorker.postMessage({
                action: "bakeNext",
                data: {
                    inputNum: this.inputNums.splice(0, 1)[0],
                    bakeId: this.bakeId
                }
            });
            this.loadingOutputs++;
        }
    }

    /**
     * Bakes the current input using the current recipe.
     *
     * @param {Object[]} recipeConfig
     * @param {Object} options
     * @param {number} progress
     * @param {boolean} step
     */
    bake(recipeConfig, options, progress, step) {
        this.setBakingStatus(true);
        this.manager.recipe.updateBreakpointIndicator(false);
        this.bakeStartTime = new Date().getTime();
        this.bakeId++;
        this.recipeConfig = recipeConfig;
        this.options = options;
        this.progress = progress;
        this.step = step;

        this.displayProgress();
    }

    /**
     * Queues an input ready to be baked
     *
     * @param {object} inputData
     * @param {string | ArrayBuffer} inputData.input
     * @param {number} inputData.inputNum
     * @param {number} inputData.bakeId
     */
    queueInput(inputData) {
        this.loadingOutputs--;
        if (this.app.baking && inputData.bakeId === this.bakeId) {
            this.inputs.push(inputData);
            this.bakeNextInput(this.getInactiveChefWorker(true));
        }
    }

    /**
     * Handles if an error is thrown by QueueInput
     *
     * @param {object} inputData
     * @param {number} inputData.inputNum
     * @param {number} inputData.bakeId
     */
    queueInputError(inputData) {
        this.loadingOutputs--;
        if (this.app.baking && inputData.bakeId === this.bakeId) {
            this.manager.output.updateOutputError("Error queueing the input for a bake.", inputData.inputNum, 0);

            if (this.inputNums.length === 0) return;

            // Load the next input
            this.manager.input.inputWorker.postMessage({
                action: "bakeNext",
                data: {
                    inputNum: this.inputNums.splice(0, 1)[0],
                    bakeId: this.bakeId
                }
            });
            this.loadingOutputs++;

        }
    }

    /**
     * Queues a list of inputNums to be baked by ChefWorkers, and begins baking
     *
     * @param {object} inputData
     * @param {number[]} inputData.nums - The inputNums to be queued for baking
     * @param {boolean} inputData.step - If true, only execute the next operation in the recipe
     * @param {number} inputData.progress - The current progress through the recipe. Used when stepping
     */
    async bakeAllInputs(inputData) {
        return await new Promise(resolve => {
            if (this.app.baking) return;
            const inputNums = inputData.nums;
            const step = inputData.step;

            // Use cancelBake to clear out the inputs
            this.cancelBake(true, false);

            this.inputNums = inputNums;
            this.totalOutputs = inputNums.length;
            this.app.progress = inputData.progress;

            let inactiveWorkers = 0;
            for (let i = 0; i < this.chefWorkers.length; i++) {
                if (!this.chefWorkers[i].active) {
                    inactiveWorkers++;
                }
            }

            for (let i = 0; i < inputNums.length - inactiveWorkers; i++) {
                if (this.addChefWorker() === -1) break;
            }

            this.app.bake(step);

            for (let i = 0; i < this.inputNums.length; i++) {
                this.manager.output.updateOutputMessage(`Input ${inputNums[i]} has not been baked yet.`, inputNums[i], false);
                this.manager.output.updateOutputStatus("pending", inputNums[i]);
            }

            let numBakes = this.chefWorkers.length;
            if (this.inputNums.length < numBakes) {
                numBakes = this.inputNums.length;
            }
            for (let i = 0; i < numBakes; i++) {
                this.manager.input.inputWorker.postMessage({
                    action: "bakeNext",
                    data: {
                        inputNum: this.inputNums.splice(0, 1)[0],
                        bakeId: this.bakeId
                    }
                });
                this.loadingOutputs++;
            }
        });
    }

    /**
     * Asks the ChefWorker to run a silent bake, forcing the browser to load and cache all the relevant
     * JavaScript code needed to do a real bake.
     *
     * @param {Object[]} [recipeConfig]
     */
    silentBake(recipeConfig) {
        // If there aren't any active ChefWorkers, try to add one
        let workerId = this.getInactiveChefWorker();
        if (workerId === -1) {
            workerId = this.addChefWorker();
        }
        if (workerId === -1) return;
        this.chefWorkers[workerId].worker.postMessage({
            action: "silentBake",
            data: {
                recipeConfig: recipeConfig
            }
        });
    }

    /**
     * Handler for messages sent back from DishWorker
     *
     * @param {MessageEvent} e
     */
    handleDishMessage(e) {
        const r = e.data;
        log.debug(`Receiving ${r.action} from DishWorker`);

        switch (r.action) {
            case "dishReturned":
                this.dishWorker.currentAction = "";
                this.callbacks[r.data.id](r.data);

                if (this.dishWorkerQueue.length > 0) {
                    this.postDishMessage(this.dishWorkerQueue.splice(0, 1)[0]);
                }

                break;
            default:
                log.error("Unrecognised message from DishWorker", e);
                break;
        }
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

        if (this.dishWorker.worker === null) this.setupDishWorker();
        this.postDishMessage({
            action: "getDishAs",
            data: {
                dish: dish,
                type: type,
                id: id
            }
        });
    }

    /**
     * Asks the ChefWorker to get the title of the dish
     *
     * @param {Dish} dish
     * @param {number} maxLength
     * @param {Function} callback
     * @returns {string}
     */
    getDishTitle(dish, maxLength, callback) {
        const id = this.callbackID++;

        this.callbacks[id] = callback;

        if (this.dishWorker.worker === null) this.setupDishWorker();

        this.postDishMessage({
            action: "getDishTitle",
            data: {
                dish: dish,
                maxLength: maxLength,
                id: id
            }
        });
    }

    /**
     * Queues a message to be sent to the dishWorker
     *
     * @param {object} message
     * @param {string} message.action
     * @param {object} message.data
     * @param {Dish} message.data.dish
     * @param {number} message.data.id
     */
    queueDishMessage(message) {
        if (message.action === "getDishAs") {
            this.dishWorkerQueue = [message].concat(this.dishWorkerQueue);
        } else {
            this.dishWorkerQueue.push(message);
        }
    }

    /**
     * Sends a message to the DishWorker
     *
     * @param {object} message
     * @param {string} message.action
     * @param {object} message.data
     */
    postDishMessage(message) {
        if (this.dishWorker.currentAction !== "") {
            this.queueDishMessage(message);
        } else {
            this.dishWorker.currentAction = message.action;
            this.dishWorker.worker.postMessage(message);
        }
    }

    /**
     * Sets the console log level in the workers.
     */
    setLogLevel() {
        for (let i = 0; i < this.chefWorkers.length; i++) {
            this.chefWorkers[i].worker.postMessage({
                action: "setLogLevel",
                data: log.getLevel()
            });
        }
    }

    /**
     * Display the bake progress in the output bar and bake button
     */
    displayProgress() {
        const progress = this.getBakeProgress();
        if (progress.total === progress.baked) return;

        const percentComplete = ((progress.pending + progress.baking) / progress.total) * 100;
        const bakeButton = document.getElementById("bake");
        if (this.app.baking) {
            if (percentComplete < 100) {
                bakeButton.style.background = `linear-gradient(to left, #fea79a ${percentComplete}%, #f44336 ${percentComplete}%)`;
            } else {
                bakeButton.style.background = "";
            }
        } else {
            // not baking
            bakeButton.style.background = "";
        }

        const bakeInfo = document.getElementById("bake-info");
        if (progress.total > 1) {
            let width = progress.total.toLocaleString().length;
            width = width < 2 ? 2 : width;

            const totalStr = progress.total.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            const bakedStr = progress.baked.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            const pendingStr = progress.pending.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");
            const bakingStr = progress.baking.toLocaleString().padStart(width, " ").replace(/ /g, "&nbsp;");

            let msg = "total: " + totalStr;
            msg += "<br>baked: " + bakedStr;

            if (progress.pending > 0) {
                msg += "<br>pending: " + pendingStr;
            } else if (progress.baking > 0) {
                msg += "<br>baking: " + bakingStr;
            }
            bakeInfo.innerHTML = msg;
            bakeInfo.style.display = "";
        } else {
            bakeInfo.style.display = "none";
        }

        if (progress.total !== progress.baked) {
            setTimeout(function() {
                this.displayProgress();
            }.bind(this), 100);
        }

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
        let workerIdx = this.getInactiveChefWorker(false);
        if (workerIdx === -1) {
            workerIdx = this.addChefWorker();
        }
        if (workerIdx === -1) return;
        this.chefWorkers[workerIdx].worker.postMessage({
            action: "highlight",
            data: {
                recipeConfig: recipeConfig,
                direction: direction,
                pos: pos
            }
        });
    }
}

export default WorkerWaiter;
