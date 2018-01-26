import BigNumber from "bignumber.js";

/**
 * Windows Filetime operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const Filetime = {

    /**
     * @constant
     * @default
     */
    UNITS: ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"],

    /**
     * @constant
     * @default
     */
    FILETIME_FORMATS: ["Decimal", "Hex"],

    /**
     * Windows Filetime to Unix Timestamp operation.
     *
     * @author bwhitn [brian.m.whitney@outlook.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFromFiletimeToUnix: function(input, args) {
        let units = args[0],
            format = args[1];

        if (!input) return "";

        if (format === "Hex") {
            input = new BigNumber(input, 16);
        } else {
            input = new BigNumber(input);
        }

        input = input.minus(new BigNumber("116444736000000000"));

        if (units === "Seconds (s)"){
            input = input.dividedBy(new BigNumber("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.dividedBy(new BigNumber("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.dividedBy(new BigNumber("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.multipliedBy(new BigNumber("100"));
        } else {
            throw "Unrecognised unit";
        }

        return input.toFixed();
    },


    /**
     * Unix Timestamp to Windows Filetime operation.
     *
     * @author bwhitn [brian.m.whitney@outlook.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runToFiletimeFromUnix: function(input, args) {
        let units = args[0],
            format = args[1];

        if (!input) return "";

        input = new BigNumber(input);

        if (units === "Seconds (s)"){
            input = input.multipliedBy(new BigNumber("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.multipliedBy(new BigNumber("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.multiplyiedBy(new BigNumber("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.dividedBy(new BigNumber("100"));
        } else {
            throw "Unrecognised unit";
        }

        input = input.plus(new BigNumber("116444736000000000"));

        if (format === "Hex"){
            return input.toString(16);
        } else {
            return input.toFixed();
        }
    },

};

export default Filetime;
