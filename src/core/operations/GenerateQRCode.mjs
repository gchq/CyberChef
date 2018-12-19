/**
 * @author j433866 [j433866@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import qr from "qr-image";


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
        this.module = "Default";
        this.description = "Generates a QR code from text.";
        this.infoURL = "https://en.wikipedia.org/wiki/QR_code";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {File}
     */
    run(input, args) {
        const qrImage = new Buffer(qr.imageSync(input, { type : "png" }));
        if (qrImage == null) {
            return [input];
        }
        return [...qrImage];
    }

}

export default GenerateQRCode;
