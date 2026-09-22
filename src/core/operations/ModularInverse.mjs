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
 * Modular Inverse operation
 */
class ModularInverse extends Operation {

    /**
     * ModularInverse constructor
     */
    constructor() {
        super();

        this.name = "Modular Inverse";
        this.module = "Crypto";
        this.description =
            "Computes the modular multiplicative inverse of <i>a</i> modulo <i>m</i>.<br><br>" +
            "Finds <i>x</i> such that a*x = 1 (mod m).<br><br>" +
            "<b>Input handling:</b> If either <i>a</i> or <i>m</i> is left blank, " +
            "its value is taken from the Input field.";
        this.infoURL = "https://wikipedia.org/wiki/Modular_multiplicative_inverse";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Value (a)",
                type: "string",
                value: ""
            },
            {
                name: "Modulus (m)",
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
        const [aStr, mStr] = args;

        // Trim everything so "" and "   " count as empty
        const aParam = aStr?.trim();
        const mParam = mStr?.trim();
        const inputVal = input?.trim();

        let a, m;

        if (aParam && mParam) {
            // Case 1: value and modulus both given as parameters
            a = aParam;
            m = mParam;
        } else if (!aParam && mParam) {
            // Case 2: value missing - take from input
            a = inputVal;
            m = mParam;
            if (!a) throw new OperationError("Value (a) must be defined");
        } else if (aParam && !mParam) {
            // Case 3: modulus missing - take from input
            a = aParam;
            m = inputVal;
            if (!m) throw new OperationError("Modulus (m) must be defined");
        } else if (!aParam && !mParam) {
            // Case 4: value and modulus both missing
            throw new OperationError("Value (a) and Modulus (m) must be defined");
        }

        const aBI = parseBigInt(a, "Value (a)");
        const mBI = parseBigInt(m, "Modulus (m)");

        if (mBI <= 0n) {
            throw new OperationError("Modulus must be greater than zero");
        }

        const aNorm = ((aBI % mBI) + mBI) % mBI;
        const [g, x] = egcd(aNorm, mBI);

        if (g !== 1n && g !== -1n) {
            throw new OperationError("Inverse does not exist because gcd(a, m) ≠ 1");
        }

        let inv = x;
        if (g === -1n) inv = -inv;

        inv = ((inv % mBI) + mBI) % mBI;


        return inv.toString();
    }
}

export default ModularInverse;
