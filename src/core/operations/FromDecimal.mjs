/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {DELIM_OPTIONS} from "../lib/Delim.mjs";
import {fromDecimal} from "../lib/Decimal.mjs";
import * as criteria from "../lib/MagicCriteria.mjs";

/**
 * From Decimal operation
 */
class FromDecimal extends Operation {

    /**
     * FromDecimal constructor
     */
    constructor() {
        super();

        this.name = "From Decimal";
        this.module = "Default";
        this.description = "Converts the data from an ordinal integer array back into its raw form.<br><br>e.g. <code>72 101 108 108 111</code> becomes <code>Hello</code>";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            },
            {
                "name": "Support signed values",
                "type": "boolean",
                "value": false
            }
        ];
        this.checks =
        {
            inRegexes: [
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?: (?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["Space", false]
                },
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:,(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["Comma", false]
                },
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:;(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["Semi-colon", false]
                },
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?::(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["Colon", false]
                },
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:\\n(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["Line feed", false]
                },
                {
                    match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:\\r\\n(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                    flags: "",
                    magic:  true,
                    args: ["CRLF", false]
                }],
            entropyTests: {
                input:  [2.5, 3],
                output: criteria.entropyOfText
            }
        };
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        let data = fromDecimal(input, args[0]);
        if (args[1]) { // Convert negatives
            data = data.map(v => v < 0 ? 0xFF + v + 1 : v);
        }
        return data;
    }

}

export default FromDecimal;
