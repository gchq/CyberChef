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
 * Image Brightness / Contrast operation
 */
class ImageBrightnessContrast extends Operation {

    /**
     * ImageBrightnessContrast constructor
     */
    constructor() {
        super();

        this.name = "Image Brightness / Contrast";
        this.module = "Image";
        this.description = "Adjust the brightness and contrast of an image.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Brightness",
                type: "number",
                value: 0,
                min: -100,
                max: 100
            },
            {
                name: "Contrast",
                type: "number",
                value: 0,
                min: -100,
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
        const [brightness, contrast] = args;
        const type = Magic.magicFileType(input);
        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        const image = await jimp.read(Buffer.from(input));
        image.brightness(brightness / 100);
        image.contrast(contrast / 100);

        const imageBuffer = await image.getBufferAsync(jimp.AUTO);
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

export default ImageBrightnessContrast;
