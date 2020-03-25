/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import {scanForFileTypes, extractFile} from "../lib/FileType.mjs";
import {FILE_SIGNATURES} from "../lib/FileSignatures.mjs";

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
        this.description = "Performs file carving to attempt to extract files from the input.<br><br>This operation is currently capable of carving out the following formats:<ul><li>JPG</li><li>EXE</li><li>ZIP</li><li>PDF</li><li>PNG</li><li>BMP</li><li>FLV</li><li>RTF</li><li>DOCX, PPTX, XLSX</li><li>EPUB</li><li>GZIP</li><li>ZLIB</li><li>ELF, BIN, AXF, O, PRX, SO</li></ul>";
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
        }).concat([
            {
                name: "Ignore failed extractions",
                type: "boolean",
                value: "true"
            },
            {
                name: "Extract Offset Files",
                type: "boolean",
                value: "false"
            }
        ]);
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {List<File>}
     */
    run(input, args) {
        const bytes = new Uint8Array(input),
            categories = [],
            extractOffset = args.pop(1),
            ignoreFailedExtractions = args.pop(1);

        args.forEach((cat, i) => {
            if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
        });

        // Scan for embedded files
        const detectedFiles = scanForFileTypes(bytes, extractOffset, categories);

        // Extract each file that we support
        const files = [];
        const errors = [];
        const offsetBytes = new Array(7);
        detectedFiles.forEach(detectedFile => {
            try {

                // If there is a bit offset.
                if (detectedFile.bitOffset) {

                    // If a pre-shifted byte stream of the input exists.
                    if (offsetBytes[detectedFile.bitOffset - 1]) {

                        // Extract the file from the bit shifted byte stream of the input.
                        files.push(extractFile(offsetBytes[detectedFile.bitOffset - 1], detectedFile.fileDetails, detectedFile.offset));
                    } else {
                        offsetBytes[detectedFile.bitOffset - 1] = new Array();

                        // Loop through the input byte stream, shifting it by the require amount.
                        for (let i = 0; i < bytes.length -1; i++) {
                            offsetBytes[detectedFile.bitOffset - 1].push(((bytes[i] << detectedFile.bitOffset) & 0xff) | (bytes[i+1] >> (8-detectedFile.bitOffset)));
                        }

                        // Store it so we do not have to re-calculate this.
                        offsetBytes[detectedFile.bitOffset - 1] = new Uint8Array(offsetBytes[detectedFile.bitOffset - 1]);
                        files.push(extractFile(offsetBytes[detectedFile.bitOffset - 1], detectedFile.fileDetails, detectedFile.offset));
                    }
                } else {
                    files.push(extractFile(bytes, detectedFile.fileDetails, detectedFile.offset));
                }
            } catch (err) {
                if (!ignoreFailedExtractions && err.message.indexOf("No extraction algorithm available") < 0) {
                    errors.push(
                        `Error while attempting to extract ${detectedFile.fileDetails.name} ` +
                        `at offset ${detectedFile.offset}:\n` +
                        `${err.message}`
                    );
                }
            }
        });

        if (errors.length) {
            throw new OperationError(errors.join("\n\n"));
        }

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
