/**
 * @author kossithedon [kossivijunior@yahoo.fr]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import BigNumber from "bignumber.js";
import OperationError from "../errors/OperationError.mjs";
import RemoveWhitespace from "./RemoveWhitespace.mjs";
import SwapEndianness from "./SwapEndianness.mjs";

/**
 * NTP Timestamp to UNIX Timestamp operation
 */
class NTPTimestampToUNIXTimestamp extends Operation {

    /**
     * NTPTimestampToUNIXTimestamp constructor
     */
    constructor() {
        super();

        this.name = "NTP Timestamp to UNIX Timestamp";
        this.module = "Default";
        this.description = "Convert an NTP timestamp to the corresponding UNIX timestamp.<br><br>An NTP timestamp is a 64-bit value representing time in the Network Time Protocol (NTP).<br><br>The NTP timestamp is in a fixed-point decimal format where the integer part represents the number of seconds since a fixed reference point, and the fractional part represents fractions of a second.<br><br>The reference point is the epoch of NTP, which is January 1, 1900, at 00:00:00";
        this.infoURL = "https://en.wikipedia.org/wiki/Network_Time_Protocol";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input: NTP timestamp format",
                "type": "option",
                "value": ["Fixed-point decimal", "Hex (big-endian)", "Hex (little-endian)"]
            },
            {
                "name": "Output : Unix timestamp unit",
                "type": "option",
                "value": ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, unit] = args;

        if (!input || input.trim().length === 0) {
            return "";
        } else {
            input = new RemoveWhitespace().run(input, [true, true, true, true, true, false]);
        }

        let ntpTimestampSecondsPart;
        let ntpTimestampFractionsPart;

        if (format.startsWith("Hex")) {
            if (input.length !== 16) {
                return `Error: NTP Timestamp should be 64 bits long`;
            }
            if (format === "Hex (little-endian)") {
                // Convert little-endian to big-endian
                input = new SwapEndianness().run(input, ["Raw", input.length, false]);
            }

            // Getting the 32 bits (8 first hexa values) long seconds part
            const hexNtpTimestampSecondsPart = input.substring(0, 8);
            // Getting the 32 bits (8 last hexa values) long seconds fractions part
            const hexNtpTimestampFractionsPart = input.substring(input.length - 8, input.length);

            // Convert hexadecimal values to decimal values
            ntpTimestampSecondsPart = new BigNumber(hexNtpTimestampSecondsPart, 16);
            ntpTimestampFractionsPart = new BigNumber(hexNtpTimestampFractionsPart, 16);

        } else if (format === "Fixed-point decimal") {

            // Get the seconds and the seconds fractions parts of the timestamp separated by a "."
            const pfNtpTimestampSecondsAndFractionsParts = String(input).split(".");
            ntpTimestampSecondsPart = new Number(pfNtpTimestampSecondsAndFractionsParts[0]);
            ntpTimestampFractionsPart = pfNtpTimestampSecondsAndFractionsParts[1];

            if (ntpTimestampFractionsPart === null) {
                ntpTimestampFractionsPart = 0;
            } else {
                ntpTimestampFractionsPart = new Number(pfNtpTimestampSecondsAndFractionsParts[1]);
            }

        } else {
            throw new OperationError("Unrecognised format");
        }

        // Set the maximum unsigned positive integer representable in 32 bits
        const maxUint32=new Number(Math.pow(2, 32));

        // Check whether the seconds and the seconds fractions parts values do
        // not exceeds the maximum positive integer representable in 32 bits
        if (ntpTimestampSecondsPart > maxUint32) {
            return `Error: Timestamp seconds part should be 32 bits long. The seconds part '${ntpTimestampSecondsPart}' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '${maxUint32}'`;
        }
        if (ntpTimestampFractionsPart > maxUint32) {
            return `Error: Timestamp fractions seconds part should be 32 bits long. The fractions seconds part '${ntpTimestampFractionsPart}' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '${maxUint32}'`;
        }

        // Convert the NTP timestamp seconds part value (seconds elapsed since 01 january
        // 1900 midnight) to UNIX timestamp (seconds elapsed since 01 january 1970 midnight)
        const unixTimestampSecondsPart = ntpTimestampSecondsPart - new Number("2208988800");
        // Convert the NTP timestamp seconds fractions part value to seconds
        const unixTimestampFractionsPart = ntpTimestampFractionsPart / new Number(Math.pow(2, 32));
        // Addition the seconds part value to the seconds fractions part value
        // to form the UNIX timestamp in seconds
        let unixTimestamp=unixTimestampSecondsPart + unixTimestampFractionsPart;

        // Convert seconds Unix timestamp to requested result unit
        if (unit === "Seconds (s)") {
            return String(unixTimestamp);
        } else if (unit === "Milliseconds (ms)") {
            unixTimestamp = unixTimestamp * new Number("1000");
        } else if (unit === "Microseconds (μs)") {
            unixTimestamp = unixTimestamp * new Number(Math.pow(10, 6));
        } else if (unit === "Nanoseconds (ns)") {
            unixTimestamp = unixTimestamp * new Number(Math.pow(10, 9));
        } else {
            throw new OperationError("Unrecognised unit");
        }

        return String(unixTimestamp);
    }

}

export default NTPTimestampToUNIXTimestamp;
