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
 * Invert Image operation
 */
class InvertImage extends Operation {

    /**
     * InvertImage constructor
     */
    constructor() {
        super();

        this.name = "Invert Image";
        this.module = "Image";
        this.description = "Invert the colours of an image.";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        if (!isImage(new Uint8Array(input))) {
            throw new OperationError("Invalid input file format.");
        }

        let image;
        try {
            image = await jimp.read(input);
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Inverting image...");
            image.invert();

            let imageBuffer;
            if (image.getMIME() === "image/gif") {
                imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
            } else {
                imageBuffer = await image.getBufferAsync(jimp.AUTO);
            }
            return imageBuffer.buffer;
        } catch (err) {
            throw new OperationError(`Error inverting image. (${err})`);
        }
    }

    /**
     * Displays the inverted image using HTML for web apps
     * @param {ArrayBuffer} data
     * @returns {html}
     */
    present(data) {
        if (!data.byteLength) return "";
        const dataArray = new Uint8Array(data);

        const type = isImage(dataArray);
        if (!type) {
            throw new OperationError("Invalid file type.");
        }

        return `<img src="data:${type};base64,${toBase64(dataArray)}">`;
    }

}

export default InvertImage;
