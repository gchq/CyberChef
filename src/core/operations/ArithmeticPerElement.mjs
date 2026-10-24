/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import BigNumber from "bignumber.js";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { ARITHMETIC_DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * Parse a finite BigNumber or raise an operation-friendly error.
 *
 * @param {string} raw
 * @param {string} errorMessage
 * @returns {BigNumber}
 */
function parseFiniteNumber(raw, errorMessage) {
    let number;
    try {
        number = new BigNumber(raw);
    } catch {
        throw new OperationError(errorMessage);
    }

    if (number.isNaN() || !number.isFinite()) {
        throw new OperationError(errorMessage);
    }
    return number;
}

/**
 * Arithmetic per Element operation.
 */
class ArithmeticPerElement extends Operation {
    /**
     * Arithmetic per Element constructor.
     */
    constructor() {
        super();

        this.name = "Arithmetic per Element";
        this.module = "Default";
        this.description = "Applies the same arithmetic operation to every number in a delimited list without converting the values to bytes. This supports values outside the 0-255 range.<br><br>For example, adding <code>10</code> to <code>59 47 62 65 89 23 10</code> produces <code>69 57 72 75 99 33 20</code>.";
        this.infoURL = "https://wikipedia.org/wiki/Arithmetic";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: ARITHMETIC_DELIM_OPTIONS,
            },
            {
                name: "Operation",
                type: "option",
                value: ["Add", "Subtract", "Multiply", "Divide"],
            },
            {
                name: "Value",
                type: "string",
                value: "0",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [delimiterName, operation, rawValue] = args;
        const delimiter = Utils.charRep(delimiterName || "Space");
        const delimiterRegex = Utils.regexRep(delimiterName || "Space");
        const value = parseFiniteNumber(rawValue, "Value must be a finite number.");
        if (operation === "Divide" && value.isZero()) {
            throw new OperationError("Cannot divide by zero.");
        }

        const values = input.trim().split(delimiterRegex);
        if (values.length === 1 && values[0] === "") return "";

        return values.map((raw, index) => {
            const number = parseFiniteNumber(
                raw.trim(),
                `Item ${index + 1} is not a valid finite number: ${raw.trim()}`
            );

            switch (operation) {
                case "Add":
                    return number.plus(value).toFixed();
                case "Subtract":
                    return number.minus(value).toFixed();
                case "Multiply":
                    return number.times(value).toFixed();
                case "Divide":
                    return number.div(value).toFixed();
                default:
                    throw new OperationError("Unknown arithmetic operation.");
            }
        }).join(delimiter);
    }
}

export default ArithmeticPerElement;
