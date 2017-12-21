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
     * @returns {number}
     */
    computeSum: function(input, args) {
        const val = Arithmetic._sum(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeSub: function(input, args) {
        let val = Arithmetic._sub(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeMulti: function(input, args) {
        let val = Arithmetic._multi(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeDiv: function(input, args) {
        let val = Arithmetic._div(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeMean: function(input, args) {
        let val = Arithmetic._mean(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeMedian: function(input, args) {
        let val = Arithmetic._median(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    computeStdDev: function(input, args) {
        let val = Arithmetic._stdDev(Arithmetic._createNumArray(input, args[0]));
        return typeof(val) === 'number' ? val.toString() : "";
    },


    _createNumArray: function(input, delim) {
        const delim = Utils.charRep[delim || "Space"];
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
     * Finds the mean of a number array and returns the value.
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
        }
    },
};

export default Arithmetic;
