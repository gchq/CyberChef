/**
 * @author pointhi [thomas.pointhuber@gmx.at]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import { Jimp, JimpMime, ResizeStrategy, rgbaToInt } from "jimp";

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
        this.description =
            "Generates an image using the input as pixel values.";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "Mode",
                type: "option",
                value: ["Greyscale", "RG", "RGB", "RGBA", "Bits"],
            },
            {
                name: "Pixel Scale Factor",
                type: "number",
                value: 8,
            },
            {
                name: "Pixels per row",
                type: "number",
                value: 64,
            },
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    async run(input, args) {
        const [mode, scale, width] = args;
        input = new Uint8Array(input);

        if (scale <= 0) {
            throw new OperationError("Pixel Scale Factor needs to be > 0");
        }

        if (width <= 0) {
            throw new OperationError("Pixels per Row needs to be > 0");
        }

        const bytePerPixelMap = {
            Greyscale: 1,
            RG: 2,
            RGB: 3,
            RGBA: 4,
            Bits: 1 / 8,
        };

        const bytesPerPixel = bytePerPixelMap[mode];

        if (bytesPerPixel > 0 && input.length % bytesPerPixel !== 0) {
            throw new OperationError(
                `Number of bytes is not a divisor of ${bytesPerPixel}`,
            );
        }

        const height = Math.ceil(input.length / bytesPerPixel / width);
        const image = new Jimp({ width, height });

        if (isWorkerEnvironment())
            self.sendStatusMessage("Generating image from data...");

        if (mode === "Bits") {
            let index = 0;
            for (let j = 0; j < input.length; j++) {
                const curByte = Utils.bin(input[j]);
                for (let k = 0; k < 8; k++, index++) {
                    const x = index % width;
                    const y = Math.floor(index / width);

                    const value = curByte[k] === "0" ? 0xff : 0x00;
                    const pixel = rgbaToInt(value, value, value, 0xff);
                    image.setPixelColor(pixel, x, y);
                }
            }
        } else {
            let i = 0;
            while (i < input.length) {
                const index = i / bytesPerPixel;
                const x = index % width;
                const y = Math.floor(index / width);

                let red = 0x00;
                let green = 0x00;
                let blue = 0x00;
                let alpha = 0xff;

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
                    const pixel = rgbaToInt(red, green, blue, alpha);
                    image.setPixelColor(pixel, x, y);
                } catch (err) {
                    throw new OperationError(
                        `Error while generating image from pixel values. (${err})`,
                    );
                }
            }
        }

        if (scale !== 1) {
            if (isWorkerEnvironment())
                self.sendStatusMessage("Scaling image...");

            image.scaleToFit({
                w: width * scale,
                h: height * scale,
                mode: ResizeStrategy.NEAREST_NEIGHBOR,
            });
        }

        try {
            const imageBuffer = await image.getBuffer(JimpMime.png);
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
