/**
 * @author tomgond [tom.gonda@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import {DATETIME_FORMATS, FORMAT_EXAMPLES} from "../lib/DateTime.mjs";

/**
  * @param {string} timeString
  * @returns {string} 
*/
function parseTimeString(timeString) {
    // Split the string into its components
    const parts = timeString.split(":");
    // Extract the sign, days, hours, minutes, and seconds
    const sign = parts[0][0] === "-" ? "-" : "+";
    const days = parseInt(parts[0].split(".")[0].slice(1), 10);
    const hours = parseInt(parts[0].split(".")[1], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    return {
        sign,
        days,
        hours,
        minutes,
        seconds
    };
}

/**
 * DateTime Delta operation
 */
class DateTimeDelta extends Operation {

    /**
     * DateTimeDelta constructor
     */
    constructor() {
        super();

        this.name = "DateTime Delta";
        this.module = "Default";
        this.description = "Calculates a new DateTime value given an input DateTime value and a time difference (delta) from the input DateTime value.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
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
                "name": "Time Delta",
                "type": "binaryString",
                "value": "+0.00:00:00"
            }

        ];
    }


    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const inputFormat = args[1],
            inputTimezone = "UTC";
        const deltaStr = args[2];

        let date = "";
        try {
            date = moment.tz(input, inputFormat, inputTimezone);
            if (!date || date.format() === "Invalid date") throw Error;
        } catch (err) {
            return `Invalid format.\n\n${FORMAT_EXAMPLES}`;
        }

        const deltaDict = parseTimeString(deltaStr);
        let newDate;
        if (deltaDict.sign === "-") {
            newDate = date.add(-deltaDict.days, "days")
                .add(-deltaDict.hours, "hours")
                .add(-deltaDict.minutes, "minutes")
                .add(-deltaDict.seconds, "seconds");

        } else {
            newDate = date.add(deltaDict.days, "days")
                .add(deltaDict.hours, "hours")
                .add(deltaDict.minutes, "minutes")
                .add(deltaDict.seconds, "seconds");
        }
        return newDate.tz(inputTimezone).format(inputFormat.replace(/[<>]/g, ""));
    }
}

export default DateTimeDelta;
