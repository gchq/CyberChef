/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { isImage } from "../lib/FileType";
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
        this.description = "Reads an image file and attempts to detect and read a Quick Response (QR) code from the image.<br><br><u>Normalise Image</u><br>Attempts to normalise the image before parsing it to improve detection of a QR code.";
        this.infoURL = "https://wikipedia.org/wiki/QR_code";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Normalise image",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [normalise] = args;

        // Make sure that the input is an image
        if (!isImage(new Uint8Array(input))) throw new OperationError("Invalid file type.");

        let image = input;

        if (normalise) {
            // Process the image to be easier to read by jsqr
            // Disables the alpha channel
            // Sets the image default background to white
            // Normalises the image colours
            // Makes the image greyscale
            // Converts image to a JPEG
            image = await new Promise((resolve, reject) => {
                jimp.read(input)
                    .then(image => {
                        image
                            .rgba(false)
                            .background(0xFFFFFFFF)
                            .normalize()
                            .greyscale()
                            .getBuffer(jimp.MIME_JPEG, (error, result) => {
                                resolve(result);
                            });
                    })
                    .catch(err => {
                        reject(new OperationError("Error reading the image file."));
                    });
            });
        }

        if (image instanceof OperationError) {
            throw image;
        }

        return new Promise((resolve, reject) => {
            jimp.read(Buffer.from(image))
                .then(image => {
                    if (image.bitmap != null) {
                        const qrData = jsqr(image.bitmap.data, image.getWidth(), image.getHeight());
                        if (qrData != null) {
                            resolve(qrData.data);
                        } else {
                            reject(new OperationError("Couldn't read a QR code from the image."));
                        }
                    } else {
                        reject(new OperationError("Error reading the image file."));
                    }
                })
                .catch(err => {
                    reject(new OperationError("Error reading the image file."));
                });
        });

    }

}

export default ParseQRCode;
