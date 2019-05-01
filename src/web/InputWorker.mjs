/**
 * Web Worker to handle loading data
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Utils from "../core/Utils";

self.maxWorkers = 4;
self.maxTabs = 1;
self.pendingFiles = [];
self.inputs = {};
self.loaderWorkers = [];
self.currentInputNum = 1;
self.numInputs = 0;
self.pendingInputs = 0;
self.loadingInputs = 0;

/**
 * Respond to message from parent thread.
 */
self.addEventListener("message", function(e) {
    const r = e.data;
    if (!r.hasOwnProperty("action")) {
        log.error("No action");
        return;
    }

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
            self.maxTabs = r.data;
            break;
        case "updateInputValue":
            self.updateInputValue(r.data);
            break;
        case "getInputProgress":
            self.getLoadProgress(r.data);
            break;
        case "updateInputProgress":
            self.updateInputProgress(r.data);
            break;
        case "getAll":
            self.getAllInputs();
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
            self.addInput(r.data, "string");
            break;
        case "refreshTabs":
            self.refreshTabs(r.data.inputNum, r.data.direction);
            break;
        case "removeInput":
            self.removeInput(r.data);
            break;
        case "changeTabRight":
            self.changeTabRight(r.data.activeTab, r.data.nums);
            break;
        case "changeTabLeft":
            self.changeTabLeft(r.data.activeTab, r.data.nums);
            break;
        case "autobake":
            self.autoBake(r.data);
            break;
        case "filterTabs":
            self.filterTabs(r.data);
            break;
        case "loaderWorkerMessage":
            self.handleLoaderMessage(r.data);
            break;
        default:
            log.error(`Unknown action '${r.action}'.`);
    }
});

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

self.autoBake = function(inputNum) {
    const input = self.getInputObj(inputNum);
    if (input) {
        let inputData = input.data;
        if (typeof inputData !== "string") {
            inputData = inputData.fileBuffer;
        }
        self.postMessage({
            action: "queueInput",
            data: {
                input: inputData,
                inputNum: parseInt(inputNum, 10)
            }
        });
        self.postMessage({
            action: "bake"
        });
    }
};

self.getAllInputs = function() {
    const inputNums = Object.keys(self.inputs);

    for (let i = 0; i < inputNums.length; i++) {
        if (self.inputs[inputNums[i]].status === "loaded") {
            let inputData = self.inputs[inputNums[i]].data;
            if (typeof inputData !== "string") {
                inputData = inputData.fileBuffer;
            }
            self.postMessage({
                action: "queueInput",
                data: {
                    input: inputData,
                    inputNum: inputNums[i]
                }
            });
        }
    }
    self.postMessage({
        action: "bake"
    });

};

self.getInputObj = function(inputNum) {
    return self.inputs[inputNum];
};

self.getInputValue = function(inputNum) {
    if (self.inputs[inputNum]) {
        if (typeof self.inputs[inputNum].data === "string") {
            return self.inputs[inputNum].data;
        } else {
            return self.inputs[inputNum].fileBuffer;
        }
    }
    return "";
};

self.getInputProgress = function(inputNum) {
    const inputObj = self.getInputObj(inputNum);
    if (inputObj === undefined || inputObj === null) return;
    return inputObj.progress;
};

    /**
     * Gets the largest inputNum
     *
     * @returns {number}
     */
self.getLargestInputNum = function() {
    let largest = 0;
    const inputNums = Object.keys(self.inputs);
    for (let i = 0; i < inputNums.length; i++) {
        const num = parseInt(inputNums[i], 10);
        if (num > largest) {
            largest = num;
        }
    }
    return largest;
};

    /**
     * Gets the smallest inputNum
     *
     * @returns {number}
     */
self.getSmallestInputNum = function() {
    let smallest = self.getLargestInputNum();
    const inputNums = Object.keys(self.inputs);
    for (let i = 0; i < inputNums.length; i++) {
        const num = parseInt(inputNums[i], 10);
        if (num < smallest) {
            smallest = num;
        }
    }
    return smallest;
};

/**
 * Gets the previous inputNum
 *
 * @param {number} inputNum - The current input number
 * @returns {number}
 */
self.getPreviousInputNum = function(inputNum) {
    let num = -1;
    const inputNums = Object.keys(self.inputs);
    for (let i = 0; i < inputNums.length; i++) {
        const iNum = parseInt(inputNums[i], 10);
        if (iNum < inputNum) {
            if (iNum > num) {
                num = iNum;
            }
        }
    }
    return num;
};

/**
 * Gets the next inputNum
 *
 * @param {number} inputNum - The current input number
 * @returns {number}
 */
self.getNextInputNum = function(inputNum) {
    let num = self.getLargestInputNum();
    const inputNums = Object.keys(self.inputs);
    for (let i = 0; i < inputNums.length; i++) {
        const iNum = parseInt(inputNums[i], 10);
        if (iNum > inputNum) {
            if (iNum < num) {
                num = iNum;
            }
        }
    }
    return num;
};

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
                        newNum = self.getPreviousInputNum(nums[i - 1]);
                    }
                    break;
                case "right":
                    newNum = self.getPreviousInputNum(nums[i - 1]);
                    if (newNum === nums[i - 1]) {
                        direction = "left";
                        newNum = self.getNextInputNum(nums[i - 1]);
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

self.updateTabHeader = function(inputNum) {
    const input = self.getInputObj(inputNum);
    if (input === null || input === undefined) return;
    let inputData = input.data;
    if (typeof inputData !== "string") {
        inputData = input.data.name;
    }
    self.postMessage({
        action: "updateTabHeader",
        data: {
            inputNum: inputNum,
            input: inputData.slice(0, 100)
        }
    });
};

self.setInput = function(inputData) {
    const inputNum = inputData.inputNum;
    const silent = inputData.silent;
    const input = self.getInputObj(inputNum);
    if (input === undefined || input === null) return;

    const inputVal = input.data;
    const inputObj = {
        inputNum: inputNum,
        input: inputVal
    };
    if (typeof inputVal !== "string") {
        inputObj.input = inputVal.fileBuffer.slice(0, 4096);
        inputObj.name = inputVal.name;
        inputObj.size = inputVal.size;
        inputObj.type = inputVal.type;
        inputObj.progress = input.progress;
    }

    self.postMessage({
        action: "setInput",
        data: {
            inputObj: inputObj,
            silent: silent
        }
    });
    self.getInputProgress(inputNum);
};

self.refreshTabs = function(inputNum, direction) {
    const nums = self.getNearbyNums(inputNum, direction);
    self.postMessage({
        action: "refreshTabs",
        data: {
            nums: nums,
            activeTab: (nums.includes(inputNum)) ? inputNum : self.getNextInputNum(inputNum)
        }
    });

    for (let i = 0; i < nums.length; i++) {
        self.updateTabHeader(nums[i]);
    }

    // self.setInput(inputNum);
};

self.updateInputStatus = function(inputNum, status) {
    for (let i = 0; i < self.inputs.length; i++) {
        if (self.inputs[i].inputNum === inputNum) {
            self.inputs[i].status = status;
            return;
        }
    }
};

self.updateInputProgress = function(inputData) {
    const inputNum = inputData.inputNum;
    const progress = inputData.progress;

    if (self.inputs[inputNum] !== undefined) {
        self.inputs[inputNum].progress = progress;
    }
};

self.updateInputValue = function(inputData) {
    const inputNum = inputData.inputNum;
    if (inputNum < 1) return;
    const value = inputData.value;
    if (self.inputs[inputNum] !== undefined) {
        if (typeof value === "string") {
            self.inputs[inputNum].data = value;
        } else {
            self.inputs[inputNum].data.fileBuffer = value;
        }
        self.inputs[inputNum].status = "loaded";
        self.inputs[inputNum].progress = 100;
        return;
    }

    // If we get to here, an input for inputNum could not be found
    // Only do this if the value is a string, as loadFiles will create
    // the input object for files
    if (typeof value === "string") {
        self.inputs.push({
            inputNum: inputNum,
            data: value,
            status: "loaded",
            progress: 100
        });
    }
};

self.getLoaderWorkerIdx = function(workerId) {
    for (let i = 0; i < self.loaderWorkers.length; i++) {
        if (self.loaderWorkers[i].id === workerId) {
            return i;
        }
    }
    return -1;
};

self.loaderWorkerReady = function(workerData) {
    const newWorkerObj = {
        id: workerData.id,
        inputNum: -1,
        active: true
    };
    self.loaderWorkers.push(newWorkerObj);
    self.loadNextFile(self.loaderWorkers.indexOf(newWorkerObj));
};

self.handleLoaderMessage = function(r) {
    let inputNum = 0;

    if (r.hasOwnProperty("inputNum")) {
        inputNum = r.inputNum;
    }

    if (r.hasOwnProperty("error")) {
        self.updateInputStatus(r.inputNum, "error");
        self.updateInputProgress(r.inputNum, 0);

        log.error(r.error);
        self.loadingInputs--;

        self.terminateLoaderWorker(r.id);
        self.activateLoaderWorker();

        return;
    }

    if (r.hasOwnProperty("fileBuffer")) {
        log.debug(`Input file ${inputNum} loaded.`);
        self.loadingInputs--;
        self.updateInputValue({
            inputNum: inputNum,
            value: r.fileBuffer
        });

        self.setInput({inputNum: inputNum, silent: false});

        const idx = self.getLoaderWorkerIdx(r.id);
        self.loadNextFile(idx);
    } else if (r.hasOwnProperty("progress")) {
        self.updateInputProgress(r);
    }
};

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

self.terminateLoaderWorker = function(id) {
    self.postMessage({
        action: "terminateLoaderWorker",
        data: id
    });
    if (self.pendingFiles.length > 0) {
        self.activateLoaderWorker();
    }
};

/**
 * Loads files using LoaderWorkers
 *
 * @param {object} filesData
 * @param filesData.files
 * @param {number} filesData.activeTab
 */
self.loadFiles = function(filesData) {
    const files = filesData.files;
    const activeTab = filesData.activeTab;
    let lastInputNum = -1;
    const inputNums = [];
    for (let i = 0; i < files.length; i++) {
        if (i === 0 && self.getInputValue(activeTab) === "") {
            self.removeInput(activeTab);
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

    for (let i = 0; i < max; i++) {
        self.activateLoaderWorker();
    }

    // self.refreshTabs(lastInputNum, "right");
    self.getLoadProgress();

    self.postMessage({
        action: "addInputs",
        data: inputNums
    });
};

/**
 * Adds an input to the input array
 *
 * @param {boolean} [changetab=false] - Whether or not to send a message to the main thread that the input has been created
 * @param {string} type - Either "string" or "file"
 * @param {Object} fileData - Contains information about the file to be added to the input
 * @param {string} fileData.name
 * @param {string} fileData.size
 * @param {string} fileData.type
 * @param {number} inputNum
 */
self.addInput = function(changeTab=false, type, fileData={name: "unknown", size: "unknown", type: "unknown"}, inputNum = self.currentInputNum++) {
    self.numInputs++;
    const newInputObj = {
        inputNum: inputNum
    };

    switch (type) {
        case "string":
            newInputObj.data = "";
            newInputObj.status = "loaded";
            newInputObj.progress = 100;
            break;
        case "file":
            newInputObj.data = {
                fileBuffer: new ArrayBuffer(),
                name: fileData.name,
                size: fileData.size,
                type: fileData.type
            };
            newInputObj.status = "pending";
            newInputObj.progress = 0;
            break;
        default:
            log.error(`Invalid type '${type}'.`);
            return -1;
    }
    self.inputs[inputNum] = newInputObj;

    if (changeTab) {
        self.postMessage({
            action: "inputAdded",
            data: {
                changeTab: changeTab,
                inputNum: inputNum
            }
        });
    }

    return inputNum;
};

self.removeInput = function(removeInputData) {
    const inputNum = removeInputData.inputNum;
    const refreshTabs = removeInputData.refreshTabs;
    self.numInputs--;

    delete self.inputs[inputNum];

    for (let i = 0; i < self.loaderWorkers.length; i++) {
        if (self.loaderWorkers[i].inputNum === inputNum) {
            self.loadingInputs--;
            self.terminateLoaderWorker(self.loaderWorkers[i].id);
        }
    }

    for (let i = 0; i < self.pendingFiles.length; i++) {
        if (self.pendingFiles[i].inputNum === inputNum) {
            self.pendingFiles.splice(i, 1);
            break;
        }
    }

    if (refreshTabs) {
        self.refreshTabs(inputNum, "left");
    }
};

self.changeTabRight = function(inputNum, tabNums) {
    const newInput = self.getNextInputNum(inputNum);
    if (tabNums.includes(newInput)) {
        self.postMessage({
            action: "changeTab",
            data: newInput
        });
    } else {
        self.refreshTabs(newInput, "right");
    }
};

self.changeTabLeft = function(inputNum, tabNums) {
    const newInput = self.getPreviousInputNum(inputNum);
    if (tabNums.includes(newInput)) {
        self.postMessage({
            action: "changeTab",
            data: newInput
        });
    } else {
        self.refreshTabs(newInput, "left");
    }
};

self.filterTabs = function(searchData) {
    const showPending = searchData.showPending;
    const showLoading = searchData.showLoading;
    const showLoaded = searchData.showLoaded;

    const fileNameFilter = searchData.fileNameFilter;
    const contentFilter = searchData.contentFilter;
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
            if (typeof self.inputs[iNum].data === "string") {
                if (self.inputs[iNum].data.slice(0, 4096).toLowerCase().includes(contentFilter)) {
                    textDisplay = self.inputs[iNum].data.slice(0, 4096);
                    addInput = true;
                }
            } else {
                if (self.inputs[iNum].data.name.toLowerCase().includes(fileNameFilter) &&
                    Utils.arrayBufferToStr(self.inputs[iNum].data.fileBuffer.slice(0, 4096)).toLowerCase().includes(contentFilter)) {
                    textDisplay = self.inputs[iNum].data.name;
                    addInput = true;
                }
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

    self.postMessage({
        action: "displayTabSearchResults",
        data: inputs
    });
};
