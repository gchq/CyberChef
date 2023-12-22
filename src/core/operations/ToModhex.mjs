/**
 * @author linuxgemini [ilteris@asenkron.com.tr]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { TO_MODHEX_DELIM_OPTIONS, HEX_TO_MODHEX_CONVERSION_MAP } from "../lib/Modhex.mjs";
import { toHex } from "../lib/Hex.mjs";
import Utils from "../Utils.mjs";

/**
 * To Modhex operation
 */
class ToModhex extends Operation {

    /**
     * ToModhex constructor
     */
    constructor() {
        super();

        this.name = "To Modhex";
        this.module = "Default";
        this.description = "Converts the input string to modhex bytes separated by the specified delimiter.";
        this.infoURL = "https://en.wikipedia.org/wiki/YubiKey#ModHex";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: TO_MODHEX_DELIM_OPTIONS
            },
            {
                name: "Bytes per line",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * Convert a byte array into a modhex string.
     *
     * @param {byteArray|Uint8Array|ArrayBuffer} data
     * @param {string} [delim=" "]
     * @param {number} [padding=2]
     * @returns {string}
     *
     * @example
     * // returns "cl bf bu"
     * toModhex([10,20,30]);
     *
     * // returns "cl:bf:bu"
     * toModhex([10,20,30], ":");
     */
    toModhex(data, delim=" ", padding=2, extraDelim="", lineSize=0) {
        if (!data || data.length === 0) return "";
        if (data instanceof ArrayBuffer) data = new Uint8Array(data);

        const hexconv = toHex(data, "", padding, "", 0);
        let modhexconv = "";
        let output = "";

        for (const letter of hexconv.split("")) {
            modhexconv += HEX_TO_MODHEX_CONVERSION_MAP[letter];
        }

        const groupedModhex = modhexconv.match(/.{1,2}/g);

        for (let i = 0; i < groupedModhex.length; i++) {
            const group = groupedModhex[i];
            output += group + delim;

            if (extraDelim) {
                output += extraDelim;
            }
            // Add LF after each lineSize amount of bytes but not at the end
            if ((i !== groupedModhex.length - 1) && ((i + 1) % lineSize === 0)) {
                output += "\n";
            }
        }

        // Remove the extraDelim at the end (if there is one)
        // and remove the delim at the end, but if it's prepended there's nothing to remove
        const rTruncLen = extraDelim.length + delim.length;
        if (rTruncLen) {
            // If rTruncLen === 0 then output.slice(0,0) will be returned, which is nothing
            return output.slice(0, -rTruncLen);
        } else {
            return output;
        }
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]);
        const lineSize = args[1];

        return this.toModhex(new Uint8Array(input), delim, 2, "", lineSize);
    }

}

export default ToModhex;
