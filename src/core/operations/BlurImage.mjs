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
 * Blur Image operation
 */
class BlurImage extends Operation {

    /**
     * BlurImage constructor
     */
    constructor() {
        super();

        this.name = "Blur Image";
        this.module = "Image";
        this.description = "Applies a blur effect to the image.<br><br>Gaussian blur is much slower than fast blur, but produces better results.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Blur Amount",
                type: "number",
                value: 5
            },
            {
                name: "Blur Type",
                type: "option",
                value: ["Fast", "Gaussian"]
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [blurAmount, blurType] = args;
        const type = Magic.magicFileType(input);

        if (type && type.mime.indexOf("image") === 0){
            const image = await jimp.read(Buffer.from(input));

            switch (blurType){
                case "Fast":
                    image.blur(blurAmount);
                    break;
                case "Gaussian":
                    image.gaussian(blurAmount);
                    break;
            }

            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } else {
            throw new OperationError("Invalid file type.");
        }
    }

    /**
     * Displays the blurred image using HTML for web apps
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

export default BlurImage;
