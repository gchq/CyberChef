/**
 * @author kossithedon [kossivijunior@yahoo.fr]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import RemoveWhitespace from "./RemoveWhitespace.mjs";
import SwapEndianness from "./SwapEndianness.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * UNIX Timestamp to NTP Timestamp operation
 */
class NTPTimestampToUNIXTimestamp extends Operation {

    /**
     * UNIXTimestampToNTPTimestamp constructor
     */
    constructor() {
        super();

        this.name = "UNIX Timestamp to NTP Timestamp";
        this.module = "Default";
        this.description = "Convert an NTP timestamp to the corresponding UNIX timestamp.<br><br>An NTP timestamp is a 64-bit value representing time in the Network Time Protocol (NTP).<br><br>The NTP timestamp is in a fixed-point decimal format where the integer part represents the number of seconds since a fixed reference point, and the fractional part represents fractions of a second.<br><br>The reference point is the epoch of NTP, which is January 1, 1900, at 00:00:00";
        this.infoURL = "https://en.wikipedia.org/wiki/Network_Time_Protocol";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input : Unix timestamp unit",
                "type": "option",
                "value": ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"]
            },
            {
                "name": "Output: NTP timestamp format",
                "type": "option",
                "value": ["Fixed-point decimal", "Hex (big-endian)", "Hex (little-endian)"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [unit, format] = args;

        if (!input || input.trim().length === 0) {
            return "";
        } else {
            input = new RemoveWhitespace().run(input, [true, true, true, true, true, false]);
        }

        let unixTimestampSeconds;

        // Convert the provided Unix timestmap to seconds Unix timestamps
        if (unit === "Seconds (s)") {
            unixTimestampSeconds = input;
        } else if (unit === "Milliseconds (ms)") {
            unixTimestampSeconds = input / new Number("1000");
        } else if (unit === "Microseconds (μs)") {
            unixTimestampSeconds = input / new Number(Math.pow(10, 6));
        } else if (unit === "Nanoseconds (ns)") {
            unixTimestampSeconds = input / new Number(Math.pow(10, 9));
        } else {
            throw new OperationError("Unrecognised unit");
        }

        // Get the seconds and the fractions seconds parts of the UNIX timestamp
        const unixTimestampSecondsPart = Math.floor(unixTimestampSeconds);
        const unixTimestampFractionsPart = unixTimestampSeconds % 1;

        // The greatest seconds value is the maximum unsigned positive integer representable
        // in 32 bits (2**32) - 2208988800 (seconds elapsed from NTP Epoch and UNIX Epoch)
        const greatestSecondsValue = Math.pow(2, 32) - 2208988800;

        // Check whether the seconds value part do not exceeds the greatest seconds value
        if (unixTimestampSecondsPart > greatestSecondsValue) {
            return `Error: The NTP Timestamp seconds part '${unixTimestampSecondsPart}' exceeds the greatest authorized seconds value '${greatestSecondsValue}' due to an incorrect provided UNIX timestamp`;
        }

        // Convert the UNIX timestamp seconds part value (seconds elapsed since 01 january
        // 1970 midnight) to NTP timestamp (seconds elapsed since 01 january 1900 midnight)
        const ntpTimestampSecondsPart = unixTimestampSecondsPart + new Number("2208988800");
        // Convert the NTP timestamp seconds fractions part value to seconds
        const ntpTimestampFractionsPart = unixTimestampFractionsPart * (Math.pow(2, 32));

        if (format.startsWith("Hex")) {
            // Convert Unix timestamp seconds and seconds fractions parts from decimal to hexadecimal
            const hexNtpTimestampSecondsPart = ntpTimestampSecondsPart.toString(16);
            let hexNtptimestampfractionsPart = ntpTimestampFractionsPart.toString(16);

            if (hexNtptimestampfractionsPart === 0) {
                // pad hexadecimal seconds fractions part
                hexNtptimestampfractionsPart = "00000000";
            }
            // Concatenate seconds part hexadecimal value to seconds fractions part
            // hexadecimal value to form the big-endian hexadecimal Unix timestamp
            const beHexNtpTimestamp = hexNtpTimestampSecondsPart + hexNtptimestampfractionsPart;

            if (format === "Hex (little-endian)") {
                // Convert big-endian to little-endian
                const leHexNtpTimestamp = new SwapEndianness().run(beHexNtpTimestamp, ["Raw", 16, false]);
                return leHexNtpTimestamp;
            } else if (format === "Hex (big-endian)") {
                return beHexNtpTimestamp;
            } else {
                throw new OperationError("Unrecognised format");
            }

        } else if (format === "Fixed-point decimal")  {
            // Construct the NTP timestamp by concatenating the seconds part
            // value to the seconds fractions part value separeted by a "."
            const pfNtpTimestamp=ntpTimestampSecondsPart+"."+ntpTimestampFractionsPart;
            return pfNtpTimestamp;

        } else {
            throw new OperationError("Unrecognised format");
        }
    }
}

export default NTPTimestampToUNIXTimestamp;
