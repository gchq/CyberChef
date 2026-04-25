/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { bytesToHex, parseHexBytes } from "./PaymentUtils.mjs";
import { encryptDesEcb, encryptTdesEcb } from "./CardValidationInternals.mjs";

const CVV_PROFILES = [
    "CVV / CVC (use service code arg)",
    "CVV2 / CVC2 (force 000)",
    "iCVV (force 999)",
];

/**
 * Validates card data inputs.
 *
 * @param {string} pan
 * @param {string} expiryMonth
 * @param {string} expiryYear
 * @param {string} serviceCode
 */
function validateCardData(pan, expiryMonth, expiryYear, serviceCode) {
    if (!/^\d{13,19}$/.test((pan || "").replace(/\s+/g, ""))) {
        throw new OperationError("PAN must be 13 to 19 digits.");
    }
    if (!/^\d{2}$/.test((expiryMonth || "").replace(/\s+/g, ""))) {
        throw new OperationError("Expiry month must be 2 digits.");
    }
    if (!/^\d{2}$/.test((expiryYear || "").replace(/\s+/g, ""))) {
        throw new OperationError("Expiry year must be 2 digits.");
    }
    if (!/^\d{3}$/.test((serviceCode || "").replace(/\s+/g, ""))) {
        throw new OperationError("Service code must be 3 digits.");
    }
}


/**
 * Resolves the service code based on the selected validation-data profile.
 *
 * @param {string} profile
 * @param {string} serviceCode
 * @returns {string}
 */
function resolveServiceCode(profile, serviceCode) {
    switch (profile) {
        case "CVV2 / CVC2 (force 000)":
            return "000";
        case "iCVV (force 999)":
            return "999";
        default:
            return (serviceCode || "").replace(/\s+/g, "");
    }
}


/**
 * XORs two byte arrays.
 *
 * @param {Uint8Array} left
 * @param {Uint8Array} right
 * @returns {Uint8Array}
 */
function xorBytes(left, right) {
    const out = new Uint8Array(left.length);
    for (let i = 0; i < left.length; i++) {
        out[i] = left[i] ^ right[i];
    }
    return out;
}


/**
 * Converts a decimal digit string into BCD bytes.
 *
 * @param {string} digits
 * @returns {Uint8Array}
 */
function digitsToBcdBytes(digits) {
    const out = new Uint8Array(digits.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = (parseInt(digits.charAt(i * 2), 10) << 4) | parseInt(digits.charAt(i * 2 + 1), 10);
    }
    return out;
}


/**
 * Decimalizes a CVV result hex string using the common numeric-first extraction rule.
 *
 * @param {string} hex
 * @param {number} digitCount
 * @returns {string}
 */
function decimalizeCvvHex(hex, digitCount) {
    let out = "";

    for (const ch of hex) {
        if (/\d/.test(ch)) {
            out += ch;
            if (out.length >= digitCount) return out.substring(0, digitCount);
        }
    }

    for (const ch of hex) {
        if (/[A-F]/.test(ch)) {
            out += String(ch.charCodeAt(0) - "A".charCodeAt(0));
            if (out.length >= digitCount) return out.substring(0, digitCount);
        }
    }

    return out.substring(0, digitCount);
}


/**
 * Generates card validation data such as CVV, CVV2, or iCVV.
 *
 * @param {string} cvkHex
 * @param {string} pan
 * @param {string} expiryMonth
 * @param {string} expiryYear
 * @param {string} expiryLayout
 * @param {string} serviceCode
 * @param {string} profile
 * @param {number} digitCount
 * @returns {Object}
 */
function generateCardValidationData(cvkHex, pan, expiryMonth, expiryYear, expiryLayout, serviceCode, profile, digitCount) {
    const normalizedPan = (pan || "").replace(/\s+/g, "");
    const normalizedMonth = (expiryMonth || "").replace(/\s+/g, "");
    const normalizedYear = (expiryYear || "").replace(/\s+/g, "");
    const resolvedServiceCode = resolveServiceCode(profile, serviceCode);

    validateCardData(normalizedPan, normalizedMonth, normalizedYear, resolvedServiceCode);

    const normalizedDigitCount = Math.max(1, Math.min(5, Number(digitCount) || 3));
    const cvk = parseHexBytes(cvkHex, "CVK pair", [16, 24]);
    const keyA = cvk.slice(0, 8);
    const expiry = expiryLayout === "MMYY" ?
        `${normalizedMonth}${normalizedYear}` :
        `${normalizedYear}${normalizedMonth}`;
    const dataDigits = `${normalizedPan}${expiry}${resolvedServiceCode}`.padEnd(32, "0").substring(0, 32);
    const leftBlock = digitsToBcdBytes(dataDigits.substring(0, 16));
    const rightBlock = digitsToBcdBytes(dataDigits.substring(16, 32));
    const step1 = encryptDesEcb(keyA, leftBlock);
    const step2 = xorBytes(step1, rightBlock);
    const resultBytes = encryptTdesEcb(cvk, step2);
    const resultHex = bytesToHex(resultBytes);
    const decimalized = decimalizeCvvHex(resultHex, 5);

    return {
        profile,
        pan: normalizedPan,
        expiry,
        expiryLayout,
        serviceCode: resolvedServiceCode,
        digitCount: normalizedDigitCount,
        inputDigits: dataDigits,
        resultHex,
        decimalized,
        validationData: decimalized.substring(0, normalizedDigitCount)
    };
}


/**
 * Verifies card validation data.
 *
 * @param {string} cvkHex
 * @param {string} pan
 * @param {string} expiryMonth
 * @param {string} expiryYear
 * @param {string} expiryLayout
 * @param {string} serviceCode
 * @param {string} profile
 * @param {string} expectedValue
 * @returns {Object}
 */
function verifyCardValidationData(cvkHex, pan, expiryMonth, expiryYear, expiryLayout, serviceCode, profile, expectedValue) {
    const normalizedExpected = (expectedValue || "").replace(/\s+/g, "");
    if (!/^\d{1,5}$/.test(normalizedExpected)) {
        throw new OperationError("Expected validation data must be 1 to 5 decimal digits.");
    }

    const generated = generateCardValidationData(
        cvkHex,
        pan,
        expiryMonth,
        expiryYear,
        expiryLayout,
        serviceCode,
        profile,
        normalizedExpected.length
    );

    return {
        ...generated,
        expectedValue: normalizedExpected,
        valid: generated.validationData === normalizedExpected
    };
}


export {
    CVV_PROFILES,
    generateCardValidationData,
    verifyCardValidationData,
};
