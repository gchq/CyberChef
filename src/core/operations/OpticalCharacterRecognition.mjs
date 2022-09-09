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
        this.description = "Optical character recognition or optical character reader (OCR) is the mechanical or electronic conversion of images of typed, handwritten or printed text into machine-encoded text.<br><br>Supported image formats: png, jpg, bmp, pbm.";
        this.infoURL = "https://wikipedia.org/wiki/Optical_character_recognition";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Show confidence",
                type: "boolean",
                value: true
            },
            {
                name: "Language",
                type: "editableOptionShort",
                value: [
                    { name: "Afrikaans", value: "afr" },
                    { name: "Arabic", value: "ara" },
                    { name: "Azerbaijani", value: "aze" },
                    { name: "Belarusian", value: "bel" },
                    { name: "Bengali", value: "ben" },
                    { name: "Bulgarian", value: "bul" },
                    { name: "Catalan", value: "cat" },
                    { name: "Czech", value: "ces" },
                    { name: "Chinese", value: "chi_sim" },
                    { name: "Traditional Chinese", value: "chi_tra" },
                    { name: "Cherokee", value: "chr" },
                    { name: "Danish", value: "dan" },
                    { name: "German", value: "deu" },
                    { name: "Greek", value: "ell" },
                    { name: "English", value: "eng" },
                    { name: "English (Old)", value: "enm" },
                    { name: "Internet Meme", value: "meme" },
                    { name: "Esperanto", value: "epo" },
                    { name: "Esperanto alternative", value: "epo_alt" },
                    { name: "Estonian", value: "est" },
                    { name: "Basque", value: "eus" },
                    { name: "Finnish", value: "fin" },
                    { name: "French", value: "fra" },
                    { name: "Frankish", value: "frk" },
                    { name: "French (Old)", value: "frm" },
                    { name: "Galician", value: "glg" },
                    { name: "Ancient Greek", value: "grc" },
                    { name: "Hebrew", value: "heb" },
                    { name: "Hindi", value: "hin" },
                    { name: "Croatian", value: "hrv" },
                    { name: "Hungarian", value: "hun" },
                    { name: "Indonesian", value: "ind" },
                    { name: "Icelandic", value: "isl" },
                    { name: "Italian", value: "ita" },
                    { name: "Italian (Old)", value: "ita_old" },
                    { name: "Japanese", value: "jpn" },
                    { name: "Kannada", value: "kan" },
                    { name: "Korean", value: "kor" },
                    { name: "Latvian", value: "lav" },
                    { name: "Lithuanian", value: "lit" },
                    { name: "Malayalam", value: "mal" },
                    { name: "Macedonian", value: "mkd" },
                    { name: "Maltese", value: "mlt" },
                    { name: "Malay", value: "msa" },
                    { name: "Dutch", value: "nld" },
                    { name: "Norwegian", value: "nor" },
                    { name: "Polish", value: "pol" },
                    { name: "Portuguese", value: "por" },
                    { name: "Romanian", value: "ron" },
                    { name: "Russian", value: "rus" },
                    { name: "Slovakian", value: "slk" },
                    { name: "Slovenian", value: "slv" },
                    { name: "Spanish", value: "spa" },
                    { name: "Old Spanish", value: "spa_old" },
                    { name: "Albanian", value: "sqi" },
                    { name: "Serbian (Latin)", value: "srp" },
                    { name: "Swahili", value: "swa" },
                    { name: "Swedish", value: "swe" },
                    { name: "Tamil", value: "tam" },
                    { name: "Telugu", value: "tel" },
                    { name: "Tagalog", value: "tgl" },
                    { name: "Thai", value: "tha" },
                    { name: "Turkish", value: "tur" },
                    { name: "Ukrainian", value: "ukr" },
                    { name: "Vietnamese", value: "vie" },
                ],
                defaultIndex: 14
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [showConfidence, language] = args;

        if (!isWorkerEnvironment()) throw new OperationError("This operation only works in a browser");

        const type = isImage(input);
        if (!type) {
            throw new OperationError("Unsupported file type (supported: jpg,png,pbm,bmp) or no file provided\nOpen an image as input using the toolbar.");
        }

        try {
            self.sendStatusMessage("Spinning up Tesseract worker...");
            const image = `data:${type};base64,${toBase64(input)}`;
            const worker = createWorker({
                logger: progress => {
                    if (isWorkerEnvironment()) {
                        self.sendStatusMessage(`Status: ${progress.status}${progress.status === "recognizing text" ? ` - ${(parseFloat(progress.progress)*100).toFixed(2)}%`: "" }`);
                    }
                }
            });
            await worker.load();
            self.sendStatusMessage(`Loading ${language} language pack...`);
            await worker.loadLanguage(language);
            self.sendStatusMessage("Intialising Tesseract API...");
            await worker.initialize(language);
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
