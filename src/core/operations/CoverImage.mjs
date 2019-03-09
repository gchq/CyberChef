/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64.mjs";
import jimp from "jimp";

/**
 * Cover Image operation
 */
class CoverImage extends Operation {

    /**
     * CoverImage constructor
     */
    constructor() {
        super();

        this.name = "Cover Image";
        this.module = "Image";
        this.description = "Scales the image to the given width and height, keeping the aspect ratio. The image may be clipped.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "Width",
                type: "number",
                value: 100,
                min: 1
            },
            {
                name: "Height",
                type: "number",
                value: 100,
                min: 1
            },
            {
                name: "Horizontal align",
                type: "option",
                value: [
                    "Left",
                    "Center",
                    "Right"
                ],
                defaultIndex: 1
            },
            {
                name: "Vertical align",
                type: "option",
                value: [
                    "Top",
                    "Middle",
                    "Bottom"
                ],
                defaultIndex: 1
            },
            {
                name: "Resizing algorithm",
                type: "option",
                value: [
                    "Nearest Neighbour",
                    "Bilinear",
                    "Bicubic",
                    "Hermite",
                    "Bezier"
                ],
                defaultIndex: 1
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [width, height, hAlign, vAlign, alg] = args;

        const resizeMap = {
            "Nearest Neighbour": jimp.RESIZE_NEAREST_NEIGHBOR,
            "Bilinear": jimp.RESIZE_BILINEAR,
            "Bicubic": jimp.RESIZE_BICUBIC,
            "Hermite": jimp.RESIZE_HERMITE,
            "Bezier": jimp.RESIZE_BEZIER
        };

        const alignMap = {
            "Left": jimp.HORIZONTAL_ALIGN_LEFT,
            "Center": jimp.HORIZONTAL_ALIGN_CENTER,
            "Right": jimp.HORIZONTAL_ALIGN_RIGHT,
            "Top": jimp.VERTICAL_ALIGN_TOP,
            "Middle": jimp.VERTICAL_ALIGN_MIDDLE,
            "Bottom": jimp.VERTICAL_ALIGN_BOTTOM
        };

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
            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage("Covering image...");
            image.cover(width, height, alignMap[hAlign] | alignMap[vAlign], resizeMap[alg]);
            const imageBuffer = await image.getBufferAsync(jimp.AUTO);
            return [...imageBuffer];
        } catch (err) {
            throw new OperationError(`Error covering image. (${err})`);
        }
    }

    /**
     * Displays the covered image using HTML for web apps
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

export default CoverImage;
