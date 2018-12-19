/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import qr from "qr-image";
import { toBase64 } from "../lib/Base64";
import Magic from "../lib/Magic";

/**
 * Generate QR Code operation
 */
class GenerateQRCode extends Operation {

    /**
     * GenerateQRCode constructor
     */
    constructor() {
        super();

        this.name = "Generate QR Code";
        this.module = "QRCode";
        this.description = "Generates a QR code from text.";
        this.infoURL = "https://en.wikipedia.org/wiki/QR_code";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.presentType = "html";
        this.args = [
            {
                "name": "Image Format",
                "type": "option",
                "value": ["SVG", "PNG"]
            },
            {
                "name": "Size of QR module",
                "type": "number",
                "value": 5
            },
            {
                "name": "Margin",
                "type": "number",
                "value": 2
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {File}
     */
    run(input, args) {
        // Create new QR image from the input data, and convert it to a buffer
        const [format, size, margin] = args;
        const qrImage = qr.imageSync(input, { type: format, size: size, margin: margin });
        if (qrImage == null) {
            throw new OperationError("Error generating QR code.");
        }
        if (format === "SVG") {
            return [...Buffer.from(qrImage)];
        } else if (format === "PNG") {
            // Return the QR image buffer as a byte array
            return [...qrImage];
        } else {
            throw new OperationError("Error generating QR code.");
        }
    }

    /**
     * Displays the QR image using HTML for web apps
     * 
     * @param {byteArray} data
     * @returns {html}
     */
    present(data, args) {
        if (!data.length) return "";

        const [format] = args;
        if (format === "SVG") {
            let outputData = "";
            for (let i = 0; i < data.length; i++){
                outputData += String.fromCharCode(parseInt(data[i]));
            }
            return outputData;
        } else if (format === "PNG") {
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

}

export default GenerateQRCode;
