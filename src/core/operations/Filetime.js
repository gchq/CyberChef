import {BigInteger} from "jsbn";

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

        if (format === "Hex") {
            input = new BigInteger(input, 16);
        } else {
            input = new BigInteger(input);
        }

        input = input.subtract(new BigInteger("116444736000000000"));

        if (units === "Seconds (s)"){
            input = input.divide(new BigInteger("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.divide(new BigInteger("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.divide(new BigInteger("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.multiply(new BigInteger("100"));
        } else {
            throw "Unrecognised unit";
        }

        return input.toString();
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

        input = new BigInteger(input);

        if (units === "Seconds (s)"){
            input = input.multiply(new BigInteger("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.multiply(new BigInteger("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.multiply(new BigInteger("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.divide(new BigInteger("100"));
        } else {
            throw "Unrecognised unit";
        }

        input = input.add(new BigInteger("116444736000000000"));

        if (format === "Hex"){
            return input.toString(16);
        } else {
            return input.toString();
        }
    },

};

export default Filetime;
