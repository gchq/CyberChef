/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Magic from "../lib/Magic";
import jsqr from "jsqr";
import jimp from "jimp";

/**
 * Parse QR Code operation
 */
class ParseQRCode extends Operation {

    /**
     * ParseQRCode constructor
     */
    constructor() {
        super();

        this.name = "Parse QR Code";
        this.module = "Image";
        this.description = "Reads an image file and attempts to detect and read a QR code from the image.";
        this.infoURL = "https://wikipedia.org/wiki/QR_code";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const type = Magic.magicFileType(input);
        // Make sure that the input is an image
        if (type && type.mime.indexOf("image") === 0){

            return new Promise((resolve, reject) => {
                // Read the input
                jimp.read(Buffer.from(input))
                    .then(image => {
                        image.rgba(false); // Disable RGBA (uses just RGB)

                        // Get the buffer of the new image and read it in Jimp
                        // Don't actually need the new image buffer, just need 
                        // Jimp to refresh the current object
                        image.getBuffer(image.getMIME(), (err, buffer) => {
                            jimp.read(buffer)
                                .then(newImage =>{
                                    // If the image has been read correctly, try to find a QR code
                                    if (image.bitmap != null){
                                        const qrData = jsqr(image.bitmap.data, image.getWidth(), image.getHeight());
                                        if (qrData != null) {
                                            resolve(qrData.data);
                                        } else {
                                            log.error(image.bitmap);
                                            reject(new OperationError("Error parsing QR code from image."));
                                        }
                                    } else {
                                        reject(new OperationError("Error reading the image data."));
                                    }
                                });
                        });
                    })
                    .catch(err => {
                        reject(new OperationError("Error opening the image. Are you sure this is an image file?"));
                    });
            });
        }  else {
            throw new OperationError("Invalid file type.");
        }

    }

}

export default ParseQRCode;
