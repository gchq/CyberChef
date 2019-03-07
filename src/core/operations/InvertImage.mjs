/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
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
        const type = Magic.magicFileType(input);
        if (!type || type.mime.indexOf("image") !== 0) {
            throw new OperationError("Invalid input file format.");
        }

        let image;
        try {
            image = await jimp.read(Buffer.from(input));
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Inverting image...");
            image.invert();
            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error inverting image. (${err})`);
        }
    }

    /**
     * Displays the inverted image using HTML for web apps
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";

        let dataURI = "data:";
        const type = Magic.magicFileType(data);
        if (type && type.mime.indexOf("image") === 0){
            dataURI += type.mime + ";";
        } else {
            throw new OperationError("Invalid file type.");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";

    }

}

export default InvertImage;
