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
 * Image Dither operation
 */
class DitherImage extends Operation {

    /**
     * DitherImage constructor
     */
    constructor() {
        super();

        this.name = "Dither Image";
        this.module = "Image";
        this.description = "Apply a dither effect to an image.";
        this.infoURL = "https://wikipedia.org/wiki/Dither";
        this.inputType = "byteArray";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const type = Magic.magicFileType(input);

        if (type && type.mime.indexOf("image") === 0){
            return new Promise((resolve, reject) => {
                jimp.read(Buffer.from(input))
                    .then(image => {
                        image
                            .dither565()
                            .getBuffer(jimp.AUTO, (error, result) => {
                                if (error){
                                    reject(new OperationError("Error getting the new image buffer"));
                                } else {
                                    resolve([...result]);
                                }
                            });
                    })
                    .catch(err => {
                        reject(new OperationError("Error applying a dither effect to the image."));
                    });
            });
        } else {
            throw new OperationError("Invalid file type.");
        }
    }

    /**
     * Displays the dithered image using HTML for web apps
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

export default DitherImage;
