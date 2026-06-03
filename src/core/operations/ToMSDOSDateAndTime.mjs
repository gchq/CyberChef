/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import OperationError from "../errors/OperationError.mjs";

/**
 * To MS-DOS Date and Time operation
 */
class ToMSDOSDateAndTime extends Operation {

    /**
     * ToMSDOSDateAndTime constructor
     */
    constructor() {
        super();

        this.name = "To MS-DOS Date and Time";
        this.module = "Default";
        this.description = "Parses a datetime string and returns the corresponding space-separated pair of MS-DOS date and time in this order.<br>Each of date and time are represented as 16-bit unsigned integers.<br>Years between 1980 and 2107 (inclusive) are supported.<br><br>Some examples of where MS-DOS date and time are used are ZIP archive file and FAT filesystem.";
        this.infoURL = "https://learn.microsoft.com/en-us/windows/win32/sysinfo/ms-dos-date-and-time";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Output Format",
                "type": "option",
                "value": ["Decimal", "Hex"]
            },
            {
                "name": "Show parsed datetime",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const outputFormat = args[0], showDate = args[1];
        const date = moment(input);
        if (!date.isValid()) {
            throw new OperationError("invalid input");
        }
        const outputFormatter = (function() {
            switch (outputFormat) {
                case "Decimal":
                    return function(value) {
                        return value.toString();
                    };
                case "Hex":
                    return function(value) {
                        const result = value.toString(16);
                        if (result.length >= 4) return result;
                        return ("0000" + result).substring(result.length);
                    };
                default:
                    throw new OperationError("undefined output format");
            }
        })();
        const year = date.year();
        if (year < 1980 || 2107 < year) {
            throw new OperationError("out-of-range");
        }
        const dateOut =
            ((year - 1980) << 9) |
            ((date.month() + 1) << 5) |
            date.date();
        const timeOut =
            (date.hour() << 11) |
            (date.minute() << 5) |
            (date.second() >> 1);
        const output = outputFormatter(dateOut) + " " + outputFormatter(timeOut);
        if (showDate) {
            return output + " (" + date.format("yyyy-MM-DD HH:mm:ss") + ")";
        }
        return output;
    }

}

export default ToMSDOSDateAndTime;
