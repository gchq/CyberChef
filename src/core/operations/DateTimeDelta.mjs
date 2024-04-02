/**
 * @author tomgond [tom.gonda@gmail.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import {DATETIME_FORMATS, FORMAT_EXAMPLES} from "../lib/DateTime.mjs";

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
                "name": "Time Operation",
                "type": "option",
                "value": ["Add", "Subtract"]
            },
            {
                "name": "Days",
                "type": "number",
                "value": 0
            },
            {
                "name": "Hours",
                "type": "number",
                "value": 0
            },
            {
                "name": "Minutes",
                "type": "number",
                "value": 0
            },
            {
                "name": "Seconds",
                "type": "number",
                "value": 0
            }

        ];
    }


    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const inputTimezone = "UTC";
        const inputFormat = args[1];
        const operationType = args[2];
        const daysDelta = args[3];
        const hoursDelta = args[4];
        const minutesDelta = args[5];
        const secondsDelta = args[6];
        let date = "";

        try {
            date = moment.tz(input, inputFormat, inputTimezone);
            if (!date || date.format() === "Invalid date") throw Error;
        } catch (err) {
            return `Invalid format.\n\n${FORMAT_EXAMPLES}`;
        }
        let newDate;
        if (operationType === "Add") {
            newDate = date.add(daysDelta, "days")
                .add(hoursDelta, "hours")
                .add(minutesDelta, "minutes")
                .add(secondsDelta, "seconds");

        } else {
            newDate = date.add(-daysDelta, "days")
                .add(-hoursDelta, "hours")
                .add(-minutesDelta, "minutes")
                .add(-secondsDelta, "seconds");
        }
        return newDate.tz(inputTimezone).format(inputFormat.replace(/[<>]/g, ""));
    }
}

export default DateTimeDelta;
