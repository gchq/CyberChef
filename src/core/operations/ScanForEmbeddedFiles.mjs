/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { scanForFileTypes } from "../lib/FileType.mjs";
import { FILE_SIGNATURES } from "../lib/FileSignatures.mjs";

/**
 * Scan for Embedded Files operation
 */
class ScanForEmbeddedFiles extends Operation {

    /**
     * ScanForEmbeddedFiles constructor
     */
    constructor() {
        super();

        this.name = "Scan for Embedded Files";
        this.module = "Default";
        this.description = "Scans the data for potential embedded files by looking for magic bytes at all offsets. This operation is prone to false positives.<br><br>WARNING: Files over about 100KB in size will take a VERY long time to process.";
        this.infoURL = "https://wikipedia.org/wiki/List_of_file_signatures";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
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
     * @returns {string}
     */
    run(input, args) {
        let output = "Scanning data for 'magic bytes' which may indicate embedded files. The following results may be false positives and should not be treated as reliable. Any sufficiently long file is likely to contain these magic bytes coincidentally.\n",
            numFound = 0;
        const categories = [],
            data = new Uint8Array(input);

        args.forEach((cat, i) => {
            if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
        });

        const types = scanForFileTypes(data, categories);

        if (types.length) {
            types.forEach(type => {
                numFound++;
                output += `\nOffset ${type.offset} (0x${Utils.hex(type.offset)}):
  File type:   ${type.fileDetails.name}
  Extension:   ${type.fileDetails.extension}
  MIME type:   ${type.fileDetails.mime}\n`;

                if (type?.fileDetails?.description?.length) {
                    output += `  Description: ${type.fileDetails.description}\n`;
                }
            });
        }

        if (numFound === 0) {
            output += "\nNo embedded files were found.";
        }

        return output;
    }

}

export default ScanForEmbeddedFiles;
