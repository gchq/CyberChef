import Utils from "../Utils.js";

/**
 * Math operations on numbers.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Arithmetic = {

    /**
     * @constant
     * @default
     */
    DELIM_OPTIONS: ["Space", "Comma", "Semi-colon", "Colon", "Line feed", "CRLF"],

    /**
     * @constant
     * @default
     */
    OPERATIONS: [
        "Sum",
        "Sub",
        "Multiply",
        "Divide",
        "Mean",
        "Median",
        "Standard Deviation"
    ],

    /**
     *
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runOp: function(input, args) {
        const delim = Utils.charRep[args[0] || "Space"];
        let splitNumbers = input.split(delim),
            numbers = [],
            num;
        for (let i = 0; i < splitNumbers.length; i++) {
            if (splitNumbers[i].indexOf(".") >= 0) {
                num = parseFloat(splitNumbers[i].trim());
            } else {
                num = parseInt(splitNumbers[i].trim(), 0);
            }
            if (!isNaN(num)) {
                numbers.push(num);
            }
        }
        num = Arithmetic.opMap[args[1] || "Sum"](numbers);
        if (num === null) {
            return "";
        }
        return num.toString();
    },


    /**
     * Adds an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _sum: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc + curr);
        } else {
            return null;
        }
    },

    /**
     * Subtracts an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _sub: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc - curr);
        } else {
            return null;
        }
    },

    /**
     * Multiplies an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _multiply: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc * curr);
        } else {
            return null;
        }
    },

    /**
     * Divides an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _divide: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc / curr);
        } else {
            return null;
        }
    },

    /**
     * Finds the mean of a number array and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _mean: function(data) {
        if (data.length > 0) {
            return Arithmetic._sum(data) / data.length;
        } else {
            return null;
        }
    },

    /**
     * Finds the median of a number array and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _median: function (data) {
        if ((data.length % 2) === 0) {
            let first, second;
            data.sort(function(a, b){
                return a - b;
            });
            first = data[Math.floor(data.length / 2)];
            second = data[Math.floor(data.length / 2) - 1];
            return Arithmetic._mean([first, second]);
        } else {
            return data[Math.floor(data.length / 2)];
        }
    },

    /**
     * Finds the standard deviation of a number array and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _stdDev: function (data) {
        if (data.length > 0) {
            let avg = Arithmetic._mean(data);
            let devSum = 0;
            for (let i = 0; i < data.length; i++) {
                devSum += (data[i] - avg) ** 2;
            }
            return Math.sqrt(devSum / data.length);
        } else {
            return null;
        }
    },

    /**
     * A mapping of operation names to their function.
     *
     * @constant
     */
    opMap: {
        "Sum": function(numArray) {
            return Arithmetic._sum(numArray);
        },
        "Sub": function(numArray) {
            return Arithmetic._sub(numArray);
        },
        "Multiply": function(numArray) {
            return Arithmetic._multiply(numArray);
        },
        "Divide": function(numArray) {
            return Arithmetic._divide(numArray);
        },
        "Mean": function(numArray) {
            return Arithmetic._mean(numArray);
        },
        "Median": function(numArray) {
            return Arithmetic._median(numArray);
        },
        "Standard Deviation": function (numArray) {
            return Arithmetic._stdDev(numArray);
        },
    },
};

export default Arithmetic;
