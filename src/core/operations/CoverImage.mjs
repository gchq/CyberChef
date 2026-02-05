/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { toBase64 } from "../lib/Base64.mjs";
import { isWorkerEnvironment } from "../Utils.mjs";
import {
    Jimp,
    JimpMime,
    ResizeStrategy,
    HorizontalAlign,
    VerticalAlign,
} from "jimp";

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
        this.description =
            "Scales the image to the given width and height, keeping the aspect ratio. The image may be clipped.";
        this.infoURL = "";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.presentType = "html";
        this.args = [
            {
                name: "Width",
                type: "number",
                value: 100,
                min: 1,
            },
            {
                name: "Height",
                type: "number",
                value: 100,
                min: 1,
            },
            {
                name: "Horizontal align",
                type: "option",
                value: ["Left", "Center", "Right"],
                defaultIndex: 1,
            },
            {
                name: "Vertical align",
                type: "option",
                value: ["Top", "Middle", "Bottom"],
                defaultIndex: 1,
            },
            {
                name: "Resizing algorithm",
                type: "option",
                value: [
                    "Nearest Neighbour",
                    "Bilinear",
                    "Bicubic",
                    "Hermite",
                    "Bezier",
                ],
                defaultIndex: 1,
            },
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [width, height, hAlign, vAlign, alg] = args;

        const resizeMap = {
            "Nearest Neighbour": ResizeStrategy.NEAREST_NEIGHBOR,
            Bilinear: ResizeStrategy.BILINEAR,
            Bicubic: ResizeStrategy.BICUBIC,
            Hermite: ResizeStrategy.HERMITE,
            Bezier: ResizeStrategy.BEZIER,
        };

        const alignMap = {
            Left: HorizontalAlign.LEFT,
            Center: HorizontalAlign.CENTER,
            Right: HorizontalAlign.RIGHT,
            Top: VerticalAlign.TOP,
            Middle: VerticalAlign.MIDDLE,
            Bottom: VerticalAlign.BOTTOM,
        };

        if (!isImage(input)) {
            throw new OperationError("Invalid file type.");
        }

        let image;
        try {
            image = await Jimp.read(input);
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (isWorkerEnvironment())
                self.sendStatusMessage("Covering image...");
            image.cover({
                width,
                height,
                align: alignMap[hAlign] | alignMap[vAlign],
                mode: resizeMap[alg],
            });
            let imageBuffer;
            if (image.mime === "image/gif") {
                imageBuffer = await image.getBuffer(JimpMime.png);
            } else {
                imageBuffer = await image.getBuffer(image.mime);
            }
            return imageBuffer.buffer;
        } catch (err) {
            throw new OperationError(`Error covering image. (${err})`);
        }
    }

    /**
     * Displays the covered image using HTML for web apps
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

export default CoverImage;
