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

        if (format.startsWith("Hex")) {
            if (input.length != 16) {
                return `Error: NTP Timestamp should be 64 bits long`; 
            }

            if (format === "Hex (little-endian)") {
                // Convert little-endian to big-endian
                input = new SwapEndianness().run(input, ["Raw", input.length, false]);
            }

            // Getting the 32 bits (8 first hexa values) long seconds part 
            const hex_ntp_timestamp_seconds_part = input.substring(0, 8);
            // Getting the 32 bits (8 last hexa values) long seconds fractions part
            const hex_ntp_timestamp_fractions_part = input.substring(input.length - 8, input.length);

            // Convert hexadecimal values to decimal values
            var ntp_timestamp_seconds_part = new BigNumber(hex_ntp_timestamp_seconds_part, 16);
            var ntp_timestamp_fractions_part = new BigNumber(hex_ntp_timestamp_fractions_part, 16);

        } else if (format == "Fixed-point decimal") {

            // Get the seconds and the seconds fractions parts of the timestamp separated by a "."
            const pf_ntp_timestamp_seconds_and_fractions_parts = String(input).split(".");
            var ntp_timestamp_seconds_part = new Number(pf_ntp_timestamp_seconds_and_fractions_parts[0]);
            var ntp_timestamp_fractions_part = pf_ntp_timestamp_seconds_and_fractions_parts[1]; 

            if (ntp_timestamp_fractions_part == null) {
                ntp_timestamp_fractions_part = 0
            } else {
                ntp_timestamp_fractions_part = new Number(pf_ntp_timestamp_seconds_and_fractions_parts[1]);
            }

        } else {
            throw new OperationError("Unrecognised format");
        }

        // Set the maximum unsigned positive integer representable in 32 bits
        const max_uint32=new Number(Math.pow(2, 32))

        // Check whether the seconds and the seconds fractions parts values do
        // not exceeds the maximum positive integer representable in 32 bits
        if (ntp_timestamp_seconds_part > max_uint32)
            {
            return `Error: Timestamp seconds part should be 32 bits long. The seconds part '${ntp_timestamp_seconds_part}' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '${max_uint32}'`;
            }
            
        if (ntp_timestamp_fractions_part > max_uint32)
            {
                return `Error: Timestamp fractions seconds part should be 32 bits long. The fractions seconds part '${ntp_timestamp_fractions_part}' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '${max_uint32}'`;
            }

        // Convert the NTP timestamp seconds part value (seconds elapsed since 01 january 
        // 1900 midnight) to UNIX timestamp (seconds elapsed since 01 january 1970 midnight)
        const unix_timestamp_seconds_part = ntp_timestamp_seconds_part - new Number("2208988800");
        // Convert the NTP timestamp seconds fractions part value to seconds
        const unix_timestamp_fractions_part = ntp_timestamp_fractions_part / new Number(Math.pow(2, 32));
        
        // Addition the seconds part value to the seconds fractions part value
        // to form the UNIX timestamp in seconds
        let unix_timestamp=unix_timestamp_seconds_part + unix_timestamp_fractions_part;
        
        // Convert seconds Unix timestamp to requested result unit
        if (unit === "Seconds (s)") {
            return String(unix_timestamp);
        } else if (unit === "Milliseconds (ms)") {
            unix_timestamp = unix_timestamp * new Number("1000");
        } else if (unit === "Microseconds (μs)") {
            unix_timestamp = unix_timestamp * new Number(Math.pow(10, 6));
        } else if (unit === "Nanoseconds (ns)") {
            unix_timestamp = unix_timestamp * new Number(Math.pow(10, 9));
        } else {
            throw new OperationError("Unrecognised unit");
        }

        return String(unix_timestamp);

    }

}

export default NTPTimestampToUNIXTimestamp;