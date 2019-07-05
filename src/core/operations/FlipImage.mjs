/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
import { toBase64 } from "../lib/Base64";
import { isWorkerEnvironment } from "../Utils";
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
        this.presentType = "html";
        this.args = [
            {
                name: "Axis",
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
        if (!isImage(input)) {
            throw new OperationError("Invalid input file type.");
        }

        let image;
        try {
            image = await jimp.read(Buffer.from(input));
        } catch (err) {
            throw new OperationError(`Error loading image. (${err})`);
        }
        try {
            if (isWorkerEnvironment())
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
        } catch (err) {
            throw new OperationError(`Error flipping image. (${err})`);
        }
    }

    /**
     * Displays the flipped image using HTML for web apps
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

export default FlipImage;
