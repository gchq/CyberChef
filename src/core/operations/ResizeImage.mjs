/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64.mjs";
import jimp from "jimp";

/**
 * Resize Image operation
 */
class ResizeImage extends Operation {

    /**
     * ResizeImage constructor
     */
    constructor() {
        super();

        this.name = "Resize Image";
        this.module = "Image";
        this.description = "Resizes an image to the specified width and height values.";
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
                name: "Unit type",
                type: "option",
                value: ["Pixels", "Percent"]
            },
            {
                name: "Maintain aspect ratio",
                type: "boolean",
                value: false
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
        let width = args[0],
            height = args[1];
        const unit = args[2],
            aspect = args[3],
            resizeAlg = args[4],
            type = Magic.magicFileType(input);

        const resizeMap = {
            "Nearest Neighbour": jimp.RESIZE_NEAREST_NEIGHBOR,
            "Bilinear": jimp.RESIZE_BILINEAR,
            "Bicubic": jimp.RESIZE_BICUBIC,
            "Hermite": jimp.RESIZE_HERMITE,
            "Bezier": jimp.RESIZE_BEZIER
        };
        
        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }
        const image = await jimp.read(Buffer.from(input));

        if (unit === "Percent") {
            width = image.getWidth() * (width / 100);
            height = image.getHeight() * (height / 100);
        }
        if (aspect) {
            image.scaleToFit(width, height, resizeMap[resizeAlg]);
        } else {
            image.resize(width, height, resizeMap[resizeAlg]);
        }

        const imageBuffer = await image.getBufferAsync(jimp.AUTO);
        return [...imageBuffer];
    }

    /**
     * Displays the resized image using HTML for web apps
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
            throw new OperationError("Invalid file type");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";
    }

}

export default ResizeImage;
