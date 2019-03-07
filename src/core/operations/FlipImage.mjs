/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Flip Image operation
 */
class FlipImage extends Operation {

    /**
     * FlipImage constructor
     */
    constructor() {
        super();

        this.name = "Flip Image";
        this.module = "Image";
        this.description = "Flips an image along its X or Y axis.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType="html";
        this.args = [
            {
                name: "Flip Axis",
                type: "option",
                value: ["Horizontal", "Vertical"]
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    async run(input, args) {
        const [flipAxis] = args;
        const type = Magic.magicFileType(input);
        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid input file type.");
        }

        const image = await jimp.read(Buffer.from(input));

        if (ENVIRONMENT_IS_WORKER())
            self.sendStatusMessage("Flipping image...");
        switch (flipAxis){
            case "Horizontal":
                image.flip(true, false);
                break;
            case "Vertical":
                image.flip(false, true);
                break;
        }

        const imageBuffer = await image.getBufferAsync(jimp.AUTO);
        return [...imageBuffer];
    }

    /**
     * Displays the flipped image using HTML for web apps
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
            throw new OperationError("Invalid file type.");
        }
        dataURI += "base64," + toBase64(data);

        return "<img src='" + dataURI + "'>";

    }

}

export default FlipImage;
