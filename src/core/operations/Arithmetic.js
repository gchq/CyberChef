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
     * Splits a string based on a delimiter and calculates the sum of numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSum: function(input, args) {
        const val = Arithmetic._sum(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Splits a string based on a delimiter and subtracts all the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSub: function(input, args) {
        let val = Arithmetic._sub(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Splits a string based on a delimiter and multiplies the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMulti: function(input, args) {
        let val = Arithmetic._multi(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Splits a string based on a delimiter and divides the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDiv: function(input, args) {
        let val = Arithmetic._div(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Splits a string based on a delimiter and computes the mean (average).
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMean: function(input, args) {
        let val = Arithmetic._mean(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Splits a string based on a delimiter and finds the median.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMedian: function(input, args) {
        let val = Arithmetic._median(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * splits a string based on a delimiter and computes the standard deviation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runStdDev: function(input, args) {
        let val = Arithmetic._stdDev(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === "number" ? val.toString() : "";
    },


    /**
     * Converts a string array to a number array.
     *
     * @param {string[]} input
     * @param {string} delim
     * @returns {number[]}
     */
    _createNumArray: function(input, delim) {
        delim = Utils.charRep[delim || "Space"];
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
        return numbers;
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
        }
    },

    /**
     * Multiplies an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _multi: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc * curr);
        }
    },

    /**
     * Divides an array of numbers and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _div: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc / curr);
        }
    },

    /**
     * Computes mean of a number array and returns the value.
     *
     * @private
     * @param {number[]} data
     * @returns {number}
     */
    _mean: function(data) {
        if (data.length > 0) {
            return Arithmetic._sum(data) / data.length;
        }
    },

    /**
     * Computes median of a number array and returns the value.
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
     * Computes standard deviation of a number array and returns the value.
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
        }
    },
};

export default Arithmetic;
