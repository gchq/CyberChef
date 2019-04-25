/**
 * Web Worker to handle loading data
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */


self.maxWorkers = 4;
self.maxTabs = 1;
self.pendingFiles = [];
self.inputs = {};
self.loaderWorkerPorts = [];
self.currentInputNum = 1;

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
            self.getInputProgress(r.data);
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
            self.addInput(true, "string");
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
        default:
            log.error(`Unknown action '${r.action}'.`);
    }
});

self.getLoadProgress = function(inputNum) {
    const inputNums = Object.keys(self.inputs);
    const total = inputNums.length;
    const pending = self.pendingFiles.length;
    let loaded = 0;
    let loading = 0;

    for (let i = 0; i < inputNums.length; i++) {
        switch (self.inputs[inputNums[i]].status) {
            case "loading":
                loading++;
                break;
            case "loaded":
                loaded++;
        }
    }

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

    if (loaded < total) {
        setTimeout(function(inputNum) {
            self.getLoadProgress(inputNum);
        }, 100);
    }
};

self.autoBake = function(inputNum) {
    const input = self.getInputObj(inputNum);
    if (input) {
        let inputData = input.data;
        if (typeof inputData !== "string") {
            inputData = inputData.fileBuffer;
        }
        self.postMessage({
            action: "allInputs",
            data: [{
                input: inputData,
                inputNum: parseInt(inputNum, 10)
            }]
        });
    }
};

self.getAllInputs = function() {
    const inputs = [];
    const inputNums = Object.keys(self.inputs);

    for (let i = 0; i < inputNums.length; i++) {
        if (self.inputs[inputNums[i]].status === "loaded") {
            let inputData = self.inputs[inputNums[i]].data;
            if (typeof inputData !== "string") {
                inputData = inputData.fileBuffer;
            }
            inputs.push({
                input: inputData,
                inputNum: inputNums[i]
            });
        }
    }

    self.postMessage({
        action: "allInputs",
        data: inputs
    });

};

self.getInputObj = function(inputNum) {
    return self.inputs[inputNum];
};

self.getInputValue = function(inputNum) {
    for (let i = 0; i < self.inputs.length; i++) {
        if (self.inputs[i].inputNum === inputNum) {
            if (self.inputs[i].status === "loaded") {
                let inputData = self.inputs[i].data;
                if (typeof inputData !== "string") {
                    inputData = inputData.fileBuffer;
                }
                return inputData;
            }
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

self.setInput = function(inputNum) {
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
        data: inputObj
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
    for (let i = 0; i < self.loaderWorkerPorts.length; i++) {
        if (self.loaderWorkerPorts[i].id === workerId) {
            return i;
        }
    }
    return -1;
};

self.loaderWorkerReady = function(workerData) {
    const newWorkerObj = {
        id: workerData.id,
        port: workerData.port,
        inputNum: -1,
        active: true
    };
    newWorkerObj.port.onmessage = function (e) {
        self.handleLoaderMessage(e);
    };
    self.loaderWorkerPorts.push(newWorkerObj);
    self.loadNextFile(self.loaderWorkerPorts.indexOf(newWorkerObj));
};

self.handleLoaderMessage = function(e) {
    const r = e.data;
    let inputNum = 0;

    if (r.hasOwnProperty("inputNum")) {
        inputNum = r.inputNum;
    }

    if (r.hasOwnProperty("fileBuffer")) {
        log.debug(`Input file ${inputNum} loaded.`);
        self.updateInputValue({
            inputNum: inputNum,
            value: r.fileBuffer
        });
        const idx = self.getLoaderWorkerIdx(r.id);
        self.loadNextFile(idx);
    } else if (r.hasOwnProperty("progress")) {
        self.updateInputProgress(r);
    }
};

self.loadNextFile = function(workerIdx) {
    if (workerIdx === -1) return; // No more workers can be created
    const port = self.loaderWorkerPorts[workerIdx].port;
    if (self.pendingFiles.length === 0) {
        const workerObj = self.loaderWorkerPorts.splice(workerIdx, 1)[0];
        self.terminateLoaderWorker(workerObj.id);
        return;
    }

    const nextFile = self.pendingFiles.splice(0, 1)[0];
    self.loaderWorkerPorts[workerIdx].inputNum = nextFile.inputNum;
    port.postMessage({
        action: "loadInput",
        data: {
            file: nextFile.file,
            inputNum: nextFile.inputNum
        }
    });
};

self.activateLoaderWorker = function() {
    for (let i = 0; i < self.loaderWorkerPorts.length; i++) {
        if (!self.loaderWorkerPorts[i].active) {
            self.loaderWorkerPorts[i].active = true;
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
 */
self.loadFiles = function(files) {
    let lastInputNum = -1;
    const inputNums = [];
    for (let i = 0; i < files.length; i++) {
        lastInputNum = self.addInput(false, "file", {
            name: files[i].name,
            size: files[i].size.toLocaleString(),
            type: files[i].type || "unknown"
        });
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
 */
self.addInput = function(changeTab=false, type, fileData={name: "unknown", size: "unknown", type: "unknown"}) {
    const inputNum = self.currentInputNum++;
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

    delete self.inputs[inputNum];

    for (let i = 0; i < self.loaderWorkerPorts.length; i++) {
        if (self.loaderWorkerPorts[i].inputNum === inputNum) {
            self.terminateLoaderWorker(self.loaderWorkerPorts[i].id);
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
