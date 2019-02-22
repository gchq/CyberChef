/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { removeEXIF } from "../vendor/remove-exif";
import Operation from "../Operation";
import OperationError from "../errors/OperationError";

/**
 * Remove EXIF operation
 */
class RemoveEXIF extends Operation {

    /**
     * RemoveEXIF constructor
     */
    constructor() {
        super();

        this.name = "Remove EXIF";
        this.module = "Image";
        this.description = [
            "Removes EXIF data from a JPEG image.",
            "<br><br>",
            "EXIF data embedded in photos usually contains information about the image file itself as well as the device used to create it.",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Exif";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        // Do nothing if input is empty
        if (input.length === 0) return input;

        try {
            return removeEXIF(input);
        } catch (err) {
            // Simply return input if no EXIF data is found
            if (err === "Exif not found.") return input;
            throw new OperationError(`Could not remove EXIF data from image: ${err}`);
        }
    }

}

export default RemoveEXIF;
