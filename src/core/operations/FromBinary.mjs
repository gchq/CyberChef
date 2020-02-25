/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {BIN_DELIM_OPTIONS} from "../lib/Delim.mjs";
import {fromBinary} from "../lib/Binary.mjs";

/**
 * From Binary operation
 */
class FromBinary extends Operation {

    /**
     * FromBinary constructor
     */
    constructor() {
        super();

        this.name = "From Binary";
        this.module = "Default";
        this.description = "Converts a binary string back into its raw form.<br><br>e.g. <code>01001000 01101001</code> becomes <code>Hi</code>";
        this.infoURL = "https://wikipedia.org/wiki/Binary_code";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                "name": "Delimiter",
                "type": "option",
                "value": BIN_DELIM_OPTIONS
            }
        ];
        this.checks = {
            input: {
                regex: [
                    {
                        match: "^(?:[01]{8})+$",
                        flags: "",
                        args: ["None"]
                    },
                    {
                        match: "^(?:[01]{8})(?: [01]{8})*$",
                        flags: "",
                        args: ["Space"]
                    },
                    {
                        match: "^(?:[01]{8})(?:,[01]{8})*$",
                        flags: "",
                        args: ["Comma"]
                    },
                    {
                        match: "^(?:[01]{8})(?:;[01]{8})*$",
                        flags: "",
                        args: ["Semi-colon"]
                    },
                    {
                        match: "^(?:[01]{8})(?::[01]{8})*$",
                        flags: "",
                        args: ["Colon"]
                    },
                    {
                        match: "^(?:[01]{8})(?:\\n[01]{8})*$",
                        flags: "",
                        args: ["Line feed"]
                    },
                    {
                        match: "^(?:[01]{8})(?:\\r\\n[01]{8})*$",
                        flags: "",
                        args: ["CRLF"]
                    },
                ]
            }
        };
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        return fromBinary(input, args[0]);
    }

    /**
     * Highlight From Binary
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start === 0 ? 0 : Math.floor(pos[0].start / (8 + delim.length));
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / (8 + delim.length));
        return pos;
    }

    /**
     * Highlight From Binary in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        const delim = Utils.charRep(args[0] || "Space");
        pos[0].start = pos[0].start * (8 + delim.length);
        pos[0].end = pos[0].end * (8 + delim.length) - delim.length;
        return pos;
    }

}

export default FromBinary;
