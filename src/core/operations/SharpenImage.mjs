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
 * Sharpen Image operation
 */
class SharpenImage extends Operation {

    /**
     * SharpenImage constructor
     */
    constructor() {
        super();

        this.name = "Sharpen Image";
        this.module = "Image";
        this.description = "Sharpens an image (Unsharp mask)";
        this.infoURL = "https://wikipedia.org/wiki/Unsharp_masking";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Radius",
                type: "number",
                value: 2,
                min: 1
            },
            {
                name: "Amount",
                type: "number",
                value: 1,
                min: 0,
                step: 0.1
            },
            {
                name: "Threshold",
                type: "number",
                value: 10,
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
        const [radius, amount, threshold] = args;

        if (!isImage(input)){
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
                self.sendStatusMessage("Sharpening image... (Cloning image)");
            const blurImage = image.clone();
            const blurMask = image.clone();

            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Sharpening image... (Blurring cloned image)");
            blurImage.gaussian(radius);

            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Sharpening image... (Creating unsharp mask)");
            blurMask.scan(0, 0, blurMask.bitmap.width, blurMask.bitmap.height, function(x, y, idx) {
                const blurRed = blurImage.bitmap.data[idx];
                const blurGreen = blurImage.bitmap.data[idx + 1];
                const blurBlue = blurImage.bitmap.data[idx + 2];

                const normalRed = this.bitmap.data[idx];
                const normalGreen = this.bitmap.data[idx + 1];
                const normalBlue = this.bitmap.data[idx + 2];

                // Subtract blurred pixel value from normal image
                this.bitmap.data[idx] = (normalRed > blurRed) ? normalRed - blurRed : 0;
                this.bitmap.data[idx + 1] = (normalGreen > blurGreen) ? normalGreen - blurGreen : 0;
                this.bitmap.data[idx + 2] = (normalBlue > blurBlue) ? normalBlue - blurBlue : 0;
            });

            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Sharpening image... (Merging with unsharp mask)");
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
                let maskRed = blurMask.bitmap.data[idx];
                let maskGreen = blurMask.bitmap.data[idx + 1];
                let maskBlue = blurMask.bitmap.data[idx + 2];

                const normalRed = this.bitmap.data[idx];
                const normalGreen = this.bitmap.data[idx + 1];
                const normalBlue = this.bitmap.data[idx + 2];

                // Calculate luminance
                const maskLuminance = (0.2126 * maskRed + 0.7152 * maskGreen + 0.0722 * maskBlue);
                const normalLuminance = (0.2126 * normalRed + 0.7152 * normalGreen + 0.0722 * normalBlue);

                let luminanceDiff;
                if (maskLuminance > normalLuminance) {
                    luminanceDiff = maskLuminance - normalLuminance;
                } else {
                    luminanceDiff = normalLuminance - maskLuminance;
                }

                // Scale mask colours by amount
                maskRed = maskRed * amount;
                maskGreen = maskGreen * amount;
                maskBlue = maskBlue * amount;

                // Only change pixel value if the difference is higher than threshold
                if ((luminanceDiff / 255) * 100 >= threshold) {
                    this.bitmap.data[idx] = (normalRed + maskRed) <= 255 ? normalRed + maskRed : 255;
                    this.bitmap.data[idx + 1] = (normalGreen + maskGreen) <= 255 ? normalGreen + maskGreen : 255;
                    this.bitmap.data[idx + 2] = (normalBlue + maskBlue) <= 255 ? normalBlue + maskBlue : 255;
                }
            });

            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error sharpening image. (${err})`);
        }
    }

    /**
     * Displays the sharpened image using HTML for web apps
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";

        const type = isImage(data);
        if (!type) {
            throw new OperationError("Invalid image type.");
        }

        return `<img src="data:${type};base64,${toBase64(data)}">`;
    }

}

export default SharpenImage;
