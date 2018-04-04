import Utils from "../Utils.js";
import BigNumber from "bignumber.js";


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
    DELIM_OPTIONS: ["Line feed", "Space", "Comma", "Semi-colon", "Colon", "CRLF"],


    /**
     * Splits a string based on a delimiter and calculates the sum of numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runSum: function(input, args) {
        const val = Arithmetic._sum(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Splits a string based on a delimiter and subtracts all the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runSub: function(input, args) {
        let val = Arithmetic._sub(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Splits a string based on a delimiter and multiplies the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runMulti: function(input, args) {
        let val = Arithmetic._multi(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Splits a string based on a delimiter and divides the numbers.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runDiv: function(input, args) {
        let val = Arithmetic._div(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Splits a string based on a delimiter and computes the mean (average).
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runMean: function(input, args) {
        let val = Arithmetic._mean(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Splits a string based on a delimiter and finds the median.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runMedian: function(input, args) {
        let val = Arithmetic._median(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * splits a string based on a delimiter and computes the standard deviation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {BigNumber}
     */
    runStdDev: function(input, args) {
        let val = Arithmetic._stdDev(Arithmetic._createNumArray(input, args[0]));
        return val instanceof BigNumber ? val : new BigNumber(NaN);
    },


    /**
     * Converts a string array to a number array.
     *
     * @private
     * @param {string[]} input
     * @param {string} delim
     * @returns {BigNumber[]}
     */
    _createNumArray: function(input, delim) {
        delim = Utils.charRep(delim || "Space");
        let splitNumbers = input.split(delim),
            numbers = [],
            num;

        for (let i = 0; i < splitNumbers.length; i++) {
            try {
                num = BigNumber(splitNumbers[i].trim());
                if (!num.isNaN()) {
                    numbers.push(num);
                }
            } catch (err) {
                // This line is not a valid number
            }
        }
        return numbers;
    },


    /**
     * Adds an array of numbers and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _sum: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc.plus(curr));
        }
    },


    /**
     * Subtracts an array of numbers and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _sub: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc.minus(curr));
        }
    },


    /**
     * Multiplies an array of numbers and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _multi: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc.times(curr));
        }
    },


    /**
     * Divides an array of numbers and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _div: function(data) {
        if (data.length > 0) {
            return data.reduce((acc, curr) => acc.div(curr));
        }
    },


    /**
     * Computes mean of a number array and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _mean: function(data) {
        if (data.length > 0) {
            return Arithmetic._sum(data).div(data.length);
        }
    },


    /**
     * Computes median of a number array and returns the value.
     *
     * @private
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _median: function (data) {
        if ((data.length % 2) === 0 && data.length > 0) {
            let first, second;
            data.sort(function(a, b){
                return a.minus(b);
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
     * @param {BigNumber[]} data
     * @returns {BigNumber}
     */
    _stdDev: function (data) {
        if (data.length > 0) {
            let avg = Arithmetic._mean(data);
            let devSum = new BigNumber(0);
            for (let i = 0; i < data.length; i++) {
                devSum = devSum.plus(data[i].minus(avg).pow(2));
            }
            return devSum.div(data.length).sqrt();
        }
    },
};

export default Arithmetic;
