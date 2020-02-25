/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {fromHex, FROM_HEX_DELIM_OPTIONS} from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";

/**
 * From Hex operation
 */
class FromHex extends Operation {

    /**
     * FromHex constructor
     */
    constructor() {
        super();

        this.name = "From Hex";
        this.module = "Default";
        this.description = "Converts a hexadecimal byte string back into its raw value.<br><br>e.g. <code>ce 93 ce b5 ce b9 ce ac 20 cf 83 ce bf cf 85 0a</code> becomes the UTF-8 encoded string <code>Γειά σου</code>";
        this.infoURL = "https://wikipedia.org/wiki/Hexadecimal";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: FROM_HEX_DELIM_OPTIONS
            }
        ];
        this.checks = {
            input: {
                regex: [
                    {
                        match: "^(?:[\\dA-F]{2})+$",
                        flags: "i",
                        args: ["None"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?: [\\dA-F]{2})*$",
                        flags: "i",
                        args: ["Space"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:,[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["Comma"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:;[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["Semi-colon"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?::[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["Colon"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:\\n[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["Line feed"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:\\r\\n[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["CRLF"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:0x[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["0x"]
                    },
                    {
                        match: "^[\\dA-F]{2}(?:\\\\x[\\dA-F]{2})*$",
                        flags: "i",
                        args: ["\\x"]
                    }
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
        const delim = args[0] || "Auto";
        return fromHex(input, delim, 2);
    }

    /**
     * Highlight to Hex
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        if (args[0] === "Auto") return false;
        const delim = Utils.charRep(args[0] || "Space"),
            len = delim === "\r\n" ? 1 : delim.length,
            width = len + 2;

        // 0x and \x are added to the beginning if they are selected, so increment the positions accordingly
        if (delim === "0x" || delim === "\\x") {
            if (pos[0].start > 1) pos[0].start -= 2;
            else pos[0].start = 0;
            if (pos[0].end > 1) pos[0].end -= 2;
            else pos[0].end = 0;
        }

        pos[0].start = pos[0].start === 0 ? 0 : Math.round(pos[0].start / width);
        pos[0].end = pos[0].end === 0 ? 0 : Math.ceil(pos[0].end / width);
        return pos;
    }

    /**
     * Highlight from Hex
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        const delim = Utils.charRep(args[0] || "Space"),
            len = delim === "\r\n" ? 1 : delim.length;

        pos[0].start = pos[0].start * (2 + len);
        pos[0].end = pos[0].end * (2 + len) - len;

        // 0x and \x are added to the beginning if they are selected, so increment the positions accordingly
        if (delim === "0x" || delim === "\\x") {
            pos[0].start += 2;
            pos[0].end += 2;
        }
        return pos;
    }
}

export default FromHex;
