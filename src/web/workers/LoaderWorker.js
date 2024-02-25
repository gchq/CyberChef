/**
 * Web Worker to load large amounts of data without locking up the UI.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import loglevelMessagePrefix from "loglevel-message-prefix";

loglevelMessagePrefix(log, {
    prefixes: [],
    staticPrefixes: ["LoaderWorker"],
});

self.id = null;

/**
 * Respond to message from parent thread.
 */
self.addEventListener("message", function (e) {
    // Handle message
    const r = e.data;
    log.debug(`Receiving command '${r.action}'`);

    switch (r.action) {
        case "setID":
            self.id = r.data.id;
            break;
        case "loadFile":
            self.loadFile(r.data.file, r.data?.inputNum ?? "");
            break;
        case "setLogLevel":
            log.setLevel(r.data, false);
            break;
        default:
            log.error(`Unknown action '${r.action}'.`);
    }
});

/**
 * Loads a file object into an ArrayBuffer, then transfers it back to the parent thread.
 *
 * @param {File} file
 * @param {string} inputNum
 */
self.loadFile = function (file, inputNum) {
    const reader = new FileReader();
    if (file.size >= 256 * 256 * 256 * 128) {
        self.postMessage({
            error: "File size too large.",
            inputNum: inputNum,
            id: self.id,
        });
        return;
    }
    const data = new Uint8Array(file.size);
    let offset = 0;
    const CHUNK_SIZE = 10485760; // 10MiB

    const seek = function () {
        if (offset >= file.size) {
            self.postMessage(
                { fileBuffer: data.buffer, inputNum: inputNum, id: self.id },
                [data.buffer],
            );
            return;
        }
        self.postMessage({
            progress: Math.round((offset / file.size) * 100),
            inputNum: inputNum,
        });
        const slice = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(slice);
    };

    reader.onload = function (e) {
        data.set(new Uint8Array(reader.result), offset);
        offset += CHUNK_SIZE;
        seek();
    };

    reader.onerror = function (e) {
        self.postMessage({
            error: reader.error.message,
            inputNum: inputNum,
            id: self.id,
        });
    };

    seek();
};
