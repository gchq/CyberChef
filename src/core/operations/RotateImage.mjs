/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import { toBase64 } from "../lib/Base64";
import jimp from "jimp";

/**
 * Rotate Image operation
 */
class RotateImage extends Operation {

    /**
     * RotateImage constructor
     */
    constructor() {
        super();

        this.name = "Rotate Image";
        this.module = "Image";
        this.description = "Rotates an image by the specified number of degrees.";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                "name": "Rotation amount (degrees)",
                "type": "number",
                "value": 90
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const [degrees] = args;
        const type = Magic.magicFileType(input);

        if (type && type.mime.indexOf("image") === 0){
            return new Promise((resolve, reject) => {
                jimp.read(Buffer.from(input))
                    .then(image => {
                        image
                            .rotate(degrees)
                            .getBuffer(jimp.AUTO, (error, result) => {
                                if (error){
                                    reject(new OperationError("Error getting the new image buffer"));
                                } else {
                                    resolve([...result]);
                                }
                            });
                    })
                    .catch(err => {
                        reject(new OperationError("Error reading the input image."));
                    });
            });
        } else {
            throw new OperationError("Invalid file type.");
        }
    }

    /**
     * Displays the rotated image using HTML for web apps
     * 
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

export default RotateImage;
