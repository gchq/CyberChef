/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import OperationError from "../errors/OperationError.mjs";

/**
 * From MS-DOS Date and Time operation
 */
class FromMSDOSDateAndTime extends Operation {

    /**
     * FromMSDOSDateAndTime constructor
     */
    constructor() {
        super();

        this.name = "From MS-DOS Date and Time";
        this.module = "Default";
        this.description = "Receives a space-separated pair of MS-DOS date and time (16-bit unsigned integers) in this order and returns the corresponding datetime in <code>yyyy-MM-dd HH:mm:ss</code> format.<br><br>Some examples of where MS-DOS date and time are used are ZIP archive file and FAT filesystem.";
        this.infoURL = "https://learn.microsoft.com/en-us/windows/win32/sysinfo/ms-dos-date-and-time";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Input Format",
                "type": "option",
                "value": ["Decimal", "Hex"]
            },
            {
                "name": "Validate datetime",
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
        const inputFormat = args[0], validate = args[1];
        const radixTable = {"Decimal": 10, "Hex": 16};
        if (!(inputFormat in radixTable)) {
            throw new OperationError("undefined input format");
        }
        const radix = radixTable[inputFormat];
        const inputParts = input.split(/\s+/);
        if (inputParts.length < 2) {
            throw new OperationError("invalid input");
        }
        const dateInput = parseInt(inputParts[0], radix);
        const timeInput = parseInt(inputParts[1], radix);
        if (isNaN(dateInput) || dateInput < 0 || 0xffff < dateInput ||
        isNaN(timeInput) || timeInput < 0 || 0xffff < timeInput) {
            throw new OperationError("invalid input");
        }
        const year = ((dateInput >> 9) & 0x7f) + 1980;
        const month = (dateInput >> 5) & 0x0f;
        const date = dateInput & 0x1f;
        const hour = (timeInput >> 11) & 0x1f;
        const minute = (timeInput >> 5) & 0x3f;
        const second = (timeInput & 0x1f) << 1;

        if (validate) {
            const m = moment([year, month - 1, date, hour, minute, second]);
            if (!m.isValid()) {
                throw new OperationError("invalid datetime");
            }
        }

        const toTwoDigits = function(value) {
            return (value >= 10 ? "" : "0") + value;
        };
        return "" + year + "-" + toTwoDigits(month) + "-" + toTwoDigits(date) +
            " " + toTwoDigits(hour) + ":" + toTwoDigits(minute) + ":" + toTwoDigits(second);
    }

}

export default FromMSDOSDateAndTime;
