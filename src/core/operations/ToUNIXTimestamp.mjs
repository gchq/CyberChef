/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import moment from "moment-timezone";
import {UNITS} from "../lib/DateTime";

/**
 * To UNIX Timestamp operation
 */
class ToUNIXTimestamp extends Operation {

    /**
     * ToUNIXTimestamp constructor
     */
    constructor() {
        super();

        this.name = "To UNIX Timestamp";
        this.module = "Default";
        this.description = "Parses a datetime string in UTC and returns the corresponding UNIX timestamp.<br><br>e.g. <code>Mon 1 January 2001 11:00:00</code> becomes <code>978346800</code><br><br>A UNIX timestamp is a 32-bit value representing the number of seconds since January 1, 1970 UTC (the UNIX epoch).";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Units",
                "type": "option",
                "value": UNITS
            },
            {
                "name": "Treat as UTC",
                "type": "boolean",
                "value": true
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
        const [units, treatAsUTC, showDateTime] = args,
            d = treatAsUTC ? moment.utc(input) : moment(input);

        let result = "";

        if (units === "Seconds (s)") {
            result = d.unix();
        } else if (units === "Milliseconds (ms)") {
            result = d.valueOf();
        } else if (units === "Microseconds (μs)") {
            result = d.valueOf() * 1000;
        } else if (units === "Nanoseconds (ns)") {
            result = d.valueOf() * 1000000;
        } else {
            throw "Unrecognised unit";
        }

        return showDateTime ? `${result} (${d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss")} UTC)` : result.toString();
    }

}

export default ToUNIXTimestamp;
