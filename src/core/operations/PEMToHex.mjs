/**
 * @author n1474335 [n1474335@gmail.com]
 * @author cplussharp
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { fromBase64 } from "../lib/Base64.mjs";
import { toHexFast } from "../lib/Hex.mjs";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.module = "Default";
        this.description = "Converts PEM (Privacy Enhanced Mail) format to a hexadecimal DER (Distinguished Encoding Rules) string.";
        this.infoURL = "https://wikipedia.org/wiki/Privacy-Enhanced_Mail#Format";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                "pattern": "----BEGIN ([A-Z][A-Z ]+[A-Z])-----",
                "args": []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const output = [];
        let match;
        const regex = /-----BEGIN ([A-Z][A-Z ]+[A-Z])-----/g;
        while ((match = regex.exec(input)) !== null) {
            // find corresponding end tag
            const indexBase64 = match.index + match[0].length;
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`PEM footer '${footer}' not found`);
            }

            // decode base64 content
            const base64 = input.substring(indexBase64, indexFooter);
            const bytes = fromBase64(base64, "A-Za-z0-9+/=", "byteArray", true);
            const hex = toHexFast(bytes);
            output.push(hex);
        }
        return output.join("\n");
    }

}

export default PEMToHex;
