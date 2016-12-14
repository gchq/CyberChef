/**
 * MAC address operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var MAC = {

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
    run_format: function(input, args) {
        if (!input) return "";
    
        var output_case = args[0],
            no_delim = args[1],
            dash_delim = args[2],
            colon_delim = args[3],
            cisco_style = args[4],
            output_list = [],
            macs = input.toLowerCase().split(/[,\s\r\n]+/);

        macs.forEach(function(mac) {
            var cleanMac = mac.replace(/[:.-]+/g, ""),
                macHyphen = cleanMac.replace(/(.{2}(?=.))/g, "$1-"),
                macColon = cleanMac.replace(/(.{2}(?=.))/g, "$1:"),
                macCisco = cleanMac.replace(/(.{4}(?=.))/g, "$1.");
                
            if (output_case === "Lower only") {
                if (no_delim) output_list.push(cleanMac);
                if (dash_delim) output_list.push(macHyphen);
                if (colon_delim) output_list.push(macColon);
                if (cisco_style) output_list.push(macCisco);
            } else if (output_case === "Upper only") {
                if (no_delim) output_list.push(cleanMac.toUpperCase());
                if (dash_delim) output_list.push(macHyphen.toUpperCase());
                if (colon_delim) output_list.push(macColon.toUpperCase());
                if (cisco_style) output_list.push(macCisco.toUpperCase());
            } else {
                if (no_delim) output_list.push(cleanMac, cleanMac.toUpperCase());
                if (dash_delim) output_list.push(macHyphen, macHyphen.toUpperCase());
                if (colon_delim) output_list.push(macColon, macColon.toUpperCase());
                if (cisco_style) output_list.push(macCisco, macCisco.toUpperCase());
            }
            
            output_list.push(
                "" // Empty line to delimit groups
            );
        });

        // Return the data as a string
        return output_list.join("\n");
    },

};
