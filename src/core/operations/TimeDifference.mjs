/**
 * @author tomgond [tom.gonda@gmail.com]
 * @copyright Crown Copyright 2024 
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import moment from "moment-timezone";
import Utils from "../Utils.mjs";
import {DATETIME_FORMATS} from "../lib/DateTime.mjs";
import {DATE_DELIM_OPTIONS} from "../lib/Delim.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Calculate Time Difference operation
 */
class TimeDifference extends Operation {

    /**
     * TimeDifference Constructor
     */
    constructor() {
        super();

        this.name = "Time Difference";
        this.module = "DateTime";
        this.description = "Calculates the difference between two datetime values based on the provided format.";
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
                "name": "Delimiter",
                "type": "option",
                "value": DATE_DELIM_OPTIONS,
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const dateFormat = args[1];
        const delimiter = Utils.charRep(args[2]);
        input = input.replace(/[\r\n]+$/, "");
        const dates = input.split(delimiter);
        if (dates.length !== 2) {
            throw new OperationError("Error: Input should contain exactly two datetime values separated by a delimiter.");
        }

        const date1 = moment(dates[0], dateFormat);
        const date2 = moment(dates[1], dateFormat);

        if (!date1.isValid() || !date2.isValid()) {
            throw new OperationError("Error: One of the provided dates is invalid.");
        }

        const diff = moment.duration(date2.diff(date1));
        return `Years:${diff.years()} Months:${diff.months()} Days:${diff.days()} Hours:${diff.hours()} Minutes:${diff.minutes()} Seconds:${diff.seconds()}`;
    }
}

export default TimeDifference;
