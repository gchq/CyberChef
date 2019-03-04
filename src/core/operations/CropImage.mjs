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
 * Crop Image operation
 */
class CropImage extends Operation {

    /**
     * CropImage constructor
     */
    constructor() {
        super();

        this.name = "Crop Image";
        this.module = "Image";
        this.description = "Crops an image to the specified region, or automatically crop edges.<br><br><b><u>Autocrop</u></b><br>Automatically crops same-colour borders from the image.<br><br><u>Autocrop tolerance</u><br>A percentage value for the tolerance of colour difference between pixels.<br><br><u>Only autocrop frames</u><br>Only crop real frames (all sides must have the same border)<br><br><u>Symmetric autocrop</u><br>Force autocrop to be symmetric (top/bottom and left/right are cropped by the same amount)<br><br><u>Autocrop keep border</u><br>The number of pixels of border to leave around the image.";
        this.infoURL = "https://wikipedia.org/wiki/Cropping_(image)";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                name: "X Position",
                type: "number",
                value: 0,
                min: 0
            },
            {
                name: "Y Position",
                type: "number",
                value: 0,
                min: 0
            },
            {
                name: "Width",
                type: "number",
                value: 10,
                min: 1
            },
            {
                name: "Height",
                type: "number",
                value: 10,
                min: 1
            },
            {
                name: "Autocrop",
                type: "boolean",
                value: false
            },
            {
                name: "Autocrop tolerance (%)",
                type: "number",
                value: 0.02,
                min: 0,
                max: 100,
                step: 0.01
            },
            {
                name: "Only autocrop frames",
                type: "boolean",
                value: true
            },
            {
                name: "Symmetric autocrop",
                type: "boolean",
                value: false
            },
            {
                name: "Autocrop keep border (px)",
                type: "number",
                value: 0,
                min: 0
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        // const [firstArg, secondArg] = args;
        const [xPos, yPos, width, height, autocrop, autoTolerance, autoFrames, autoSymmetric, autoBorder] = args;
        const type = Magic.magicFileType(input);
        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        const image = await jimp.read(Buffer.from(input));
        if (autocrop) {
            image.autocrop({
                tolerance: (autoTolerance / 100),
                cropOnlyFrames: autoFrames,
                cropSymmetric: autoSymmetric,
                leaveBorder: autoBorder
            });
        } else {
            image.crop(xPos, yPos, width, height);
        }

        const imageBuffer = await image.getBufferAsync(jimp.AUTO);
        return [...imageBuffer];
    }

    /**
     * Displays the cropped image using HTML for web apps
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

export default CropImage;
