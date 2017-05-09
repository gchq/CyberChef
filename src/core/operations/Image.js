import * as ExifParser from "exif-parser";
import Utils from "../Utils.js";


/**
 * Image operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const Image = {
    /**
     * Extract EXIF operation.
     *
     * Extracts EXIF data from a byteArray, representing a JPG or a TIFF image.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEXIF(input, args) {
        try {
            const bytes = Uint8Array.from(input);
            const parser = ExifParser.create(bytes.buffer);
            const result = parser.parse();

            let lines = [];
            for (let tagName in result.tags) {
                let value = result.tags[tagName];
                lines.push(`${tagName}: ${value}`);
            }

            const numTags = lines.length;
            lines.unshift(`Found ${numTags} tags.\n`);
            return lines.join("\n");
        } catch (err) {
            throw "Could not extract EXIF data from image: " + err;
        }
    },
};

export default Image;
