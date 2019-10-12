/**
 * @author pointhi [thomas.pointhuber@gmx.at]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {isImage} from "../lib/FileType";
import {toBase64} from "../lib/Base64";
import jimp from "jimp";

/**
 * Generate Image operation
 */
class GenerateImage extends Operation {

    /**
     * GenerateImage constructor
     */
    constructor() {
        super();

        this.name = "Generate Image";
        this.module = "Image";
        this.description = "Generate a Image using the input as pixel values.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                "name": "Mode",
                "type": "option",
                "value": ["Greyscale", "RG", "RGB", "RGBA"]
            },
            {
                "name": "Pixel Scale Factor",
                "type": "number",
                "value": 8,
            },
            {
                "name": "Pixels per Row",
                "type": "number",
                "value": 64,
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        const mode = args[0];
        const scale = args[1];
        const width = args[2];

        if (scale  <= 0) {
            throw new OperationError("Pixel Scale Factor needs to be > 0");
        }

        if (width  <= 0) {
            throw new OperationError("Pixels per Row needs to be > 0");
        }

        const bytePerPixelMap = {
            "Greyscale": 1,
            "RG": 2,
            "RGB": 3,
            "RGBA": 4,
        };

        const bytesPerPixel = bytePerPixelMap[mode];

        if (input.length % bytesPerPixel  !== 0) {
            throw new OperationError(`Number of bytes is not a divisor of ${bytesPerPixel}`);
        }

        const height = Math.ceil(input.length / bytesPerPixel / width);
        const image = await new jimp(width, height, (err, image) => {});


        let i = 0;
        while (i < input.length) {
            const index = i/bytesPerPixel;
            const x = index % width;
            const y = Math.floor(index / width);

            let red = 0x00;
            let green = 0x00;
            let blue = 0x00;
            let alpha = 0xFF;

            switch (mode) {
                case "Greyscale":
                    red = green = blue = input[i++];
                    break;

                case "RG":
                    red = input[i++];
                    green = input[i++];
                    break;

                case "RGB":
                    red = input[i++];
                    green = input[i++];
                    blue = input[i++];
                    break;

                case "RGBA":
                    red = input[i++];
                    green = input[i++];
                    blue = input[i++];
                    alpha = input[i++];
                    break;

                default:
                    throw new OperationError(`Unsupported Mode: (${mode})`);
            }

            try {
                const pixel = jimp.rgbaToInt(red, green, blue, alpha);
                image.setPixelColor(pixel, x, y);
            } catch (err) {
                throw new OperationError(`Error while generating image from pixel values. (${err})`);
            }
        }

        if (scale !== 1) {
            image.scaleToFit(width*scale, height*scale, jimp.RESIZE_NEAREST_NEIGHBOR);
        }

        try {
            const imageBuffer = await image.getBufferAsync(jimp.MIME_PNG);
            return imageBuffer.buffer;
        } catch (err) {
            throw new OperationError(`Error generating image. (${err})`);
        }
    }

    /**
     * Displays the generated image using HTML for web apps
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

export default GenerateImage;
