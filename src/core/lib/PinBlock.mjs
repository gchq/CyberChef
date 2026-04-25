/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { toHexFast } from "./Hex.mjs";

const PIN_BLOCK_FORMATS = ["ISO Format 0", "ISO Format 1", "ISO Format 3"];

/**
 * Returns a random nibble in the given inclusive range.
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomNibble(min, max) {
    const range = max - min + 1;

    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
        const buf = new Uint8Array(1);
        globalThis.crypto.getRandomValues(buf);
        return min + (buf[0] % range);
    }

    return min + Math.floor(Math.random() * range);
}

/**
 * Converts a hex string into nibble values.
 *
 * @param {string} hex
 * @returns {number[]}
 */
function hexToNibbles(hex) {
    return hex.toUpperCase().split("").map(ch => parseInt(ch, 16));
}

/**
 * Converts nibble values into a byte array.
 *
 * @param {number[]} nibbles
 * @returns {Uint8Array}
 */
function nibblesToBytes(nibbles) {
    const out = new Uint8Array(nibbles.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = (nibbles[i * 2] << 4) | nibbles[i * 2 + 1];
    }
    return out;
}

/**
 * XORs two nibble arrays.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number[]}
 */
function xorNibbles(a, b) {
    return a.map((value, index) => value ^ b[index]);
}

/**
 * Normalizes and validates a PIN.
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
 * Normalizes and validates a PAN.
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
 * Parses an 8-byte PIN block hex string.
 *
 * @param {string} blockHex
 * @returns {string}
 */
function normalizeBlockHex(blockHex) {
    const normalized = (blockHex || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]{16}$/.test(normalized)) {
        throw new OperationError("PIN block must be 16 hex characters (8 bytes).");
    }
    return normalized;
}

/**
 * Builds the PIN field for a clear PIN block.
 *
 * @param {string} format
 * @param {string} pin
 * @param {boolean} randomizeFill
 * @returns {number[]}
 */
function buildPinField(format, pin, randomizeFill) {
    const formatNibble = format === "ISO Format 0" ? 0x0 : format === "ISO Format 1" ? 0x1 : 0x3;
    const pinNibbles = pin.split("").map(digit => parseInt(digit, 10));
    const out = [formatNibble, pin.length, ...pinNibbles];

    while (out.length < 16) {
        if (format === "ISO Format 0") {
            out.push(0xF);
        } else if (format === "ISO Format 1") {
            out.push(randomizeFill ? randomNibble(0x0, 0xF) : 0xF);
        } else {
            out.push(randomizeFill ? randomNibble(0xA, 0xF) : 0xA);
        }
    }

    return out;
}

/**
 * Builds the PAN field for PAN-bound PIN block formats.
 *
 * @param {string} pan
 * @returns {number[]}
 */
function buildPanField(pan) {
    const normalizedPan = normalizePan(pan);
    const pan12 = normalizedPan.slice(0, -1).slice(-12).padStart(12, "0");
    return hexToNibbles(`0000${pan12}`);
}

/**
 * Builds a clear PIN block.
 *
 * @param {string} format
 * @param {string} pin
 * @param {string} pan
 * @param {boolean} randomizeFill
 * @returns {string}
 */
function buildPinBlock(format, pin, pan, randomizeFill) {
    if (!PIN_BLOCK_FORMATS.includes(format)) {
        throw new OperationError("Unsupported PIN block format.");
    }

    const normalizedPin = normalizePin(pin);
    const pinField = buildPinField(format, normalizedPin, randomizeFill);

    if (format === "ISO Format 1") {
        return toHexFast(nibblesToBytes(pinField)).toUpperCase();
    }

    const panField = buildPanField(pan);
    return toHexFast(nibblesToBytes(xorNibbles(pinField, panField))).toUpperCase();
}

/**
 * Parses a clear PIN block.
 *
 * @param {string} format
 * @param {string} blockHex
 * @param {string} pan
 * @returns {Object}
 */
function parsePinBlock(format, blockHex, pan) {
    if (!PIN_BLOCK_FORMATS.includes(format)) {
        throw new OperationError("Unsupported PIN block format.");
    }

    const normalizedBlock = normalizeBlockHex(blockHex);
    const clearField = format === "ISO Format 1" ?
        hexToNibbles(normalizedBlock) :
        xorNibbles(hexToNibbles(normalizedBlock), buildPanField(pan));

    const formatNibble = clearField[0];
    const expectedFormatNibble = format === "ISO Format 0" ? 0x0 : format === "ISO Format 1" ? 0x1 : 0x3;
    if (formatNibble !== expectedFormatNibble) {
        throw new OperationError(`PIN block does not decode as ${format}.`);
    }

    const pinLength = clearField[1];
    if (pinLength < 4 || pinLength > 12) {
        throw new OperationError("Decoded PIN length is invalid.");
    }

    const pinDigits = clearField.slice(2, 2 + pinLength);
    if (pinDigits.some(nibble => nibble < 0x0 || nibble > 0x9)) {
        throw new OperationError("Decoded PIN contains non-decimal digits.");
    }

    const fillDigits = clearField.slice(2 + pinLength);
    if (format === "ISO Format 0" && fillDigits.some(nibble => nibble !== 0xF)) {
        throw new OperationError("Format 0 filler must be 0xF.");
    }
    if (format === "ISO Format 3" && fillDigits.some(nibble => nibble < 0xA || nibble > 0xF)) {
        throw new OperationError("Format 3 filler must be in the range 0xA to 0xF.");
    }

    return {
        format,
        pin: pinDigits.join(""),
        pinLength,
        pinFieldHex: toHexFast(nibblesToBytes(clearField)).toUpperCase(),
        panFieldHex: format === "ISO Format 1" ? null : toHexFast(nibblesToBytes(buildPanField(pan))).toUpperCase(),
        blockHex: normalizedBlock,
        fillDigitsHex: fillDigits.map(nibble => nibble.toString(16).toUpperCase()).join("")
    };
}

/**
 * Translates a clear PIN block between formats.
 *
 * @param {string} blockHex
 * @param {string} sourceFormat
 * @param {string} sourcePan
 * @param {string} targetFormat
 * @param {string} targetPan
 * @param {boolean} randomizeFill
 * @returns {Object}
 */
function translatePinBlock(blockHex, sourceFormat, sourcePan, targetFormat, targetPan, randomizeFill) {
    const parsed = parsePinBlock(sourceFormat, blockHex, sourcePan);
    return {
        source: parsed,
        target: {
            format: targetFormat,
            blockHex: buildPinBlock(targetFormat, parsed.pin, targetPan, randomizeFill)
        }
    };
}

export {
    PIN_BLOCK_FORMATS,
    buildPinBlock,
    parsePinBlock,
    translatePinBlock,
};
