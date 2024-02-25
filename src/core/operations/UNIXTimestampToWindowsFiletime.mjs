/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import BigNumber from "bignumber.js";
import OperationError from "../errors/OperationError.mjs";

/**
 * UNIX Timestamp to Windows Filetime operation
 */
class UNIXTimestampToWindowsFiletime extends Operation {
    /**
     * UNIXTimestampToWindowsFiletime constructor
     */
    constructor() {
        super();

        this.name = "UNIX Timestamp to Windows Filetime";
        this.module = "Default";
        this.description
            = "Converts a UNIX timestamp to a Windows Filetime value.<br><br>A Windows Filetime is a 64-bit value representing the number of 100-nanosecond intervals since January 1, 1601 UTC.<br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).<br><br>This operation also supports UNIX timestamps in milliseconds, microseconds and nanoseconds.";
        this.infoURL = "https://msdn.microsoft.com/en-us/library/windows/desktop/ms724284(v=vs.85).aspx";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input units",
                "type": "option",
                "value": ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"]
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Decimal", "Hex (big endian)", "Hex (little endian)"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [units, format] = args;

        if (!input) return "";

        input = new BigNumber(input);

        if (units === "Seconds (s)") {
            input = input.multipliedBy(new BigNumber("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.multipliedBy(new BigNumber("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.multipliedBy(new BigNumber("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.dividedBy(new BigNumber("100"));
        } else {
            throw new OperationError("Unrecognised unit");
        }

        input = input.plus(new BigNumber("116444736000000000"));

        let result;
        if (format.startsWith("Hex")) {
            result = input.toString(16);
        } else {
            result = input.toFixed();
        }

        if (format === "Hex (little endian)") {
            // Swap endianness
            let flipped = "";
            for (let i = result.length - 2; i >= 0; i -= 2) {
                flipped += result.charAt(i);
                flipped += result.charAt(i + 1);
            }
            if (result.length % 2 !== 0) {
                flipped += "0" + result.charAt(0);
            }
            result = flipped;
        }

        return result;
    }
}

export default UNIXTimestampToWindowsFiletime;
