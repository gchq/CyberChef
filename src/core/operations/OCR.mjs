/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";

import jimp from "jimp";
import Tesseract from "tesseract.js";
const { TesseractWorker } = Tesseract;

/**
 * OCR operation
 */
class OCR extends Operation {

    /**
     * OCR constructor
     */
    constructor() {
        super();

        this.name = "OCR";
        this.module = "Default";
        this.description = "Optical character recognition or optical character reader (OCR) is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text.";
        this.infoURL = "https://en.wikipedia.org/wiki/Optical_character_recognition";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        if (!isImage(input)) {
            throw new OperationError("Invalid File Type");
        }

        try {
            if (isWorkerEnvironment())
                self.sendStatusMessage("Performing OCR on image...");

            let image;
            try {
                image = await jimp.read(input);
                image = await image.getBase64Async(jimp.AUTO);
            } catch (err) {
                throw new OperationError(`Error loading image. (${err})`);
            }

            const worker = new TesseractWorker();

            const result = await worker.recognize(image)
                .progress(progress => {
                    if (isWorkerEnvironment()) self.sendStatusMessage(`${progress.status} - ${(parseFloat(progress.progress)*100).toFixed(2)}%`);
                });

            return result.text;
        } catch (err) {
            throw new OperationError(`Error performing OCR on image. (${err})`);
        }
    }
}

export default OCR;
