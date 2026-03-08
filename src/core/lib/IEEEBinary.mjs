/**
 * IEEEBinary functions.
 *
 * Convert between:
 *   - exact decimal strings ↔ IEEE 754 double-precision (binary64) bits
 * using BigInt rational arithmetic and correct Round-to-Nearest-Even (RNE).
 *
 * @author atsiv1 [atsiv1@proton.me]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";

// IEEE 754 double-precision constants
const EXP_BITS   = 11n;
const MANT_BITS  = 52n;
const PRECISION  = MANT_BITS + 1n;
const BIAS       = (1n << (EXP_BITS - 1n)) - 1n;
const MAX_EXP    = (1n << EXP_BITS) - 1n;

const EXP_BITS_NUM  = Number(EXP_BITS);
const MANT_BITS_NUM = Number(MANT_BITS);

function normaliseInput(input) {
    if (input === null || input === undefined)
        throw new Error("Invalid decimal number");
    return String(input).trim();
}

function safeBigInt(str, context="number") {
    try {
        return BigInt(str);
    } catch {
        throw new Error(`Invalid ${context}`);
    }
}


/**
 * Compute 10^exp as BigInt without using ** on BigInt, to avoid
 * environments that try to coerce BigInt to Number.
 *
 * @param {bigint} exp  Non-negative BigInt exponent.
 * @returns {bigint}
 */
function pow10BigInt(exp) {
    if (exp < 0n) {
        throw new RangeError("pow10BigInt expects non-negative exponent");
    }
    let e = exp;
    let result = 1n;
    let base = 10n;

    // fast exponentiation by squaring
    while (e > 0n) {
        if ((e & 1n) === 1n) {
            result *= base;
        }
        base *= base;
        e >>= 1n;
    }
    return result;
}

/**
 * Converts an exact rational number (num / den) into its decimal string representation.
 *
 * The result is returned as a string. If the decimal is repeating, the repeating
 * part will be enclosed in parentheses (e.g., "0.(3)").
 *
 * @param {bigint} num - The numerator of the fraction.
 * @param {bigint} den - The denominator of the fraction.
 * @returns {string} The decimal representation of the fraction, including repeating decimals in parentheses.
 *
 * @example
 * // returns "0.5"
 * fractionToDecimal(1n, 2n);
 *
 * // returns "0.(3)"
 * fractionToDecimal(1n, 3n);
 *
 * // returns "1.25"
 * fractionToDecimal(5n, 4n);
 *
 * @note For many binary64 values, the repeating cycle can be long, which is
 * mathematically correct but may produce large strings.
 */
function fractionToDecimal(num, den) {
    const intPart = num / den;
    let rem = num % den;

    if (rem === 0n) {
        return intPart.toString();
    }

    const seen = new Map();
    const digits = [];
    let pos = 0;

    while (rem !== 0n) {
        if (seen.has(rem)) {
            const p = seen.get(rem);
            digits.splice(p, 0, "(");
            digits.push(")");
            break;
        }
        seen.set(rem, pos++);

        rem *= 10n;
        digits.push((rem / den).toString());
        rem %= den;
    }

    return intPart.toString() + "." + digits.join("");
}

/**
 * Converts a 64-bit IEEE-754 binary64 representation into its exact
 * decimal string.
 *
 * Note: While binary64 can only represent a subset of all real numbers,
 * every representable value has a finite decimal expansion. This function
 * uses BigInt arithmetic to retrieve the exact value without the
 * precision loss typically encountered in standard floating-point arithmetic.
 *
 * @param {string} binary64String
 * @returns {string}
 *
 * @example
 * // returns "10"
 * FromIEEE754Float64("0 10000000010 0100000000000000000000000000000000000000000000000000");
 *
 * // returns "7.29999999999999982236431605997495353221893310546875"
 * FromIEEE754Float64("0 10000000001 1101001100110011001100110011001100110011001100110011);
 */
export function FromIEEE754Float64(binary64String) {
    const bin = binary64String.trim().replace(/\s+/g, "");

    if (bin.length !== 64) {
        throw new Error("Input must be 64 bits.");
    }

    const signBit  = bin[0];
    const expBits  = bin.slice(1, 12);
    const mantBits = bin.slice(12);

    const sign = signBit === "1" ? "-" : "";
    const exp  = parseInt(expBits, 2);
    const mant = BigInt("0b" + mantBits);

    // Special values
    if (exp === Number(MAX_EXP)) {
        if (mant === 0n) {
            return sign + "Infinity";
        }
        return "NaN";
    }

    let e;
    let m;

    if (exp === 0) {
        // Subnormal: exponent is 1 - BIAS, no implicit leading 1
        e = 1n - BIAS - MANT_BITS;
        m = mant;
    } else {
        // Normal: exponent is exp - BIAS, with implicit leading 1
        e = BigInt(exp) - BIAS - MANT_BITS;
        m = mant | (1n << MANT_BITS);
    }

    // If exponent is non-negative, result is an integer
    if (e >= 0n) {
        return sign + (m << e).toString();
    }

    // Otherwise, it's a fraction m / 2^(-e)
    const den = 1n << (-e);
    return sign + fractionToDecimal(m, den);
}


/**
 *
 * Converts a decimal number into its IEEE-754 double-precision
 * (binary64) bit representation.
 *
 * @param {string|number|BigInt} input
 * @returns {string}
 *
 * @example
 * // returns "0 10000000000 0000000000000000000000000000000000000000000000000000"
 * ToIEEE754Float64("2");
 *
 * // returns "0 10000000011 0111010011001100110011001100110011001100110011001101"
 * ToIEEE754Float64("23.300000000000000710542735760100185871124267578125");
 */
export function ToIEEE754Float64(input) {
    input = normaliseInput(input);

    const expOnes   = "1".repeat(EXP_BITS_NUM);
    const mantZeros = "0".repeat(MANT_BITS_NUM);

    // Special values: NaN / ±Infinity
    if (/^(NaN)$/i.test(input)) {
        return `0 ${expOnes} 1${"0".repeat(MANT_BITS_NUM - 1)}`;
    }

    if (/^[+-]?inf(inity)?$/i.test(input)) {
        const s = input.startsWith("-") ? "1" : "0";
        return `${s} ${expOnes} ${mantZeros}`;
    }

    let sign = 0n;
    if (input.startsWith("-")) {
        sign = 1n;
        input = input.slice(1);
    } else if (input.startsWith("+")) {
        input = input.slice(1);
    }

    let sci = 0n;
    const sciMatch = input.match(/^(.*)e([+-]?\d+)$/i);
    if (sciMatch) {
        input = sciMatch[1];
        sci = safeBigInt(sciMatch[2], "exponent");
    }

    let [intStr, fracStr] = input.split(".");
    intStr  = (intStr  || "0").replace(/_/g, "");
    fracStr = (fracStr || "").replace(/_/g, "");

    let N = safeBigInt(intStr, "integer part");
    let D = 1n;

    if (fracStr.length > 0) {
        const pow10 = pow10BigInt(BigInt(fracStr.length)); 
        N = N * pow10 + safeBigInt(fracStr, "fractional part");
        D = pow10;
    }

    // Apply scientific exponent
    if (sci > 0n) {
        N *= pow10BigInt(sci);
    } else if (sci < 0n) {
        D *= pow10BigInt(-sci);
    }

    // Zero (preserve sign, including -0)
    if (N === 0n) {
        const expZero = "0".repeat(EXP_BITS_NUM);
        return `${sign} ${expZero} ${mantZeros}`;
    }

    // Reduce the fraction
    const g = Utils.gcdBigInt(N, D);
    N /= g;
    D /= g;

    // Compute binary exponent approximation (with fix)
    const eN = BigInt(N.toString(2).length - 1);
    const eD = BigInt(D.toString(2).length - 1);
    let e2   = eN - eD;

    const GRS = 3n;                    // Guard, Round, Sticky bits
    const totalBits = PRECISION + GRS;

    // Approximate bit-length of normalized N/D: e2 + 1
    const currentBitLength = eN - eD + 1n;

    // Shift so we get 'totalBits' bits of precision in the quotient
    let shift = totalBits - currentBitLength;

    let num, den;

    if (shift >= 0n) {
        num = N << shift;
        den = D;
    } else {
        num = N;
        den = D << (-shift);
    }

    let full = num / den;
    let rem  = num % den;

    // Normalisation Fix
    if (full < (1n << (totalBits - 1n))) {
        e2   -= 1n;
        shift += 1n;

        if (shift >= 0n) {
            num <<= 1n;
        } else {
            den >>= 1n;
        }

        full = num / den;
        rem  = num % den;
    }

    const roundMask = (1n << GRS) - 1n;
    const roundBits = full & roundMask;
    let mant        = full >> GRS;

    // Extract G, R, S bits
    const G = (roundBits >> 2n) & 1n;
    const R = (roundBits >> 1n) & 1n;
    const S = ((roundBits & 1n) === 1n || rem !== 0n) ? 1n : 0n;

    let roundUp = false;

    if (G === 1n) {
        if (R === 1n || S === 1n) {
            // strictly > 0.5
            roundUp = true;
        } else if ((mant & 1n) === 1n) {
            // exactly 0.5 → round to even
            roundUp = true;
        }
    }

    if (roundUp) mant++;

    // Renormalize if mantissa overflowed
    if (mant >= (1n << PRECISION)) {
        mant >>= 1n;
        e2   += 1n;
    }

    // Overflow → Infinity
    if (e2 + BIAS >= MAX_EXP) {
        return `${sign} ${expOnes} ${mantZeros}`;
    }

    // Normal number (exponent >= 1)
    if (e2 + BIAS >= 1n) {
        const expValue = e2 + BIAS;
        const expBits  = expValue.toString(2).padStart(EXP_BITS_NUM, "0");

        // Remove the implicit leading 1: mantissa stores only the 52 explicit bits
        const mantBits = (mant & ((1n << MANT_BITS) - 1n))
            .toString(2)
            .padStart(MANT_BITS_NUM, "0");

        return `${sign} ${expBits} ${mantBits}`;
    }

    // Subnormal numbers (exponent field = 0)
    const minNormalExponentValue = 1n - BIAS;
    const subShift = minNormalExponentValue - e2;

    let subMant = mant >> subShift;

    // Subnormal mantissa uses all 52 explicit bits
    subMant &= (1n << MANT_BITS) - 1n;

    const expZero = "0".repeat(EXP_BITS_NUM);

    if (subMant === 0n) {
        return `${sign} ${expZero} ${mantZeros}`;
    }

    const subMantBits = subMant.toString(2).padStart(MANT_BITS_NUM, "0");
    return `${sign} ${expZero} ${subMantBits}`;
}
