/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {toHex} from "../lib/Hex";

/**
 * To Hex Content operation
 */
class ToHexContent extends Operation {

    /**
     * ToHexContent constructor
     */
    constructor() {
        super();

        this.name = "To Hex Content";
        this.module = "Default";
        this.description = "Converts special characters in a string to hexadecimal. This format is used by SNORT for representing hex within ASCII text.<br><br>e.g. <code>foo=bar</code> becomes <code>foo|3d|bar</code>.";
        this.infoURL = "http://manual-snort-org.s3-website-us-east-1.amazonaws.com/node32.html#SECTION00451000000000000000";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            {
                "name": "Convert",
                "type": "option",
                "value": ["Only special chars", "Only special chars including spaces", "All chars"]
            },
            {
                "name": "Print spaces between bytes",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const convert = args[0];
        const spaces = args[1];
        if (convert === "All chars") {
            let result = "|" + toHex(input) + "|";
            if (!spaces) result = result.replace(/ /g, "");
            return result;
        }

        let output = "",
            inHex = false,
            b;
        const convertSpaces = convert === "Only special chars including spaces";
        for (let i = 0; i < input.length; i++) {
            b = input[i];
            if ((b === 32 && convertSpaces) || (b < 48 && b !== 32) || (b > 57 && b < 65) || (b > 90 && b < 97) || b > 122) {
                if (!inHex) {
                    output += "|";
                    inHex = true;
                } else if (spaces) output += " ";
                output += toHex([b]);
            } else {
                if (inHex) {
                    output += "|";
                    inHex = false;
                }
                output += Utils.chr(input[i]);
            }
        }
        if (inHex) output += "|";
        return output;
    }

}

export default ToHexContent;
