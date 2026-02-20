/**
 * @author p-leriche [philip.leriche@cantab.net]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/* ---------- helper functions ---------- */

/**
 * modPow helper operation
 */
function modPow(base, exponent, modulus) {
    let result = 1n;
    base %= modulus;

    while (exponent > 0n) {
        if (exponent & 1n) {
            result = (result * base) % modulus;
        }
        base = (base * base) % modulus;
        exponent >>= 1n;
    }

    return result;
}

/**
 * parseBigInt helper operation
 */
function parseBigInt(value, param) {
    const v = value.trim();

    if (/^0x[0-9a-f]+$/i.test(v)) return BigInt(v);
    if (/^[0-9]+$/.test(v)) return BigInt(v);

    throw new OperationError(param + " must be decimal or hex (0x...)");
}

/* ---------- operation class ---------- */


/**
 * Modular Exponentiation operation
 */
class ModularExponentiation extends Operation {

    /**
     * ModularExponentiation constructor
     */
    constructor() {
        super();

        this.name = "Modular Exponentiation";
        this.module = "Crypto";
        this.description = "Performs modular exponentiation, as used in Diffie-Hellman and RSA.<br><br>" +
            "Computes Base ^ Exponent mod Modulus.<br><br>" +
            "<b>Input handling:</b> If <i>either</i> Base <i>or</i> Exponent is left blank, " +
            "its value is taken from the Input field.";
        this.infoURL = "https://wikipedia.org/wiki/Modular_exponentiation";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Base",
                type: "string",
                value: ""
            },
            {
                name: "Modulus",
                type: "string",
                value: "1"
            },
            {
                name: "Exponent",
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
        const [baseStr, modStr, expStr] = args;

        // Trim everything so "" and "   " count as empty
        const baseParam = baseStr?.trim();
        const expParam  = expStr?.trim();
        const modParam  = modStr?.trim();
        const inputVal  = input?.trim();

        const mod = modParam;
        if (!mod) {
            throw new OperationError("Modulus must be defined");
        }

        // Base *or* Exponent (but not both) are taken from the Input
        // if their boxes are empty.
        let base, exp;
        if (baseParam && expParam) {
            // Case 1: base and exponent both given as parameters
            base = baseParam;
            exp  = expParam;
        } else if (!baseParam && expParam) {
            // Case 2: base missing - take from input
            base = inputVal;
            exp  = expParam;
            if (!base) {
                throw new OperationError("Base must be defined");
            }
        } else if (baseParam && !expParam) {
            // Case 3: exponent missing - take from input
            base = baseParam;
            exp  = inputVal;
            if (!exp) {
                throw new OperationError("Exponent must be defined");
            }
        } else if (!inputVal) {
            // Case 4: base and exponent both missing
            throw new OperationError("Base and Exponent must be defined");
        } else throw new OperationError("Ambiguous input: specify either Base or Exponent when using Input");

        // Parse numbers
        const baseBI = parseBigInt(base, "Base");
        const expBI  = parseBigInt(exp, "Exponent");
        const modBI  = parseBigInt(mod, "Modulus");

        // Check for invalid modulus (parseBigInt eliminates negatives)
        if (modBI === 0n) {
            throw new OperationError("Modulus must be greater than zero");
        }

        return modPow(baseBI, expBI, modBI).toString();
    }
}

export default ModularExponentiation;
