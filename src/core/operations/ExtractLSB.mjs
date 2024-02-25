/**
 * @author Ge0rg3 [georgeomnet+cyberchef@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { fromBinary } from "../lib/Binary.mjs";
import { isImage } from "../lib/FileType.mjs";
import jimp from "jimp";

/**
 * Extract LSB operation
 */
class ExtractLSB extends Operation {
    /**
     * ExtractLSB constructor
     */
    constructor() {
        super();

        this.name = "Extract LSB";
        this.module = "Image";
        this.description =
            "Extracts the Least Significant Bit data from each pixel in an image. This is a common way to hide data in Steganography.";
        this.infoURL =
            "https://wikipedia.org/wiki/Bit_numbering#Least_significant_bit_in_digital_steganography";
        this.inputType = "ArrayBuffer";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Colour Pattern #1",
                type: "option",
                value: COLOUR_OPTIONS,
            },
            {
                name: "Colour Pattern #2",
                type: "option",
                value: ["", ...COLOUR_OPTIONS],
            },
            {
                name: "Colour Pattern #3",
                type: "option",
                value: ["", ...COLOUR_OPTIONS],
            },
            {
                name: "Colour Pattern #4",
                type: "option",
                value: ["", ...COLOUR_OPTIONS],
            },
            {
                name: "Pixel Order",
                type: "option",
                value: ["Row", "Column"],
            },
            {
                name: "Bit",
                type: "number",
                value: 0,
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        if (!isImage(input))
            throw new OperationError("Please enter a valid image file.");

        const bit = 7 - args.pop(),
            pixelOrder = args.pop(),
            colours = args
                .filter((option) => option !== "")
                .map((option) => COLOUR_OPTIONS.indexOf(option)),
            parsedImage = await jimp.read(input),
            width = parsedImage.bitmap.width,
            height = parsedImage.bitmap.height,
            rgba = parsedImage.bitmap.data;

        if (bit < 0 || bit > 7) {
            throw new OperationError(
                "Error: Bit argument must be between 0 and 7",
            );
        }

        let i,
            combinedBinary = "";

        if (pixelOrder === "Row") {
            for (i = 0; i < rgba.length; i += 4) {
                for (const colour of colours) {
                    combinedBinary += Utils.bin(rgba[i + colour])[bit];
                }
            }
        } else {
            let rowWidth;
            const pixelWidth = width * 4;
            for (let col = 0; col < width; col++) {
                for (let row = 0; row < height; row++) {
                    rowWidth = row * pixelWidth;
                    for (const colour of colours) {
                        i = rowWidth + (col + colour * 4);
                        combinedBinary += Utils.bin(rgba[i])[bit];
                    }
                }
            }
        }

        return fromBinary(combinedBinary);
    }
}

const COLOUR_OPTIONS = ["R", "G", "B", "A"];

export default ExtractLSB;
