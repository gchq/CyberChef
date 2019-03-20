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
 * Normalise Image operation
 */
class NormaliseImage extends Operation {

    /**
     * NormaliseImage constructor
     */
    constructor() {
        super();

        this.name = "Normalise Image";
        this.module = "Image";
        this.description = "Normalise the image colours.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType=  "html";
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
            throw new OperationError(`Error opening image file. (${err})`);
        }

        try {
            image.normalize();

            let imageBuffer;
            if (image.getMIME() === "image/gif") {
                imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
            } else {
                imageBuffer = await image.getBufferAsync(jimp.AUTO);
            }
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error normalising image. (${err})`);
        }
    }

    /**
     * Displays the normalised image using HTML for web apps
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

export default NormaliseImage;
