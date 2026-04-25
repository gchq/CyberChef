/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import {DATETIME_FORMATS, FORMAT_EXAMPLES} from "../lib/DateTime.mjs";

/**
 * Parse DateTime operation
 */
class ParseDateTime extends Operation {

    /**
     * ParseDateTime constructor
     */
    constructor() {
        super();

        this.name = "Parse DateTime";
        this.module = "Default";
        this.description = "Parses a DateTime string in your specified format and displays it in whichever timezone you choose with the following information:<ul><li>Date</li><li>Time</li><li>Period (AM/PM)</li><li>Timezone</li><li>UTC offset</li><li>Daylight Saving Time</li><li>Leap year</li><li>Days in this month</li><li>Day of year</li><li>Week number</li><li>Quarter</li></ul>Run with no input to see format string examples if required.";
        this.infoURL = "https://momentjs.com/docs/#/parsing/string-format/";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Built in formats",
                "type": "populateOption",
                "value": DATETIME_FORMATS,
                "target": 1
            },
            {
                "name": "Input format string",
                "type": "binaryString",
                "value": "DD/MM/YYYY HH:mm:ss"
            },
            {
                "name": "Input timezone",
                "type": "option",
                "value": ["UTC"].concat(moment.tz.names())
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const inputFormat = args[1],
            inputTimezone = args[2];
        let date,
            output = "";

        try {
            date = moment.tz(input, inputFormat, inputTimezone);
            if (!date || date.format() === "Invalid date") throw Error;
        } catch (err) {
            return `Invalid format.\n\n${FORMAT_EXAMPLES}`;
        }

        output += "Date: " + date.format("dddd Do MMMM YYYY") +
            "\nTime: " + date.format("HH:mm:ss") +
            "\nPeriod: " + date.format("A") +
            "\nTimezone: " + date.format("z") +
            "\nUTC offset: " + date.format("ZZ") +
            "\n\nDaylight Saving Time: " + date.isDST() +
            "\nLeap year: " + date.isLeapYear() +
            "\nDays in this month: " + date.daysInMonth() +
            "\n\nDay of year: " + date.dayOfYear() +
            "\nWeek number: " + date.week() +
            "\nQuarter: " + date.quarter();

        return output;
    }

}

export default ParseDateTime;
