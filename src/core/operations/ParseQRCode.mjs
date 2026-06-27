/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { isImage } from "../lib/FileType.mjs";
import { parseQrCode } from "../lib/QRCode.mjs";

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
        this.description =
            "Reads an image file and attempts to detect and read a Quick Response (QR) code from the image.<br><br><u>Normalise Image</u><br>Attempts to normalise the image before parsing it to improve detection of a QR code.";
        this.infoURL = "https://wikipedia.org/wiki/QR_code";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Normalise image",
                type: "boolean",
                value: false,
            },
        ];
        // No Magic checks: detecting a QR code in arbitrary image data requires
        // actually attempting to parse one, which is expensive and produces
        // spurious "Could not read a QR code from the image" log messages for
        // any image input via Magic. Users can add Parse QR Code manually when
        // they know the image contains a QR code. See issue #2610.
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [normalise] = args;

        if (!isImage(input)) {
            throw new OperationError("Invalid file type.");
        }
        return parseQrCode(input, normalise);
    }
}

export default ParseQRCode;
