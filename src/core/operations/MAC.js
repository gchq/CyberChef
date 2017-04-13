/**
 * MAC address operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const MAC = {

    /**
     * @constant
     * @default
     */
    OUTPUT_CASE: ["Both", "Upper only", "Lower only"],
    /**
     * @constant
     * @default
     */
    NO_DELIM: true,
    /**
     * @constant
     * @default
     */
    DASH_DELIM: true,
    /**
     * @constant
     * @default
     */
    COLON_DELIM: true,
    /**
     * @constant
     * @default
     */
    CISCO_STYLE: false,

    /**
     * Format MAC addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFormat: function(input, args) {
        if (!input) return "";

        let outputCase = args[0],
            noDelim = args[1],
            dashDelim = args[2],
            colonDelim = args[3],
            ciscoStyle = args[4],
            outputList = [],
            macs = input.toLowerCase().split(/[,\s\r\n]+/);

        macs.forEach(function(mac) {
            let cleanMac = mac.replace(/[:.-]+/g, ""),
                macHyphen = cleanMac.replace(/(.{2}(?=.))/g, "$1-"),
                macColon = cleanMac.replace(/(.{2}(?=.))/g, "$1:"),
                macCisco = cleanMac.replace(/(.{4}(?=.))/g, "$1.");

            if (outputCase === "Lower only") {
                if (noDelim) outputList.push(cleanMac);
                if (dashDelim) outputList.push(macHyphen);
                if (colonDelim) outputList.push(macColon);
                if (ciscoStyle) outputList.push(macCisco);
            } else if (outputCase === "Upper only") {
                if (noDelim) outputList.push(cleanMac.toUpperCase());
                if (dashDelim) outputList.push(macHyphen.toUpperCase());
                if (colonDelim) outputList.push(macColon.toUpperCase());
                if (ciscoStyle) outputList.push(macCisco.toUpperCase());
            } else {
                if (noDelim) outputList.push(cleanMac, cleanMac.toUpperCase());
                if (dashDelim) outputList.push(macHyphen, macHyphen.toUpperCase());
                if (colonDelim) outputList.push(macColon, macColon.toUpperCase());
                if (ciscoStyle) outputList.push(macCisco, macCisco.toUpperCase());
            }

            outputList.push(
                "" // Empty line to delimit groups
            );
        });

        // Return the data as a string
        return outputList.join("\n");
    },

};

export default MAC;
