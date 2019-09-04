/**
 * @author Ge0rg3 [georgeomnet+cyberchef@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils";
import PseudoRandomNumberGenerator from "./PseudoRandomNumberGenerator.mjs";
import { isImage } from "../lib/FileType";
import { runHash } from "../lib/Hash.mjs";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Randomize Colour Palette operation
 */
class RandomizeColourPalette extends Operation {

    /**
     * RandomizeColourPalette constructor
     */
    constructor() {
        super();

        this.name = "Randomize Colour Palette";
        this.module = "Image";
        this.description = "Randomize's each colour in an image's colour palette. This can often reveal text or symbols that were previously a very similar colour to their surroundings.";
        this.infoURL = "https://en.wikipedia.org/wiki/Indexed_color";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Seed",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        if (!isImage(input)) throw new OperationError("Please enter a valid image file.");

        const seed = args[0] || (new PseudoRandomNumberGenerator()).run("", [5, "Hex"]),
            parsedImage = await jimp.read(Buffer.from(input)),
            width = parsedImage.bitmap.width,
            height = parsedImage.bitmap.height;

        let rgbString, rgbHash, rgbHex;

        parsedImage.scan(0, 0, width, height, function(x, y, idx) {
            rgbString = this.bitmap.data.slice(idx, idx+3).join(".");
            rgbHash = runHash("md5", Utils.strToArrayBuffer(seed + rgbString));
            rgbHex = rgbHash.substr(0, 6) + "ff";
            parsedImage.setPixelColor(parseInt(rgbHex, 16), x, y);
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

export default RandomizeColourPalette;
