import {BigInteger} from "jsbn";

/**
 * Date and time operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const DateTime = {

    /**
     * @constant
     * @default
     */
    UNITS: ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"],

    /**
     * From UNIX Timestamp operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFromUnixTimestamp: function(input, args) {
        let units = args[0],
            d;

        input = parseFloat(input);

        if (units === "Seconds (s)") {
            d = moment.unix(input);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss") + " UTC";
        } else if (units === "Milliseconds (ms)") {
            d = moment(input);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC";
        } else if (units === "Microseconds (μs)") {
            d = moment(input / 1000);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC";
        } else if (units === "Nanoseconds (ns)") {
            d = moment(input / 1000000);
            return d.tz("UTC").format("ddd D MMMM YYYY HH:mm:ss.SSS") + " UTC";
        } else {
            throw "Unrecognised unit";
        }
    },


    /**
     * @constant
     * @default
     */
    TREAT_AS_UTC: true,

    /**
     * To UNIX Timestamp operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {number}
     */
    runToUnixTimestamp: function(input, args) {
        let units = args[0],
            treatAsUTC = args[1],
            d = treatAsUTC ? moment.utc(input) : moment(input);

        if (units === "Seconds (s)") {
            return d.unix();
        } else if (units === "Milliseconds (ms)") {
            return d.valueOf();
        } else if (units === "Microseconds (μs)") {
            return d.valueOf() * 1000;
        } else if (units === "Nanoseconds (ns)") {
            return d.valueOf() * 1000000;
        } else {
            throw "Unrecognised unit";
        }
    },


    /**
     *@constant
     *@default
     */
    RADIX: ["Decimal", "Hex"],


    /**
     * Converts a Windows FILETIME to Unix Epoch time.
     *
     * @author bwhitn [brian.m.whitney@outlook.com]
     * @param {string} input
     * @param {Object[]} args (not used)
     * @returns {string}
     */
    runFromFiletimeToUnix: function(input, args) {
        let units = args[0], offset = new BigInteger("116444736000000000");
        input = new BigInteger(input).subtract(offset);
        if (units === "Seconds (s)"){
            input = input.divide(new BigInteger("10000000"));
        } else if (units === "Milliseconds (ms)") {
            input = input.divide(new BigInteger("10000"));
        } else if (units === "Microseconds (μs)") {
            input = input.divide(new BigInteger("10"));
        } else if (units === "Nanoseconds (ns)") {
            input = input.multiply(new BigInteger("100"));
        } else {
            throw "The value " + input + " cannot be expressed as a UNIX timestamp.";
        }
        return input.toString();
    },


    /**
     * Converts a Unix Epoch time to Windows FILETIME.
     *
     * @author bwhitn [brian.m.whitney@outlook.com]
     * @param {string} input
     * @param {Object[]} args (not used)
     * @returns {string}
     */
    runToFiletimeFromUnix: function(input, args) {
        let units = args[0], offset = new BigInteger("116444736000000000");
        input = new BigInteger(input);
        if (units === "Seconds (s)"){
            input = input.multiply(new BigInteger("10000000")).add(offset);
        } else if (units === "Milliseconds (ms)") {
            input = input.multiply(new BigInteger("10000")).add(offset);
        } else if (units === "Microseconds (μs)") {
            input = input.multiply(new BigInteger("10")).add(offset);
        } else if (units === "Nanoseconds (ns)") {
            input = input.divide(new BigInteger("100")).add(offset);
        } else {
            throw "The value " + input + " cannot be expressed as a UNIX timestamp.";
        }
        return input.toString();
    },


    /**
     * @constant
     * @default
     */
    DATETIME_FORMATS: [
        {
            name: "Standard date and time",
            value: "DD/MM/YYYY HH:mm:ss"
        },
        {
            name: "American-style date and time",
            value: "MM/DD/YYYY HH:mm:ss"
        },
        {
            name: "International date and time",
            value: "YYYY-MM-DD HH:mm:ss"
        },
        {
            name: "Verbose date and time",
            value: "dddd Do MMMM YYYY HH:mm:ss Z z"
        },
        {
            name: "UNIX timestamp (seconds)",
            value: "X"
        },
        {
            name: "UNIX timestamp offset (milliseconds)",
            value: "x"
        },
        {
            name: "Automatic",
            value: ""
        },
    ],
    /**
     * @constant
     * @default
     */
    INPUT_FORMAT_STRING: "DD/MM/YYYY HH:mm:ss",
    /**
     * @constant
     * @default
     */
    OUTPUT_FORMAT_STRING: "dddd Do MMMM YYYY HH:mm:ss Z z",
    /**
     * @constant
     * @default
     */
    TIMEZONES: ["UTC"].concat(moment.tz.names()),

    /**
     * Translate DateTime Format operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runTranslateFormat: function(input, args) {
        let inputFormat = args[1],
            inputTimezone = args[2],
            outputFormat = args[3],
            outputTimezone = args[4],
            date;

        try {
            date = moment.tz(input, inputFormat, inputTimezone);
            if (!date || date.format() === "Invalid date") throw Error;
        } catch (err) {
            return "Invalid format.\n\n" + DateTime.FORMAT_EXAMPLES;
        }

        return date.tz(outputTimezone).format(outputFormat);
    },


    /**
     * Parse DateTime operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runParse: function(input, args) {
        let inputFormat = args[1],
            inputTimezone = args[2],
            date,
            output = "";

        try {
            date = moment.tz(input, inputFormat, inputTimezone);
            if (!date || date.format() === "Invalid date") throw Error;
        } catch (err) {
            return "Invalid format.\n\n" + DateTime.FORMAT_EXAMPLES;
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
            "\nWeek number: " + date.weekYear() +
            "\nQuarter: " + date.quarter();

        return output;
    },


    /**
     * @constant
     */
    FORMAT_EXAMPLES: "Format string tokens:\n\n\
<table class='table table-striped table-hover table-condensed table-bordered' style='font-family: sans-serif'>\
  <thead>\
    <tr>\
      <th>Category</th>\
      <th>Token</th>\
      <th>Output</th>\
    </tr>\
  </thead>\
  <tbody>\
    <tr>\
      <td><b>Month</b></td>\
      <td>M</td>\
      <td>1 2 ... 11 12</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>Mo</td>\
      <td>1st 2nd ... 11th 12th</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>MM</td>\
      <td>01 02 ... 11 12</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>MMM</td>\
      <td>Jan Feb ... Nov Dec</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>MMMM</td>\
      <td>January February ... November December</td>\
    </tr>\
    <tr>\
      <td><b>Quarter</b></td>\
      <td>Q</td>\
      <td>1 2 3 4</td>\
    </tr>\
    <tr>\
      <td><b>Day of Month</b></td>\
      <td>D</td>\
      <td>1 2 ... 30 31</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>Do</td>\
      <td>1st 2nd ... 30th 31st</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>DD</td>\
      <td>01 02 ... 30 31</td>\
    </tr>\
    <tr>\
      <td><b>Day of Year</b></td>\
      <td>DDD</td>\
      <td>1 2 ... 364 365</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>DDDo</td>\
      <td>1st 2nd ... 364th 365th</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>DDDD</td>\
      <td>001 002 ... 364 365</td>\
    </tr>\
    <tr>\
      <td><b>Day of Week</b></td>\
      <td>d</td>\
      <td>0 1 ... 5 6</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>do</td>\
      <td>0th 1st ... 5th 6th</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>dd</td>\
      <td>Su Mo ... Fr Sa</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>ddd</td>\
      <td>Sun Mon ... Fri Sat</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>dddd</td>\
      <td>Sunday Monday ... Friday Saturday</td>\
    </tr>\
    <tr>\
      <td><b>Day of Week (Locale)</b></td>\
      <td>e</td>\
      <td>0 1 ... 5 6</td>\
    </tr>\
    <tr>\
      <td><b>Day of Week (ISO)</b></td>\
      <td>E</td>\
      <td>1 2 ... 6 7</td>\
    </tr>\
    <tr>\
      <td><b>Week of Year</b></td>\
      <td>w</td>\
      <td>1 2 ... 52 53</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>wo</td>\
      <td>1st 2nd ... 52nd 53rd</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>ww</td>\
      <td>01 02 ... 52 53</td>\
    </tr>\
    <tr>\
      <td><b>Week of Year (ISO)</b></td>\
      <td>W</td>\
      <td>1 2 ... 52 53</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>Wo</td>\
      <td>1st 2nd ... 52nd 53rd</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>WW</td>\
      <td>01 02 ... 52 53</td>\
    </tr>\
    <tr>\
      <td><b>Year</b></td>\
      <td>YY</td>\
      <td>70 71 ... 29 30</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>YYYY</td>\
      <td>1970 1971 ... 2029 2030</td>\
    </tr>\
    <tr>\
      <td><b>Week Year</b></td>\
      <td>gg</td>\
      <td>70 71 ... 29 30</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>gggg</td>\
      <td>1970 1971 ... 2029 2030</td>\
    </tr>\
    <tr>\
      <td><b>Week Year (ISO)</b></td>\
      <td>GG</td>\
      <td>70 71 ... 29 30</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>GGGG</td>\
      <td>1970 1971 ... 2029 2030</td>\
    </tr>\
    <tr>\
      <td><b>AM/PM</b></td>\
      <td>A</td>\
      <td>AM PM</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>a</td>\
      <td>am pm</td>\
    </tr>\
    <tr>\
      <td><b>Hour</b></td>\
      <td>H</td>\
      <td>0 1 ... 22 23</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>HH</td>\
      <td>00 01 ... 22 23</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>h</td>\
      <td>1 2 ... 11 12</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>hh</td>\
      <td>01 02 ... 11 12</td>\
    </tr>\
    <tr>\
      <td><b>Minute</b></td>\
      <td>m</td>\
      <td>0 1 ... 58 59</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>mm</td>\
      <td>00 01 ... 58 59</td>\
    </tr>\
    <tr>\
      <td><b>Second</b></td>\
      <td>s</td>\
      <td>0 1 ... 58 59</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>ss</td>\
      <td>00 01 ... 58 59</td>\
    </tr>\
    <tr>\
      <td><b>Fractional Second</b></td>\
      <td>S</td>\
      <td>0 1 ... 8 9</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>SS</td>\
      <td>00 01 ... 98 99</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>SSS</td>\
      <td>000 001 ... 998 999</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>SSSS ... SSSSSSSSS</td>\
      <td>000[0..] 001[0..] ... 998[0..] 999[0..]</td>\
    </tr>\
    <tr>\
      <td><b>Timezone</b></td>\
      <td>z or zz</td>\
      <td>EST CST ... MST PST</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>Z</td>\
      <td>-07:00 -06:00 ... +06:00 +07:00</td>\
    </tr>\
    <tr>\
      <td></td>\
      <td>ZZ</td>\
      <td>-0700 -0600 ... +0600 +0700</td>\
    </tr>\
    <tr>\
      <td><b>Unix Timestamp</b></td>\
      <td>X</td>\
      <td>1360013296</td>\
    </tr>\
    <tr>\
      <td><b>Unix Millisecond Timestamp</b></td>\
      <td>x</td>\
      <td>1360013296123</td>\
    </tr>\
  </tbody>\
</table>",

};

export default DateTime;
