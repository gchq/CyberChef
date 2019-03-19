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
import { gaussianBlur } from "../lib/ImageManipulation";

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
        this.infoURL = "https://wikipedia.org/wiki/Gaussian_blur";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Amount",
                type: "number",
                value: 5,
                min: 1
            },
            {
                name: "Type",
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
            switch (blurType){
                case "Fast":
                    if (ENVIRONMENT_IS_WORKER())
                        self.sendStatusMessage("Fast blurring image...");
                    image.blur(blurAmount);
                    break;
                case "Gaussian":
                    if (ENVIRONMENT_IS_WORKER())
                        self.sendStatusMessage("Gaussian blurring image...");
                    image = gaussianBlur(image, blurAmount);
                    break;
            }

            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error blurring image. (${err})`);
        }
    }

    /**
     * Displays the blurred image using HTML for web apps
     *
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

export default BlurImage;
