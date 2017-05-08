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
    runEXIF(input, args) {
        try {
            let bytes = Uint8Array.from(input);
            let parser = ExifParser.create(bytes.buffer);
            let result = parser.parse();

            let lines = [];
            for (let tagName in result.tags) {
                let value = result.tags[tagName];
                lines.push(`${tagName}: ${value}`);
            }

            let numTags = lines.length;
            lines.unshift(`Found ${numTags} tags.\n`);
            return lines.join("\n");
        } catch (err) {
            throw "Could not extract EXIF data from image: " + err;
        }
    },
};

export default Image;
