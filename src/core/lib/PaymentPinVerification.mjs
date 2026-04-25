/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { bytesToHex, parseHexBytes } from "./PaymentUtils.mjs";
import { encryptTdesEcb } from "./CardValidationInternals.mjs";

/**
 * Normalizes a PAN string.
 *
 * @param {string} pan
 * @returns {string}
 */
function normalizePan(pan) {
    const normalized = (pan || "").replace(/\s+/g, "");
    if (!/^\d{12,19}$/.test(normalized)) {
        throw new OperationError("PAN must be 12 to 19 digits.");
    }
    return normalized;
}

/**
 * Normalizes a clear PIN string.
 *
 * @param {string} pin
 * @returns {string}
 */
function normalizePin(pin) {
    const normalized = (pin || "").replace(/\s+/g, "");
    if (!/^\d{4,12}$/.test(normalized)) {
        throw new OperationError("PIN must be 4 to 12 digits.");
    }
    return normalized;
}

/**
 * Converts hexadecimal characters to decimal digits via a decimalization table.
 *
 * @param {string} hex
 * @param {string} decimalizationTable
 * @returns {string}
 */
function decimalizeHex(hex, decimalizationTable) {
    const normalizedTable = (decimalizationTable || "").replace(/\s+/g, "");
    if (!/^\d{16}$/.test(normalizedTable)) {
        throw new OperationError("Decimalization table must be 16 decimal digits.");
    }

    let out = "";
    for (const ch of hex.toUpperCase()) {
        out += normalizedTable[parseInt(ch, 16)];
    }
    return out;
}

/**
 * Packs a hex string into bytes.
 *
 * @param {string} hex
 * @returns {Uint8Array}
 */
function packHex(hex) {
    return parseHexBytes(hex, "Packed block");
}

/**
 * Generates the IBM 3624 natural PIN.
 *
 * @param {string} pvkHex
 * @param {string} decimalizationTable
 * @param {string} pinValidationData
 * @param {string} padCharacter
 * @param {number} pinLength
 * @returns {Object}
 */
function generateIbm3624NaturalPin(pvkHex, decimalizationTable, pinValidationData, padCharacter, pinLength=4) {
    const normalizedValidationData = (pinValidationData || "").replace(/\s+/g, "");
    const normalizedPad = (padCharacter || "").replace(/\s+/g, "").toUpperCase();
    const normalizedPinLength = Math.max(4, Math.min(12, Number(pinLength) || 4));

    if (!/^\d{4,16}$/.test(normalizedValidationData)) {
        throw new OperationError("PIN validation data must be 4 to 16 decimal digits.");
    }
    if (!/^[0-9A-F]$/.test(normalizedPad)) {
        throw new OperationError("PIN validation data pad character must be one hex nibble.");
    }

    const pvk = parseHexBytes(pvkHex, "PIN verification key", [16, 24]);
    const blockHex = normalizedValidationData.padEnd(16, normalizedPad).substring(0, 16);
    const cipherHex = bytesToHex(encryptTdesEcb(pvk, packHex(blockHex)));
    const decimalized = decimalizeHex(cipherHex, decimalizationTable);

    return {
        pinVerificationKeyHex: bytesToHex(pvk),
        pinValidationData: normalizedValidationData,
        pinValidationDataPadCharacter: normalizedPad,
        pinLength: normalizedPinLength,
        validationBlockHex: blockHex,
        encryptedValidationBlockHex: cipherHex,
        decimalized,
        naturalPin: decimalized.substring(0, normalizedPinLength)
    };
}

/**
 * Generates an IBM 3624 offset for a supplied clear PIN.
 *
 * @param {string} pvkHex
 * @param {string} decimalizationTable
 * @param {string} pinValidationData
 * @param {string} padCharacter
 * @param {string} pin
 * @returns {Object}
 */
function generateIbm3624PinOffset(pvkHex, decimalizationTable, pinValidationData, padCharacter, pin) {
    const normalizedPin = normalizePin(pin);
    const natural = generateIbm3624NaturalPin(
        pvkHex,
        decimalizationTable,
        pinValidationData,
        padCharacter,
        normalizedPin.length
    );
    let offset = "";
    for (let i = 0; i < normalizedPin.length; i++) {
        offset += ((parseInt(normalizedPin[i], 10) - parseInt(natural.naturalPin[i], 10) + 10) % 10).toString();
    }
    return {
        ...natural,
        pin: normalizedPin,
        pinOffset: offset
    };
}

/**
 * Verifies a clear PIN against an IBM 3624 offset.
 *
 * @param {string} pvkHex
 * @param {string} decimalizationTable
 * @param {string} pinValidationData
 * @param {string} padCharacter
 * @param {string} pinOffset
 * @param {string} pin
 * @returns {Object}
 */
function verifyIbm3624Pin(pvkHex, decimalizationTable, pinValidationData, padCharacter, pinOffset, pin) {
    const normalizedOffset = (pinOffset || "").replace(/\s+/g, "");
    const normalizedPin = normalizePin(pin);
    if (!/^\d{4,12}$/.test(normalizedOffset) || normalizedOffset.length !== normalizedPin.length) {
        throw new OperationError("PIN offset must be 4 to 12 digits and match PIN length.");
    }

    const generated = generateIbm3624PinOffset(
        pvkHex,
        decimalizationTable,
        pinValidationData,
        padCharacter,
        normalizedPin
    );

    return {
        ...generated,
        expectedPinOffset: normalizedOffset,
        valid: generated.pinOffset === normalizedOffset
    };
}

/**
 * Decimalizes a PVV candidate using the common numeric-first rule.
 *
 * @param {string} hex
 * @returns {string}
 */
function decimalizePvv(hex) {
    let out = "";
    for (const ch of hex.toUpperCase()) {
        if (/\d/.test(ch)) {
            out += ch;
        } else {
            out += String((ch.charCodeAt(0) - "A".charCodeAt(0)) % 10);
        }
        if (out.length >= 4) return out.substring(0, 4);
    }
    return out.substring(0, 4);
}

/**
 * Generates a VISA PVV.
 *
 * @param {string} pvkHex
 * @param {string} pan
 * @param {string|number} pvki
 * @param {string} pin
 * @returns {Object}
 */
function generateVisaPvv(pvkHex, pan, pvki, pin) {
    const normalizedPan = normalizePan(pan);
    const normalizedPin = normalizePin(pin);
    const normalizedPvki = String(pvki ?? "").replace(/\s+/g, "");

    if (!/^[0-6]$/.test(normalizedPvki)) {
        throw new OperationError("PVKI must be a single digit from 0 to 6.");
    }

    const pvk = parseHexBytes(pvkHex, "PIN verification key", [16, 24]);
    const pvvInput = `${normalizedPan.slice(-12, -1)}${normalizedPvki}${normalizedPin.substring(0, 4)}`;
    const encryptedHex = bytesToHex(encryptTdesEcb(pvk, packHex(pvvInput)));
    const pvv = decimalizePvv(encryptedHex);

    return {
        pinVerificationKeyHex: bytesToHex(pvk),
        pan: normalizedPan,
        pinVerificationKeyIndex: Number(normalizedPvki),
        pin: normalizedPin,
        pvvInput,
        encryptedPvvInputHex: encryptedHex,
        pvv
    };
}

/**
 * Verifies a VISA PVV.
 *
 * @param {string} pvkHex
 * @param {string} pan
 * @param {string|number} pvki
 * @param {string} pin
 * @param {string} expectedPvv
 * @returns {Object}
 */
function verifyVisaPvv(pvkHex, pan, pvki, pin, expectedPvv) {
    const normalizedExpected = (expectedPvv || "").replace(/\s+/g, "");
    if (!/^\d{4}$/.test(normalizedExpected)) {
        throw new OperationError("Expected PVV must be 4 digits.");
    }

    const generated = generateVisaPvv(pvkHex, pan, pvki, pin);
    return {
        ...generated,
        expectedPvv: normalizedExpected,
        valid: generated.pvv === normalizedExpected
    };
}

export {
    generateIbm3624NaturalPin,
    generateIbm3624PinOffset,
    generateVisaPvv,
    verifyIbm3624Pin,
    verifyVisaPvv,
};
