/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import ExifParser from "exif-parser";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Extract EXIF operation
 */
class ExtractEXIF extends Operation {
    /**
     * ExtractEXIF constructor
     */
    constructor() {
        super();

        this.name = "Extract EXIF";
        this.module = "Image";
        this.description = [
            "Extracts EXIF data from an image.",
            "<br><br>",
            "EXIF data is metadata embedded in images (JPEG, JPG, TIFF) and audio files.",
            "<br><br>",
            "EXIF data from photos usually contains information about the image file itself as well as the device used to create it.",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Exif";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const parser = ExifParser.create(input);
            const result = parser.parse();

            const lines = [];
            for (const tagName in result.tags) {
                const value = result.tags[tagName];
                lines.push(`${tagName}: ${value}`);
            }

            const numTags = lines.length;
            lines.unshift(`Found ${numTags} tags.\n`);
            return lines.join("\n");
        } catch (err) {
            throw new OperationError(
                `Could not extract EXIF data from image: ${err}`,
            );
        }
    }
}

export default ExtractEXIF;
