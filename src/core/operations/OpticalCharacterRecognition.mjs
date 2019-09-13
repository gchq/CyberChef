/**
 * @author n1474335 [n1474335@gmail.com]
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";

import Tesseract from "tesseract.js";
const { TesseractWorker } = Tesseract;

/**
 * Optical Character Recognition operation
 */
class OpticalCharacterRecognition extends Operation {

    /**
     * OpticalCharacterRecognition constructor
     */
    constructor() {
        super();

        this.name = "Optical Character Recognition";
        this.module = "Image";
        this.description = "Optical character recognition or optical character reader (OCR) is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text.<br><br>Supported image formats: png, jpg, bmp, pbm.";
        this.infoURL = "https://wikipedia.org/wiki/Optical_character_recognition";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Show confidence",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [showConfidence] = args;

        const type = isImage(input);
        if (!type) {
            throw new OperationError("Invalid File Type");
        }

        try {
            const image = `data:${type};base64,${toBase64(input)}`;
            const worker = new TesseractWorker();
            const result = await worker.recognize(image)
                .progress(progress => {
                    if (isWorkerEnvironment()) {
                        self.sendStatusMessage(`Status: ${progress.status} - ${(parseFloat(progress.progress)*100).toFixed(2)}%`);
                    }
                });

            if (showConfidence) {
                return `Confidence: ${result.confidence}%\n\n${result.text}`;
            } else {
                return result.text;
            }
        } catch (err) {
            throw new OperationError(`Error performing OCR on image. (${err})`);
        }
    }
}

export default OpticalCharacterRecognition;
