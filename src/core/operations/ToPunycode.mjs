/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import punycode from "punycode";

/**
 * To Punycode operation
 */
class ToPunycode extends Operation {

    /**
     * ToPunycode constructor
     */
    constructor() {
        super();

        this.name = "To Punycode";
        this.module = "Encodings";
        this.description = "Punycode is a way to represent Unicode with the limited character subset of ASCII supported by the Domain Name System.<br><br>e.g. <code>m\xfcnchen</code> encodes to <code>mnchen-3ya</code>";
        this.infoURL = "https://wikipedia.org/wiki/Punycode";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Internationalised domain name",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const idn = args[0];

        if (idn) {
            return punycode.toASCII(input);
        } else {
            return punycode.encode(input);
        }
    }

}

export default ToPunycode;
