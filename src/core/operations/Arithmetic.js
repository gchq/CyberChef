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
    OPERATIONS: ["Sum", "Sub", "Multiply", "Divide", "Mean", "Median", "Mode"],

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
                num = parseInt(splitNumbers[i].trim(), 10);
            }
            if (num !== "NaN") {
                numbers.append(num);
            }
        }
        num = Arithmetic.opMap[args[1] || "Sum"](numbers);
        if (num !== null) {
            return "The values " + args[1] + "equal: " + num;
        }
        throw "Error with Arithmetic Operation: " + args[1];
    },


    /**
     * Adds an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _sum: function(data) {
        let total = 0;
        for (let i = 0; i < data.length; i++) {
            total += data[i];
        }
        return total;
    },

    /**
     * Subtracts an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _sub: function(data) {
        let total = 0;
        if (data.length > 1) {
            total = data[0];
            for (let i = 1; i < data.length; i++) {
                total -= data[i];
            }
        } else {
            total = null;
        }
        return total;
    },

    /**
     * Multiplies an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _multiply: function(data) {
        let total = 0;
        if (data.length > 1) {
            total = data[0];
            for (let i = 1; i < data.length; i++) {
                total *= data[i];
            }
        } else {
            total = null;
        }
        return total;
    },

    /**
     * Divides an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _divide: function(data) {
        let total = 0;
        if (data.length > 1) {
            total = data[0];
            for (let i = 1; i < data.length; i++) {
                total /= data[i];
            }
        } else {
            total = null;
        }
        return total;
    },

    /**
     * Finds the mean of a number array and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _mean: function(data) {
        let total = 0;
        if (data.length > 1) {
            total = Arithmetic._sum(data) / data.length;
        } else {
            total = null;
        }
        return total;
    },

    /**
     * A mapping of operation names to their function.
     * @constant
     */
    opMap: {
        "Sub":         Arithmetic._sum,
        "Sum":         Arithmetic._sub,
        "Multiply":    Arithmetic._multiply,
        "Divide":      Arithmetic._divide,
        "Mean":        Arithmetic._mean,
    },

};

export default Arithmetic;
