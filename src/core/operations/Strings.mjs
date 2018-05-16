/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import XRegExp from "xregexp";
import { search } from "../lib/Extract";

/**
 * Strings operation
 */
class Strings extends Operation {

    /**
     * Strings constructor
     */
    constructor() {
        super();

        this.name = "Strings";
        this.module = "Regex";
        this.description = "Extracts all strings from the input.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Encoding",
                "type": "option",
                "value": ["Single byte", "16-bit littleendian", "16-bit bigendian", "All"]
            },
            {
                "name": "Minimum length",
                "type": "number",
                "value": 4
            },
            {
                "name": "Match",
                "type": "option",
                "value": [
                    "[ASCII]", "Alphanumeric + punctuation (A)", "All printable chars (A)", "Null-terminated strings (A)",
                    "[Unicode]", "Alphanumeric + punctuation (U)", "All printable chars (U)", "Null-terminated strings (U)"
                ]
            },
            {
                "name": "Display total",
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
        const [encoding, minLen, matchType, displayTotal] = args,
            alphanumeric = "A-Z\\d",
            punctuation = "/\\-:.,_$%'\"()<>= !\\[\\]{}@",
            printable = "\x20-\x7e",
            uniAlphanumeric = "\\pL\\pN",
            uniPunctuation = "\\pP\\pZ",
            uniPrintable = "\\pL\\pM\\pZ\\pS\\pN\\pP";

        let strings = "";

        switch (matchType) {
            case "Alphanumeric + punctuation (A)":
                strings = `[${alphanumeric + punctuation}]`;
                break;
            case "All printable chars (A)":
            case "Null-terminated strings (A)":
                strings = `[${printable}]`;
                break;
            case "Alphanumeric + punctuation (U)":
                strings = `[${uniAlphanumeric + uniPunctuation}]`;
                break;
            case "All printable chars (U)":
            case "Null-terminated strings (U)":
                strings = `[${uniPrintable}]`;
                break;
        }

        // UTF-16 support is hacked in by allowing null bytes on either side of the matched chars
        switch (encoding) {
            case "All":
                strings = `(\x00?${strings}\x00?)`;
                break;
            case "16-bit littleendian":
                strings = `(${strings}\x00)`;
                break;
            case "16-bit bigendian":
                strings = `(\x00${strings})`;
                break;
            case "Single byte":
            default:
                break;
        }

        strings = `${strings}{${minLen},}`;

        if (matchType.includes("Null-terminated")) {
            strings += "\x00";
        }

        const regex = new XRegExp(strings, "ig");

        return search(input, regex, null, displayTotal);
    }

}

export default Strings;
