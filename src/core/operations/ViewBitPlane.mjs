/**
 * @author Ge0rg3 [georgeomnet+cyberchef@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Utils from "../Utils";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * View Bit Plane operation
 */
class ViewBitPlane extends Operation {

    /**
     * ViewBitPlane constructor
     */
    constructor() {
        super();

        this.name = "View Bit Plane";
        this.module = "Image";
        this.description = "Extracts and displays a bit plane of any given image. These show only a single bit from each pixel, and so are often used to hide messages in Steganography.";
        this.infoURL = "https://wikipedia.org/wiki/Bit_plane";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Colour",
                type: "option",
                value: COLOUR_OPTIONS
            },
            {
                name: "Bit",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * @param {File} input
     * @param {Object[]} args
     * @returns {File}
     */
    async run(input, args) {
        if (!isImage(input)) throw new OperationError("Please enter a valid image file.");

        const [colour, bit] = args,
            parsedImage = await jimp.read(Buffer.from(input)),
            width = parsedImage.bitmap.width,
            height = parsedImage.bitmap.height,
            colourIndex = COLOUR_OPTIONS.indexOf(colour),
            bitIndex = 7-bit;

        if (bit < 0 || bit > 7) {
            throw new OperationError("Error: Bit argument must be between 0 and 7");
        }

        parsedImage.rgba(true);

        let pixel, bin, newPixelValue;

        parsedImage.scan(0, 0, width, height, function(x, y, idx) {
            pixel = this.bitmap.data[idx + colourIndex];
            bin = Utils.bin(pixel);
            newPixelValue = 255;

            if (bin.charAt(bitIndex) === "1") newPixelValue = 0;

            for (let i=0; i < 4; i++) {
                this.bitmap.data[idx + i] = newPixelValue;
            }
        });

        const imageBuffer = await parsedImage.getBufferAsync(jimp.AUTO);

        return Array.from(imageBuffer);
    }

    /**
     * Displays the extracted data as an image for web apps.
     * @param {byteArray} data
     * @returns {html}
     */
    present(data) {
        if (!data.length) return "";
        const type = isImage(data);

        return `<img src="data:${type};base64,${toBase64(data)}">`;
    }

}

const COLOUR_OPTIONS = [
    "Red",
    "Green",
    "Blue",
    "Alpha"
];

export default ViewBitPlane;
