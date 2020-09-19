/**
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { FROM_MODHEX_DELIM_OPTIONS, MODHEX_TO_HEX_CONVERSION_MAP } from "../lib/Modhex.mjs";
import { fromHex } from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";

/**
 * From Modhex operation
 */
class FromModhex extends Operation {

    /**
     * FromModhex constructor
     */
    constructor() {
        super();

        this.name = "From Modhex";
        this.module = "Default";
        this.description = "Converts a modhex byte string back into its raw value.";
        this.infoURL = "https://en.wikipedia.org/wiki/YubiKey#ModHex";
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: FROM_MODHEX_DELIM_OPTIONS
            }
        ];
        this.checks = [
            {
                pattern: "^(?:[cbdefghijklnrtuv]{2})+$",
                flags: "i",
                args: ["None"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?: [cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["Space"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?:,[cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["Comma"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?:;[cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["Semi-colon"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?::[cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["Colon"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?:\\n[cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["Line feed"]
            },
            {
                pattern: "^[cbdefghijklnrtuv]{2}(?:\\r\\n[cbdefghijklnrtuv]{2})*$",
                flags: "i",
                args: ["CRLF"]
            }
        ];
    }

    /**
     * Convert a hex string into a byte array.
     *
     * @param {string} data
     * @param {string} [delim]
     * @param {number} [byteLen=2]
     * @returns {byteArray}
     *
     * @example
     * // returns [10,20,30]
     * fromModhex("cl bf bu");
     *
     * // returns [10,20,30]
     * fromModhex("cl:bf:bu", "Colon");
     */
    fromModhex(data, delim="Auto", byteLen=2) {
        if (!data || data.length === 0) return [];

        data = data.toLowerCase();

        if (delim !== "None") {
            const delimRegex = delim === "Auto" ? /[^cbdefghijklnrtuv]/gi : Utils.regexRep(delim);
            data = data.replace(delimRegex, "");
        }

        data = data.replace(/\s/g, "");

        let hexconv = "";
        for (const letter of data.split("")) {
            hexconv += MODHEX_TO_HEX_CONVERSION_MAP[letter];
        }

        const output = fromHex(hexconv, "None", byteLen);
        return output;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        const delim = args[0] || "Auto";
        return this.fromModhex(input, delim, 2);
    }

}

export default FromModhex;
