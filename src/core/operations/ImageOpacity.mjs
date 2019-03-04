/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64.mjs";
import jimp from "jimp";

/**
 * Image Opacity operation
 */
class ImageOpacity extends Operation {

    /**
     * ImageOpacity constructor
     */
    constructor() {
        super();

        this.name = "Image Opacity";
        this.module = "Image";
        this.description = "Adjust the opacity of an image.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Opacity (%)",
                type: "number",
                value: 100,
                min: 0,
                max: 100
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [opacity] = args;
        const type = Magic.magicFileType(input);
        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        const image = await jimp.read(Buffer.from(input));
        image.opacity(opacity / 100);

        const imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
        return [...imageBuffer];
    }

    /**
     * Displays the image using HTML for web apps
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
            throw new OperationError("Invalid file type");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";
    }

}

export default ImageOpacity;
