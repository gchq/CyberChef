/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";

/**
 * PEM to Hex operation
 */
class PEMToHex extends Operation {

    /**
     * PEMToHex constructor
     */
    constructor() {
        super();

        this.name = "PEM to Hex";
        this.module = "PublicKey";
        this.description = "Converts PEM (Privacy Enhanced Mail) format to a hexadecimal DER (Distinguished Encoding Rules) string.";
        this.infoURL = "https://wikipedia.org/wiki/X.690#DER_encoding";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (input.indexOf("-----BEGIN") < 0) {
            // Add header so that the KEYUTIL function works
            input = "-----BEGIN CERTIFICATE-----" + input;
        }
        if (input.indexOf("-----END") < 0) {
            // Add footer so that the KEYUTIL function works
            input = input + "-----END CERTIFICATE-----";
        }
        const cert = new r.X509();
        cert.readCertPEM(input);
        return cert.hex;
    }

}

export default PEMToHex;
