/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import { generateIso9797Algorithm3Mac } from "./Iso9797.mjs";

/**
 * Generates an EMV MAC using an already-derived session key.
 *
 * @param {string} messageHex
 * @param {string} sessionKeyHex
 * @param {number} outputBytes
 * @returns {Object}
 */
function generateEmvMac(messageHex, sessionKeyHex, outputBytes=8) {
    const normalizedKey = (sessionKeyHex || "").replace(/\s+/g, "");
    if (!/^[0-9A-Fa-f]+$/.test(normalizedKey) || normalizedKey.length % 2 !== 0) {
        throw new OperationError("Session key must be hex.");
    }

    return {
        ...generateIso9797Algorithm3Mac(messageHex, normalizedKey, "Method 2", outputBytes),
        algorithm: "EMV MAC"
    };
}

/**
 * Verifies an EMV MAC using an already-derived session key.
 *
 * @param {string} messageHex
 * @param {string} sessionKeyHex
 * @param {string} expectedMac
 * @returns {Object}
 */
function verifyEmvMac(messageHex, sessionKeyHex, expectedMac) {
    const normalizedExpected = (expectedMac || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]+$/.test(normalizedExpected) || normalizedExpected.length % 2 !== 0) {
        throw new OperationError("Expected MAC must be even-length hex.");
    }

    const generated = generateEmvMac(messageHex, sessionKeyHex, normalizedExpected.length / 2);
    return {
        ...generated,
        expectedMacHex: normalizedExpected,
        valid: generated.macHex === normalizedExpected
    };
}

/**
 * Generates the MAC portion of an EMV PIN-change issuer script.
 *
 * @param {string} messageHex
 * @param {string} encryptedPinBlockHex
 * @param {string} sessionKeyHex
 * @param {number} outputBytes
 * @returns {Object}
 */
function generateEmvPinChangeMac(messageHex, encryptedPinBlockHex, sessionKeyHex, outputBytes=8) {
    const normalizedPinBlock = (encryptedPinBlockHex || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]{16,32}$/.test(normalizedPinBlock)) {
        throw new OperationError("New encrypted PIN block must be 8 or 16 bytes of hex.");
    }

    const combinedMessageHex = `${(messageHex || "").replace(/\s+/g, "").toUpperCase()}${normalizedPinBlock}`;
    const generated = generateEmvMac(combinedMessageHex, sessionKeyHex, outputBytes);
    return {
        ...generated,
        originalMessageHex: (messageHex || "").replace(/\s+/g, "").toUpperCase(),
        appendedEncryptedPinBlockHex: normalizedPinBlock,
        issuerScriptHex: combinedMessageHex
    };
}

export {
    generateEmvMac,
    generateEmvPinChangeMac,
    verifyEmvMac,
};
