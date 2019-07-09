/**
 * Web Worker to handle zipping the outputs for download.
 *
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import zip from "zlibjs/bin/zip.min.js";
import Utils from "../../core/Utils.mjs";
import Dish from "../../core/Dish.mjs";
import {detectFileType} from "../../core/lib/FileType.mjs";

const Zlib = zip.Zlib;

/**
 * Respond to message from parent thread.
 */
self.addEventListener("message", function(e) {
    const r = e.data;
    if (!("outputs" in r)) {
        log.error("No files were passed to the ZipWorker.");
        return;
    }
    if (!("filename" in r)) {
        log.error("No filename was passed to the ZipWorker");
        return;
    }

    self.zipFiles(r.outputs, r.filename, r.fileExtension);
});

self.setOption = function(...args) {};

/**
 * Compress the files into a zip file and send the zip back
 * to the OutputWaiter.
 *
 * @param {object} outputs
 * @param {string} filename
 * @param {string} fileExtension
 */
self.zipFiles = async function(outputs, filename, fileExtension) {
    const zip = new Zlib.Zip();
    const inputNums = Object.keys(outputs);

    for (let i = 0; i < inputNums.length; i++) {
        const iNum = inputNums[i];
        let ext = fileExtension;

        const cloned = new Dish(outputs[iNum].data.dish);
        const output = new Uint8Array(await cloned.get(Dish.ARRAY_BUFFER));

        if (fileExtension === undefined || fileExtension === "") {
            // Detect automatically
            const types = detectFileType(output);
            if (!types.length) {
                ext = ".dat";
            } else {
                ext = `.${types[0].extension.split(",", 1)[0]}`;
            }
        }
        const name = Utils.strToByteArray(iNum + ext);

        zip.addFile(output, {filename: name});
    }

    const zippedFile = zip.compress();
    self.postMessage({
        zippedFile: zippedFile.buffer,
        filename: filename
    }, [zippedFile.buffer]);
};
