/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
// import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import {scanForFileTypes, extractFile} from "../lib/FileType";
import {FILE_SIGNATURES} from "../lib/FileSignatures";

/**
 * Extract Files operation
 */
class ExtractFiles extends Operation {

    /**
     * ExtractFiles constructor
     */
    constructor() {
        super();

        this.name = "Extract Files";
        this.module = "Default";
        this.description = "TODO";
        this.infoURL = "https://forensicswiki.org/wiki/File_Carving";
        this.inputType = "ArrayBuffer";
        this.outputType = "List<File>";
        this.presentType = "html";
        this.args = Object.keys(FILE_SIGNATURES).map(cat => {
            return {
                name: cat,
                type: "boolean",
                value: cat === "Miscellaneous" ? false : true
            };
        });
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        const bytes = new Uint8Array(input),
            categories = [];

        args.forEach((cat, i) => {
            if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
        });

        // Scan for embedded files
        const detectedFiles = scanForFileTypes(bytes, categories);

        // Extract each file that we support
        const files = [];
        detectedFiles.forEach(detectedFile => {
            try {
                files.push(extractFile(bytes, detectedFile.fileDetails, detectedFile.offset));
            } catch (err) {
                if (err.message.indexOf("No extraction algorithm available") < 0)
                    throw err;
            }
        });

        return files;
    }

    /**
     * Displays the files in HTML for web apps.
     *
     * @param {File[]} files
     * @returns {html}
     */
    async present(files) {
        return await Utils.displayFilesAsHTML(files);
    }

}

export default ExtractFiles;
