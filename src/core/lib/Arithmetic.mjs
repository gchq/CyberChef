/**
 * @author bwhitn [brian.m.whitney@outlook.com]
 * @author d98762625 [d98762625@gmailcom]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import BigNumber from "bignumber.js";


/**
 * Converts a string array to a number array.
 *
 * @param {string[]} input
 * @param {string} delim
 * @returns {BigNumber[]}
 */
export function createNumArray(input, delim) {
    delim = Utils.charRep(delim || "Space");
    const splitNumbers = input.split(delim);
    const numbers = [];
    let num;

    splitNumbers.map((number) => {
        try {
            num = BigNumber(number.trim());
            if (!num.isNaN()) {
                numbers.push(num);
            }
        } catch (err) {
            // This line is not a valid number
        }
    });
    return numbers;
}


/**
 * Adds an array of numbers and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function sum(data) {
    if (data.length > 0) {
        return data.reduce((acc, curr) => acc.plus(curr));
    }
}


/**
 * Subtracts an array of numbers and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function sub(data) {
    if (data.length > 0) {
        return data.reduce((acc, curr) => acc.minus(curr));
    }
}


/**
 * Multiplies an array of numbers and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function multi(data) {
    if (data.length > 0) {
        return data.reduce((acc, curr) => acc.times(curr));
    }
}


/**
 * Divides an array of numbers and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function div(data) {
    if (data.length > 0) {
        return data.reduce((acc, curr) => acc.div(curr));
    }
}


/**
 * Computes mean of a number array and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function mean(data) {
    if (data.length > 0) {
        return sum(data).div(data.length);
    }
}


/**
 * Computes median of a number array and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function median(data) {
    if ((data.length % 2) === 0 && data.length > 0) {
        data.sort(function(a, b) {
            return a.minus(b);
        });
        const first = data[Math.floor(data.length / 2)];
        const second = data[Math.floor(data.length / 2) - 1];
        return mean([first, second]);
    } else {
        return data[Math.floor(data.length / 2)];
    }
}


/**
 * Computes standard deviation of a number array and returns the value.
 *
 * @param {BigNumber[]} data
 * @returns {BigNumber}
 */
export function stdDev(data) {
    if (data.length > 0) {
        const avg = mean(data);
        let devSum = new BigNumber(0);
        data.map((datum) => {
            devSum = devSum.plus(datum.minus(avg).pow(2));
        });
        return devSum.div(data.length).sqrt();
    }
}
