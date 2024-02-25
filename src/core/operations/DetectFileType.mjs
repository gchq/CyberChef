/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { detectFileType } from "../lib/FileType.mjs";
import { FILE_SIGNATURES } from "../lib/FileSignatures.mjs";

// Concat all supported extensions into a single flat list
const exts = [].concat
    .apply(
        [],
        Object.keys(FILE_SIGNATURES).map((cat) =>
            [].concat.apply(
                [],
                FILE_SIGNATURES[cat].map((sig) => sig.extension.split(","))
            )
        )
    )
    .unique()
    .sort()
    .join(", ");

/**
 * Detect File Type operation
 */
class DetectFileType extends Operation {
    /**
     * DetectFileType constructor
     */
    constructor() {
        super();

        this.name = "Detect File Type";
        this.module = "Default";
        this.description
            = "Attempts to guess the MIME (Multipurpose Internet Mail Extensions) type of the data based on 'magic bytes'.<br><br>Currently supports the following file types: "
            + exts
            + ".";
        this.infoURL = "https://wikipedia.org/wiki/List_of_file_signatures";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = Object.keys(FILE_SIGNATURES).map((cat) => {
            return {
                name: cat,
                type: "boolean",
                value: true
            };
        });
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const data = new Uint8Array(input),
            categories = [];

        args.forEach((cat, i) => {
            if (cat) categories.push(Object.keys(FILE_SIGNATURES)[i]);
        });

        const types = detectFileType(data, categories);

        if (!types.length) {
            return "Unknown file type. Have you tried checking the entropy of this data to determine whether it might be encrypted or compressed?";
        } else {
            const results = types.map((type) => {
                let output = `File type:   ${type.name}
Extension:   ${type.extension}
MIME type:   ${type.mime}\n`;

                if (type?.description?.length) {
                    output += `Description: ${type.description}\n`;
                }

                return output;
            });

            return results.join("\n");
        }
    }
}

export default DetectFileType;
