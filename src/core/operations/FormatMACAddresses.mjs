/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Format MAC addresses operation
 */
class FormatMACAddresses extends Operation {
    /**
     * FormatMACAddresses constructor
     */
    constructor() {
        super();

        this.name = "Format MAC addresses";
        this.module = "Default";
        this.description =
            "Displays given MAC addresses in multiple different formats.<br><br>Expects addresses in a list separated by newlines, spaces or commas.<br><br>WARNING: There are no validity checks.";
        this.infoURL =
            "https://wikipedia.org/wiki/MAC_address#Notational_conventions";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Output case",
                type: "option",
                value: ["Both", "Upper only", "Lower only"],
            },
            {
                name: "No delimiter",
                type: "boolean",
                value: true,
            },
            {
                name: "Dash delimiter",
                type: "boolean",
                value: true,
            },
            {
                name: "Colon delimiter",
                type: "boolean",
                value: true,
            },
            {
                name: "Cisco style",
                type: "boolean",
                value: false,
            },
            {
                name: "IPv6 interface ID",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!input) return "";

        const [
                outputCase,
                noDelim,
                dashDelim,
                colonDelim,
                ciscoStyle,
                ipv6IntID,
            ] = args,
            outputList = [],
            macs = input.toLowerCase().split(/[,\s\r\n]+/);

        macs.forEach(function (mac) {
            const cleanMac = mac.replace(/[:.-]+/g, ""),
                macHyphen = cleanMac.replace(/(.{2}(?=.))/g, "$1-"),
                macColon = cleanMac.replace(/(.{2}(?=.))/g, "$1:"),
                macCisco = cleanMac.replace(/(.{4}(?=.))/g, "$1.");
            let macIPv6 = cleanMac.slice(0, 6) + "fffe" + cleanMac.slice(6);

            macIPv6 = macIPv6.replace(/(.{4}(?=.))/g, "$1:");
            let bite = parseInt(macIPv6.slice(0, 2), 16) ^ 2;
            bite = bite.toString(16).padStart(2, "0");
            macIPv6 = bite + macIPv6.slice(2);

            if (outputCase === "Lower only") {
                if (noDelim) outputList.push(cleanMac);
                if (dashDelim) outputList.push(macHyphen);
                if (colonDelim) outputList.push(macColon);
                if (ciscoStyle) outputList.push(macCisco);
                if (ipv6IntID) outputList.push(macIPv6);
            } else if (outputCase === "Upper only") {
                if (noDelim) outputList.push(cleanMac.toUpperCase());
                if (dashDelim) outputList.push(macHyphen.toUpperCase());
                if (colonDelim) outputList.push(macColon.toUpperCase());
                if (ciscoStyle) outputList.push(macCisco.toUpperCase());
                if (ipv6IntID) outputList.push(macIPv6.toUpperCase());
            } else {
                if (noDelim) outputList.push(cleanMac, cleanMac.toUpperCase());
                if (dashDelim)
                    outputList.push(macHyphen, macHyphen.toUpperCase());
                if (colonDelim)
                    outputList.push(macColon, macColon.toUpperCase());
                if (ciscoStyle)
                    outputList.push(macCisco, macCisco.toUpperCase());
                if (ipv6IntID) outputList.push(macIPv6, macIPv6.toUpperCase());
            }

            outputList.push(
                "", // Empty line to delimit groups
            );
        });

        // Return the data as a string
        return outputList.join("\n");
    }
}

export default FormatMACAddresses;
