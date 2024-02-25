/**
 * @author n1474335 [n1474335@gmail.com]
 * @author mshwed [m@ttshwed.com]
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";

import process from "process";
import { createWorker } from "tesseract.js";

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
        this.module = "OCR";
        this.description
            = "Optical character recognition or optical character reader (OCR) is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text.<br><br>Supported image formats: png, jpg, bmp, pbm.";
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

        if (!isWorkerEnvironment()) throw new OperationError("This operation only works in a browser");

        const type = isImage(input);
        if (!type) {
            throw new OperationError("Unsupported file type (supported: jpg,png,pbm,bmp) or no file provided");
        }

        const assetDir = isWorkerEnvironment() ? `${self.docURL}/assets/` : `${process.cwd()}/src/core/vendor/`;

        try {
            self.sendStatusMessage("Spinning up Tesseract worker...");
            const image = `data:${type};base64,${toBase64(input)}`;
            const worker = createWorker({
                workerPath: `${assetDir}tesseract/worker.min.js`,
                langPath: `${assetDir}tesseract/lang-data`,
                corePath: `${assetDir}tesseract/tesseract-core.wasm.js`,
                logger: (progress) => {
                    if (isWorkerEnvironment()) {
                        self.sendStatusMessage(
                            `Status: ${progress.status}${progress.status === "recognizing text" ? ` - ${(parseFloat(progress.progress) * 100).toFixed(2)}%` : ""}`
                        );
                    }
                }
            });
            await worker.load();
            self.sendStatusMessage(`Loading English language pack...`);
            await worker.loadLanguage("eng");
            self.sendStatusMessage("Intialising Tesseract API...");
            await worker.initialize("eng");
            self.sendStatusMessage("Finding text...");
            const result = await worker.recognize(image);

            if (showConfidence) {
                return `Confidence: ${result.data.confidence}%\n\n${result.data.text}`;
            } else {
                return result.data.text;
            }
        } catch (err) {
            throw new OperationError(`Error performing OCR on image. (${err})`);
        }
    }
}

export default OpticalCharacterRecognition;
