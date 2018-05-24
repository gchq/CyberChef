/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {DELIM_OPTIONS} from "../lib/Delim";

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
            }
        ];
        this.patterns = [
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?: (?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["Space"]
            },
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:,(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["Comma"]
            },
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:;(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["Semi-colon"]
            },
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?::(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["Colon"]
            },
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:\\n(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["Line feed"]
            },
            {
                match: "^(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5])(?:\\r\\n(?:\\d{1,2}|1\\d{2}|2[0-4]\\d|25[0-5]))*$",
                flags: "",
                args: ["CRLF"]
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]),
            output = [];
        let byteStr = input.split(delim);
        if (byteStr[byteStr.length-1] === "")
            byteStr = byteStr.slice(0, byteStr.length-1);

        for (let i = 0; i < byteStr.length; i++) {
            output[i] = parseInt(byteStr[i], 10);
        }
        return output;
    }

}

export default FromDecimal;
