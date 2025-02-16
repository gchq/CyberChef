/**
 * Web worker to handle the inputs.
 * Handles storage, modification and retrieval of the inputs.
 *
 * @author j433866 [j433866@gmail.com]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Utils from "../../core/Utils.mjs";
import loglevelMessagePrefix from "loglevel-message-prefix";

loglevelMessagePrefix(log, {
    prefixes: [],
    staticPrefixes: ["InputWorker"]
});

// Default max values
// These will be correctly calculated automatically
self.maxWorkers = 4;
self.maxTabs = 1;

/**
 * Dictionary of inputs keyed on the inputNum
 * Each entry is an object with the following type:
 * @typedef {Object} Input
 * @property {string} type
 * @property {ArrayBuffer} buffer
 * @property {string} stringSample
 * @property {Object} file
 *     @property {string} file.name
 *     @property {number} file.size
 *     @property {string} file.type
 * @property {string} status
 * @property {number} progress
 * @property {number} encoding
 * @property {string} eolSequence
 */
self.inputs = {};
self.loaderWorkers = [];
self.pendingFiles = [];
self.currentInputNum = 1;
self.numInputs = 0;
self.pendingInputs = 0;
self.loadingInputs = 0;

/**
 * Respond to message from parent thread.
 *
 * @param {MessageEvent} e
 */
self.addEventListener("message", function(e) {
    const r = e.data;
    if (!("action" in r)) {
        log.error("No action");
        return;
    }

    log.debug(`Receiving command '${r.action}'`);

    switch (r.action) {
        case "loadUIFiles":
            self.loadFiles(r.data);
            break;
        case "loaderWorkerReady":
            self.loaderWorkerReady(r.data);
            break;
        case "updateMaxWorkers":
            self.maxWorkers = r.data;
            break;
        case "updateMaxTabs":
            self.updateMaxTabs(r.data.maxTabs, r.data.activeTab);
            break;
        case "updateInputValue":
            self.updateInputValue(r.data);
            break;
        case "updateInputProgress":
            self.updateInputProgress(r.data);
            break;
        case "bakeAll":
            self.bakeAllInputs();
            break;
        case "bakeNext":
            self.bakeInput(r.data.inputNum, r.data.bakeId);
            break;
        case "getLoadProgress":
            self.getLoadProgress(r.data);
            break;
        case "setInput":
            self.setInput(r.data);
            break;
        case "setLogLevel":
            log.setLevel(r.data, false);
            break;
        case "addInput":
            self.addInput(r.data, "userinput");
            break;
        case "refreshTabs":
            self.refreshTabs(r.data.inputNum, r.data.direction);
            break;
        case "removeInput":
            self.removeInput(r.data);
            break;
        case "changeTabRight":
            self.changeTabRight(r.data.activeTab);
            break;
        case "changeTabLeft":
            self.changeTabLeft(r.data.activeTab);
            break;
        case "autobake":
            self.autoBake(r.data.activeTab, 0, false);
            break;
        case "filterTabs":
            self.filterTabs(r.data);
            break;
        case "loaderWorkerMessage":
            self.handleLoaderMessage(r.data);
            break;
        case "updateTabHeader":
            self.updateTabHeader(r.data);
            break;
        case "step":
            self.autoBake(r.data.activeTab, r.data.progress, true);
            break;
        case "getInput":
            self.getInput(r.data);
            break;
        case "getInputNums":
            self.getInputNums(r.data);
            break;
        default:
            log.error(`Unknown action '${r.action}'.`);
    }
});

/**
 * Gets the load progress of the input files, and the
 * load progress for the input given in inputNum
 *
 * @param {number} inputNum - The input to get the file loading progress for
 */
self.getLoadProgress = function(inputNum) {
    const total = self.numInputs;
    const pending = self.pendingFiles.length;
    const loading = self.loadingInputs;
    const loaded = total - pending - loading;

    self.postMessage({
        action: "loadingInfo",
        data: {
            pending: pending,
            loading: loading,
            loaded: loaded,
            total: total,
            activeProgress: {
                inputNum: inputNum,
                progress: self.getInputProgress(inputNum)
            }
        }
    });
};

/**
 * Fired when an autobake is initiated.
 * Queues the active input and sends a bake command.
 *
 * @param {number} inputNum - The input to be baked
 * @param {number} progress - The current progress of the bake through the recipe
 * @param {boolean} [step=false] - Set to true if we should only execute one operation instead of the
 * whole recipe
 */
self.autoBake = function(inputNum, progress, step=false) {
    const input = self.inputs[inputNum];
    if (input) {
        self.postMessage({
            action: "bakeInputs",
            data: {
                nums: [parseInt(inputNum, 10)],
                step: step,
                progress: progress
            }
        });
    }
};

/**
 * Fired when we want to bake all inputs (bake button clicked)
 * Sends a list of inputNums to the workerwaiter
 */
self.bakeAllInputs = function() {
    const inputNums = Object.keys(self.inputs);

    const nums = inputNums
        .filter(n => self.inputs[n].status === "loaded")
        .map(n => parseInt(n, 10));

    self.postMessage({
        action: "bakeInputs",
        data: {
            nums: nums,
            step: false,
            progress: 0
        }
    });
};

/**
 * Gets the data for the provided inputNum and sends it to the WorkerWaiter
 *
 * @param {number} inputNum
 * @param {number} bakeId
 */
self.bakeInput = function(inputNum, bakeId) {
    const inputObj = self.inputs[inputNum];
    if (inputObj === null ||
        inputObj === undefined ||
        inputObj.status !== "loaded") {

        self.postMessage({
            action: "queueInputError",
            data: {
                inputNum: inputNum,
                bakeId: bakeId
            }
        });
        return;
    }

    self.postMessage({
        action: "queueInput",
        data: {
            input: inputObj.buffer,
            inputNum: inputNum,
            bakeId: bakeId
        }
    });
};

/**
 * Gets the stored value or object for a specific inputNum and sends it to the inputWaiter.
 *
 * @param {object} inputData - Object containing data about the input to retrieve
 * @param {number} inputData.inputNum - The inputNum of the input to get
 * @param {boolean} inputData.getObj - If true, returns the entire input object instead of just the value
 * @param {number} inputData.id - The callback ID for the callback to run when returned to the inputWaiter
 */
self.getInput = function(inputData) {
    const input = self.inputs[inputData.inputNum];
    self.postMessage({
        action: "getInput",
        data: {
            data: inputData.getObj ? input : input.buffer,
            id: inputData.id
        }
    });
};

/**
 * Gets a list of the stored inputNums, along with the minimum and maximum
 *
 * @param {number} id - The callback ID to be executed when returned to the inputWaiter
 */
self.getInputNums = function(id) {
    const inputNums = Object.keys(self.inputs),
        min = self.getSmallestInputNum(inputNums),
        max = self.getLargestInputNum(inputNums);

    self.postMessage({
        action: "getInputNums",
        data: {
            inputNums: inputNums,
            min: min,
            max: max,
            id: id
        }
    });
};

/**
 * Gets the load progress for a specific inputNum
 *
 * @param {number} inputNum - The input we want to get the progress of
 * @returns {number | string} - Returns "error" if there was a load error
 */
self.getInputProgress = function(inputNum) {
    const inputObj = self.inputs[inputNum];
    if (!inputObj) return;
    if (inputObj.status === "error") {
        return "error";
    }
    return inputObj.progress;
};

/**
 * Gets the largest inputNum of all the inputs
 *
 * @param {string[]} inputNums - The numbers to find the largest of
 * @returns {number}
 */
self.getLargestInputNum = function(inputNums) {
    return inputNums.reduce((acc, val) => {
        val = parseInt(val, 10);
        return val > acc ? val : acc;
    }, -1);
};

/**
 * Gets the smallest inputNum of all the inputs
 *
 * @param {string[]} inputNums - The numbers to find the smallest of
 * @returns {number}
 */
self.getSmallestInputNum = function(inputNums) {
    const min = inputNums.reduce((acc, val) => {
        val = parseInt(val, 10);
        return val < acc ? val : acc;
    }, Number.MAX_SAFE_INTEGER);

    // Assume we don't have this many tabs!
    if (min === Number.MAX_SAFE_INTEGER) return -1;

    return min;
};

/**
 * Gets the next smallest inputNum
 *
 * @param {number} inputNum - The current input number
 * @returns {number}
 */
self.getPreviousInputNum = function(inputNum) {
    const inputNums = Object.keys(self.inputs);
    if (inputNums.length === 0) return -1;

    return inputNums.reduce((acc, val) => {
        val = parseInt(val, 10);
        return (val < inputNum && val > acc) ? val : acc;
    }, self.getSmallestInputNum(inputNums));
};

/**
 * Gets the next largest inputNum
 *
 * @param {number} inputNum - The current input number
 * @returns {number}
 */
self.getNextInputNum = function(inputNum) {
    const inputNums = Object.keys(self.inputs);

    return inputNums.reduce((acc, val) => {
        val = parseInt(val, 10);
        return (val > inputNum && val < acc) ? val : acc;
    }, self.getLargestInputNum(inputNums));
};

/**
 * Gets a list of inputNums starting from the provided inputNum.
 * If direction is "left", gets the inputNums higher than the provided number.
 * If direction is "right", gets the inputNums lower than the provided number.
 * @param {number} inputNum - The inputNum we want to get the neighbours of
 * @param {string} direction - Either "left" or "right". Determines which direction we search for nearby numbers in
 * @returns {number[]}
 */
self.getNearbyNums = function(inputNum, direction) {
    const nums = [];
    for (let i = 0; i < self.maxTabs; i++) {
        let newNum;
        if (i === 0 && self.inputs[inputNum] !== undefined) {
            newNum = inputNum;
        } else {
            switch (direction) {
                case "left":
                    newNum = self.getNextInputNum(nums[i - 1]);
                    if (newNum === nums[i - 1]) {
                        direction = "right";
                        newNum = self.getPreviousInputNum(nums[0]);
                    }
                    break;
                case "right":
                    newNum = self.getPreviousInputNum(nums[i - 1]);
                    if (newNum === nums[i - 1]) {
                        direction = "left";
                        newNum = self.getNextInputNum(nums[0]);
                    }
            }
        }
        if (!nums.includes(newNum) && (newNum > 0)) {
            nums.push(newNum);
        }
    }
    nums.sort(function(a, b) {
        return a - b;
    });
    return nums;
};

/**
 * Gets the data to display in the tab header for an input, and
 * posts it back to the inputWaiter
 *
 * @param {number} inputNum - The inputNum of the tab header
 */
self.updateTabHeader = function(inputNum) {
    const input = self.inputs[inputNum];
    if (!input) return;

    let header = input.type === "file" ? input.file.name : input.stringSample;
    header = header.slice(0, 100).replace(/[\n\r\u2028\u2029]/g, "");

    self.postMessage({
        action: "updateTabHeader",
        data: {
            inputNum: inputNum,
            input: header
        }
    });
};

/**
 * Gets the input for a specific inputNum, and posts it to the inputWaiter
 * so that it can be displayed in the input area
 *
 * @param {object} inputData
 * @param {number} inputData.inputNum - The input to get the data for
 * @param {boolean} inputData.silent - If false, the manager statechange event will be fired
 */
self.setInput = function(inputData) {
    const {inputNum, silent} = inputData;
    const input = self.inputs[inputNum];
    if (!input) return;

    self.postMessage({
        action: "setInput",
        data: {
            inputNum: inputNum,
            inputObj: input,
            silent: silent
        }
    });

    self.updateTabHeader(inputNum);
};

/**
 * Gets the nearby inputNums to the provided number, and posts them
 * to the inputWaiter to be displayed on the page.
 *
 * @param {number} inputNum - The inputNum to find the nearby numbers for
 * @param {string} direction - The direction to search for inputNums in. Either "left" or "right"
 */
self.refreshTabs = function(inputNum, direction) {
    const nums = self.getNearbyNums(inputNum, direction),
        inputNums = Object.keys(self.inputs),
        tabsLeft = (self.getSmallestInputNum(inputNums) !== nums[0] && nums.length > 0),
        tabsRight = (self.getLargestInputNum(inputNums) !== nums[nums.length - 1] && nums.length > 0);

    self.postMessage({
        action: "refreshTabs",
        data: {
            nums: nums,
            activeTab: (nums.includes(inputNum)) ? inputNum : self.getNextInputNum(inputNum),
            tabsLeft: tabsLeft,
            tabsRight: tabsRight
        }
    });

    // Update the tab headers for the new tabs
    for (let i = 0; i < nums.length; i++) {
        self.updateTabHeader(nums[i]);
    }
};

/**
 * Update the stored status for an input
 *
 * @param {number} inputNum - The input that's having its status changed
 * @param {string} status - The status of the input
 */
self.updateInputStatus = function(inputNum, status) {
    if (self.inputs[inputNum] !== undefined) {
        self.inputs[inputNum].status = status;
    }
};

/**
 * Update the stored load progress of an input
 *
 * @param {object} inputData
 * @param {number} inputData.inputNum - The input that's having its progress updated
 * @param {number} inputData.progress - The load progress of the input
 */
self.updateInputProgress = function(inputData) {
    const {inputNum, progress} = inputData;

    if (self.inputs[inputNum] !== undefined) {
        self.inputs[inputNum].progress = progress;
    }
};

/**
 * Update the stored value of an input.
 *
 * @param {object} inputData
 * @param {number} inputData.inputNum - The input that's having its value updated
 * @param {ArrayBuffer} inputData.buffer - The new value of the input as a buffer
 * @param {number} [inputData.encoding] - The character encoding of the input data
 * @param {string} [inputData.eolSequence] - The end of line sequence of the input data
 * @param {string} [inputData.stringSample] - A sample of the value as a string (truncated to 4096 chars)
 */
self.updateInputValue = function(inputData) {
    const inputNum = parseInt(inputData.inputNum, 10);
    if (inputNum < 1) return;

    if (!Object.prototype.hasOwnProperty.call(self.inputs, inputNum))
        throw new Error(`No input with ID ${inputNum} exists`);

    self.inputs[inputNum].buffer = inputData.buffer;
    if ("encoding" in inputData) {
        self.inputs[inputNum].encoding = inputData.encoding;
    }
    if ("eolSequence" in inputData) {
        self.inputs[inputNum].eolSequence = inputData.eolSequence;
    }
    if (!("stringSample" in inputData)) {
        inputData.stringSample = Utils.arrayBufferToStr(inputData.buffer.slice(0, 4096));
    }
    self.inputs[inputNum].stringSample = inputData.stringSample;
    self.inputs[inputNum].status = "loaded";
    self.inputs[inputNum].progress = 100;
};

/**
 * Get the index of a loader worker object.
 * Returns -1 if the worker could not be found
 *
 * @param {number} workerId - The ID of the worker we're searching for
 * @returns {number}
 */
self.getLoaderWorkerIdx = function(workerId) {
    for (let i = 0; i < self.loaderWorkers.length; i++) {
        if (self.loaderWorkers[i].id === workerId) {
            return i;
        }
    }
    return -1;
};

/**
 * Fires when a loaderWorker is ready to load files.
 * Stores data about the new loaderWorker in the loaderWorkers array,
 * and sends the next file to the loaderWorker to be loaded.
 *
 * @param {object} workerData
 * @param {number} workerData.id - The ID of the new loaderWorker
 */
self.loaderWorkerReady = function(workerData) {
    const newWorkerObj = {
        id: workerData.id,
        inputNum: -1,
        active: true
    };
    self.loaderWorkers.push(newWorkerObj);
    self.loadNextFile(self.loaderWorkers.indexOf(newWorkerObj));
};

/**
 * Handler for messages sent by loaderWorkers.
 * (Messages are sent between the inputWorker and loaderWorkers via the main thread)
 *
 * @param {object} r - The data sent by the loaderWorker
 * @param {number} r.inputNum - The inputNum which the message corresponds to
 * @param {string} r.error - Present if an error is fired by the loaderWorker. Contains the error message string.
 * @param {ArrayBuffer} r.fileBuffer - Present if a file has finished loading. Contains the loaded file buffer.
 */
self.handleLoaderMessage = function(r) {
    let inputNum = 0;

    if ("inputNum" in r) {
        inputNum = r.inputNum;
    }

    if ("error" in r) {
        self.updateInputProgress(r.inputNum, 0);
        self.updateInputStatus(r.inputNum, "error");

        log.error(r.error);
        self.loadingInputs--;

        self.terminateLoaderWorker(r.id);
        self.activateLoaderWorker();

        self.setInput({inputNum: inputNum, silent: true});
        return;
    }

    if ("fileBuffer" in r) {
        log.debug(`Input file ${inputNum} loaded.`);
        self.loadingInputs--;

        self.updateInputValue({
            inputNum: inputNum,
            buffer: r.fileBuffer
        });

        self.postMessage({
            action: "fileLoaded",
            data: {
                inputNum: inputNum
            }
        });

        const idx = self.getLoaderWorkerIdx(r.id);
        self.loadNextFile(idx);
    } else if ("progress" in r) {
        self.updateInputProgress(r);
    }
};

/**
 * Loads the next file using a loaderWorker
 *
 * @param {number} - The loaderWorker which will load the file
 */
self.loadNextFile = function(workerIdx) {
    if (workerIdx === -1) return;
    const id = self.loaderWorkers[workerIdx].id;
    if (self.pendingFiles.length === 0) {
        const workerObj = self.loaderWorkers.splice(workerIdx, 1)[0];
        self.terminateLoaderWorker(workerObj.id);
        return;
    }

    const nextFile = self.pendingFiles.splice(0, 1)[0];
    self.loaderWorkers[workerIdx].inputNum = nextFile.inputNum;
    self.loadingInputs++;
    self.postMessage({
        action: "loadInput",
        data: {
            file: nextFile.file,
            inputNum: nextFile.inputNum,
            workerId: id
        }
    });
};

/**
 * Sends a message to the inputWaiter to create a new loaderWorker.
 * If there's an inactive loaderWorker that already exists, use that instead.
 */
self.activateLoaderWorker = function() {
    for (let i = 0; i < self.loaderWorkers.length; i++) {
        if (!self.loaderWorkers[i].active) {
            self.loaderWorkers[i].active = true;
            self.loadNextFile(i);
            return;
        }
    }
    self.postMessage({
        action: "activateLoaderWorker"
    });
};

/**
 * Sends a message to the inputWaiter to terminate a loaderWorker.
 *
 * @param {number} id - The ID of the worker to be terminated
 */
self.terminateLoaderWorker = function(id) {
    self.postMessage({
        action: "terminateLoaderWorker",
        data: id
    });
    // If we still have pending files, spawn a worker
    if (self.pendingFiles.length > 0) {
        self.activateLoaderWorker();
    }
};

/**
 * Loads files using LoaderWorkers
 *
 * @param {object} filesData
 * @param {FileList} filesData.files - The list of files to be loaded
 * @param {number} filesData.activeTab - The active tab in the UI
 */
self.loadFiles = function(filesData) {
    const {files, activeTab} = filesData;
    let lastInputNum = -1;
    const inputNums = [];
    for (let i = 0; i < files.length; i++) {
        // If the first input is empty, replace it rather than adding a new one
        if (i === 0 && (!self.inputs[activeTab].buffer || self.inputs[activeTab].buffer.byteLength === 0)) {
            self.removeInput({
                inputNum: activeTab,
                refreshTabs: false,
                removeChefWorker: false
            });
            lastInputNum = self.addInput(false, "file", {
                name: files[i].name,
                size: files[i].size.toLocaleString(),
                type: files[i].type || "unknown"
            }, activeTab);
        } else {
            lastInputNum = self.addInput(false, "file", {
                name: files[i].name,
                size: files[i].size.toLocaleString(),
                type: files[i].type || "unknown"
            });
        }
        inputNums.push(lastInputNum);

        self.pendingFiles.push({
            file: files[i],
            inputNum: lastInputNum
        });
    }
    let max = self.maxWorkers;
    if (self.pendingFiles.length < self.maxWorkers) max = self.pendingFiles.length;

    // Create loaderWorkers to load the new files
    for (let i = 0; i < max; i++) {
        self.activateLoaderWorker();
    }

    self.getLoadProgress();
    self.setInput({inputNum: lastInputNum, silent: true});
};

/**
 * Adds an input to the input dictionary
 *
 * @param {boolean} [changetab=false] - Whether or not to change to the new input
 * @param {string} type - Either "userinput" or "file"
 * @param {Object} fileData - Contains information about the file to be added to the input (only used when type is "file")
 * @param {string} fileData.name - The filename of the input being added
 * @param {number} fileData.size - The file size (in bytes) of the input being added
 * @param {string} fileData.type - The MIME type of the input being added
 * @param {number} inputNum - Defaults to auto-incrementing self.currentInputNum
 */
self.addInput = function(
    changeTab = false,
    type,
    fileData = {
        name: "unknown",
        size: 0,
        type: "unknown"
    },
    inputNum = self.currentInputNum++
) {
    self.numInputs++;
    const newInputObj = {
        type: null,
        buffer: new ArrayBuffer(),
        stringSample: "",
        file: null,
        status: "pending",
        progress: 0,
        encoding: 0,
        eolSequence: "\u000a"
    };

    switch (type) {
        case "userinput":
            newInputObj.type = "userinput";
            newInputObj.status = "loaded";
            newInputObj.progress = 100;
            break;
        case "file":
            newInputObj.type = "file";
            newInputObj.file = {
                name: fileData.name,
                size: fileData.size,
                type: fileData.type
            };
            newInputObj.status = "pending";
            newInputObj.progress = 0;
            break;
        default:
            log.error(`Invalid input type '${type}'.`);
            return -1;
    }
    self.inputs[inputNum] = newInputObj;

    // Tell the inputWaiter we've added an input, so it can create a tab to display it
    self.postMessage({
        action: "inputAdded",
        data: {
            changeTab: changeTab,
            inputNum: inputNum
        }
    });

    return inputNum;
};

/**
 * Remove an input from the inputs dictionary
 *
 * @param {object} removeInputData
 * @param {number} removeInputData.inputNum - The number of the input to be removed
 * @param {boolean} removeInputData.refreshTabs - If true, refresh the tabs after removing the input
 * @param {boolean} removeInputData.removeChefWorker - If true, remove a chefWorker from the WorkerWaiter
 */
self.removeInput = function(removeInputData) {
    const inputNum = removeInputData.inputNum;
    const refreshTabs = removeInputData.refreshTabs;
    self.numInputs--;

    for (let i = 0; i < self.loaderWorkers.length; i++) {
        if (self.loaderWorkers[i].inputNum === inputNum) {
            // Terminate any loaderWorker that's loading the removed input
            self.loadingInputs--;
            self.terminateLoaderWorker(self.loaderWorkers[i].id);
            break;
        }
    }

    for (let i = 0; i < self.pendingFiles.length; i++) {
        // Remove the input from the pending files list
        if (self.pendingFiles[i].inputNum === inputNum) {
            self.pendingFiles.splice(i, 1);
            break;
        }
    }

    delete self.inputs[inputNum];

    if (refreshTabs) {
        self.refreshTabs(self.getPreviousInputNum(inputNum), "left");
    }

    if (self.numInputs < self.maxWorkers && removeInputData.removeChefWorker) {
        self.postMessage({
            action: "removeChefWorker"
        });
    }
};

/**
 * Change to the next tab.
 *
 * @param {number} inputNum - The inputNum of the tab to change to
 */
self.changeTabRight = function(inputNum) {
    const newInput = self.getNextInputNum(inputNum);
    self.postMessage({
        action: "changeTab",
        data: newInput
    });
};

/**
 * Change to the previous tab.
 *
 * @param {number} inputNum - The inputNum of the tab to change to
 */
self.changeTabLeft = function(inputNum) {
    const newInput = self.getPreviousInputNum(inputNum);
    self.postMessage({
        action: "changeTab",
        data: newInput
    });
};

/**
 * Updates the maximum number of tabs, and refreshes them if it changes
 *
 * @param {number} maxTabs - The new max number of tabs
 * @param {number} activeTab - The currently selected tab
 */
self.updateMaxTabs = function(maxTabs, activeTab) {
    if (self.maxTabs !== maxTabs) {
        self.maxTabs = maxTabs;
        self.refreshTabs(activeTab, "right");
    }
};

/**
 * Search the inputs for any that match the filters provided,
 * posting the results back to the inputWaiter
 *
 * @param {object} searchData - Object containing the search filters
 * @param {boolean} searchData.showPending - If true, include pending inputs in the results
 * @param {boolean} searchData.showLoading - If true, include loading inputs in the results
 * @param {boolean} searchData.showLoaded - If true, include loaded inputs in the results
 * @param {string} searchData.filter - A regular expression to match the inputs on
 * @param {string} searchData.filterType - Either "CONTENT" or "FILENAME". Determines what should be matched with filter
 * @param {number} searchData.numResults - The maximum number of results to be returned
 */
self.filterTabs = function(searchData) {
    const showPending = searchData.showPending,
        showLoading = searchData.showLoading,
        showLoaded = searchData.showLoaded,
        filterType = searchData.filterType;

    let filterExp;
    try {
        filterExp = new RegExp(searchData.filter, "i");
    } catch (error) {
        self.postMessage({
            action: "filterTabError",
            data: error.message
        });
        return;
    }
    const numResults = searchData.numResults;

    const inputs = [];
    const inputNums = Object.keys(self.inputs);
    for (let i = 0; i < inputNums.length; i++) {
        const iNum = inputNums[i];
        let textDisplay = "";
        let addInput = false;
        if (self.inputs[iNum].status === "pending" && showPending ||
            self.inputs[iNum].status === "loading" && showLoading ||
            self.inputs[iNum].status === "loaded" && showLoaded) {
            try {
                if (self.inputs[iNum].type === "userinput") {
                    if (filterType.toLowerCase() === "content" &&
                        filterExp.test(self.inputs[iNum].stringSample)) {
                        textDisplay = self.inputs[iNum].stringSample;
                        addInput = true;
                    }
                } else {
                    if ((filterType.toLowerCase() === "filename" &&
                        filterExp.test(self.inputs[iNum].file.name)) ||
                        (filterType.toLowerCase() === "content" &&
                        filterExp.test(self.inputs[iNum].stringSample))) {
                        textDisplay = self.inputs[iNum].file.name;
                        addInput = true;
                    }
                }
            } catch (error) {
                self.postMessage({
                    action: "filterTabError",
                    data: error.message
                });
                return;
            }
        }

        if (addInput) {
            if (textDisplay === "" || textDisplay === undefined) {
                textDisplay = "New Tab";
            }
            const inputItem = {
                inputNum: iNum,
                textDisplay: textDisplay
            };
            inputs.push(inputItem);
        }
        if (inputs.length >= numResults) {
            break;
        }
    }

    // Send the results back to the inputWaiter
    self.postMessage({
        action: "displayTabSearchResults",
        data: inputs
    });
};
