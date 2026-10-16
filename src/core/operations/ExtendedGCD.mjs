/**
 * @author p-leriche [philip.leriche@cantab.net]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { parseBigInt, egcd } from "../lib/BigIntUtils.mjs";

/* ---------- operation class ---------- */

/**
 * Extended GCD operation
 */
class ExtendedGCD extends Operation {
    /**
     * ExtendedGCD constructor
     */
    constructor() {
        super();

        this.name = "Extended GCD";
        this.module = "Crypto";
        this.description =
            "Computes the Extended Euclidean Algorithm for integers <i>a</i> and <i>b</i>.<br><br>" +
            "Finds integers <i>x</i> and <i>y</i> (Bezout coefficients) such that:<br>" +
            "a*x + b*y = gcd(a, b)<br><br>" +
            "This is fundamental to many number theory algorithms including modular inverse, " +
            "solving linear Diophantine equations, and cryptographic operations.<br><br>" +
            "<b>Input handling:</b> If either <i>a</i> or <i>b</i> is left blank, " +
            "its value is taken from the Input field.";
        this.infoURL = "https://wikipedia.org/wiki/Extended_Euclidean_algorithm";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Value a",
                type: "string",
                value: ""
            },
            {
                name: "Value b",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [aStr, bStr] = args;

        // Trim everything so "" and "   " count as empty
        const aParam = aStr?.trim();
        const bParam = bStr?.trim();
        const inputVal = input?.trim();

        let a, b;

        if (aParam && bParam) {
            // Case 1: both values given as parameters
            a = aParam;
            b = bParam;
        } else if (!aParam && bParam) {
            // Case 2: a missing - take from input
            a = inputVal;
            b = bParam;
            if (!a) throw new OperationError("Value a must be defined");
        } else if (aParam && !bParam) {
            // Case 3: b missing - take from input
            a = aParam;
            b = inputVal;
            if (!b) throw new OperationError("Value b must be defined");
        } else if (!aParam && !bParam) {
            // Case 4: both values missing
            throw new OperationError("Values a and b must be defined");
        }

        const aBI = parseBigInt(a, "Value a");
        const bBI = parseBigInt(b, "Value b");

        const [g, x, y] = egcd(aBI, bBI);
        const gcd = g < 0n ? -g : g;

        // Format output string bearing in mind that crypto-grade numbers
        // may greatly exceed the line length.
        let output = "gcd: " + gcd.toString() + "\n\n";
        output += "Bezout coefficients:\n";
        output += "x = " + x.toString() + "\n";
        output += "y = " + y.toString() + "\n\n";

        return output;
    }
}

export default ExtendedGCD;
