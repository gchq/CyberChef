/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Image Dither operation
 */
class DitherImage extends Operation {

    /**
     * DitherImage constructor
     */
    constructor() {
        super();

        this.name = "Dither Image";
        this.module = "Image";
        this.description = "Apply a dither effect to an image.";
        this.infoURL = "https://wikipedia.org/wiki/Dither";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        if (!isImage(input)) {
            throw new OperationError("Invalid file type.");
        }

        let image;
        try {
            image = await jimp.read(Buffer.from(input));
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Applying dither to image...");
            image.dither565();

            let imageBuffer;
            if (image.getMIME() === "image/gif") {
                imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
            } else {
                imageBuffer = await image.getBufferAsync(jimp.AUTO);
            }
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error applying dither to image. (${err})`);
        }
    }

    /**
     * Displays the dithered image using HTML for web apps
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";

        const type = isImage(data);
        if (!type) {
            throw new OperationError("Invalid file type.");
        }

        return `<img src="data:${type};base64,${toBase64(data)}">`;
    }

}

export default DitherImage;
