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
                value: 100
            },
            {
                name: "Height",
                type: "number",
                value: 100
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
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        let width = args[0],
            height = args[1];
        const unit = args[2],
            aspect = args[3],
            type = Magic.magicFileType(input);

        if (!type || type.mime.indexOf("image") !== 0){
            throw new OperationError("Invalid file type.");
        }

        return new Promise((resolve, reject) => {
            jimp.read(Buffer.from(input))
                .then(image => {
                    if (unit === "Percent") {
                        width = image.getWidth() * (width / 100);
                        height = image.getHeight() * (height / 100);
                    }
                    if (aspect) {
                        image
                            .scaleToFit(width, height)
                            .getBuffer(jimp.AUTO, (error, result) => {
                                if (error){
                                    reject(new OperationError("Error scaling the image."));
                                } else {
                                    resolve([...result]);
                                }
                            });
                    } else {
                        image
                            .resize(width, height)
                            .getBuffer(jimp.AUTO, (error, result) => {
                                if (error){
                                    reject(new OperationError("Error scaling the image."));
                                } else {
                                    resolve([...result]);
                                }
                            });
                    }
                });
        });
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
