/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * From Octal operation
 */
class FromOctal extends Operation {
    /**
     * FromOctal constructor
     */
    constructor() {
        super();

        this.name = "From Octal";
        this.module = "Default";
        this.description
            = "Converts an octal byte string back into its raw value.<br><br>e.g. <code>316 223 316 265 316 271 316 254 40 317 203 316 277 317 205</code> becomes the UTF-8 encoded string <code>Γειά σου</code>";
        this.infoURL = "https://wikipedia.org/wiki/Octal";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            }
        ];
        this.checks = [
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?: (?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["Space"]
            },
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?:,(?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["Comma"]
            },
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?:;(?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["Semi-colon"]
            },
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?::(?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["Colon"]
            },
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?:\\n(?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["Line feed"]
            },
            {
                pattern: "^(?:[0-7]{1,2}|[123][0-7]{2})(?:\\r\\n(?:[0-7]{1,2}|[123][0-7]{2}))*$",
                flags: "",
                args: ["CRLF"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0] || "Space");
        if (input.length === 0) return [];
        return input.split(delim).map((val) => parseInt(val, 8));
    }
}

export default FromOctal;
