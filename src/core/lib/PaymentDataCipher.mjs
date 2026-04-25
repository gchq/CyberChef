/**
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import AESEncrypt from "../operations/AESEncrypt.mjs";
import AESDecrypt from "../operations/AESDecrypt.mjs";
import TripleDESEncrypt from "../operations/TripleDESEncrypt.mjs";
import TripleDESDecrypt from "../operations/TripleDESDecrypt.mjs";
import DeriveDUKPTKey from "../operations/DeriveDUKPTKey.mjs";

const PAYMENT_CIPHER_PROFILES = [
    "AES CBC",
    "AES CTR",
    "AES ECB",
    "TDES CBC",
    "TDES ECB",
    "DUKPT TDES CBC",
    "DUKPT TDES ECB",
];

const DUKPT_DATA_VARIANTS = ["None", "Data"];

/**
 * Validates hex input.
 *
 * @param {string} value
 * @param {string} name
 * @param {boolean} allowEmpty
 * @returns {string}
 */
function normalizeHex(value, name, allowEmpty=false) {
    const normalized = (value || "").replace(/\s+/g, "").toUpperCase();
    if (!normalized.length && allowEmpty) return "";
    if (!/^[0-9A-F]+$/.test(normalized) || normalized.length % 2 !== 0) {
        throw new OperationError(`${name} must be even-length hex.`);
    }
    return normalized;
}

/**
 * Resolves the working key for the selected cipher profile.
 *
 * @param {string} profile
 * @param {string} keyHex
 * @param {string} ksn
 * @param {string} dukptVariant
 * @returns {{keyHex: string, keyContext: Object}}
 */
function resolveCipherKey(profile, keyHex, ksn, dukptVariant) {
    if (!profile.startsWith("DUKPT ")) {
        return {
            keyHex: normalizeHex(keyHex, "Key"),
            keyContext: { keySource: "Direct key input" }
        };
    }

    const normalizedKey = normalizeHex(keyHex, "BDK");
    const normalizedKsn = normalizeHex(ksn, "KSN");
    const dukpt = new DeriveDUKPTKey();
    const derivedKey = dukpt.run(normalizedKey, ["Derive Session Key", normalizedKsn, dukptVariant, false]);

    return {
        keyHex: derivedKey,
        keyContext: {
            keySource: "Derived from DUKPT BDK",
            ksn: normalizedKsn,
            dukptVariant
        }
    };
}

/**
 * Encrypts payment data using the selected profile.
 *
 * @param {string} inputHex
 * @param {string} profile
 * @param {string} keyHex
 * @param {string} ivHex
 * @param {string} ksn
 * @param {string} dukptVariant
 * @returns {Object}
 */
function encryptPaymentData(inputHex, profile, keyHex, ivHex, ksn, dukptVariant) {
    const plaintextHex = normalizeHex(inputHex, "Input data");
    const normalizedIv = normalizeHex(ivHex, "IV", true);
    const { keyHex: effectiveKeyHex, keyContext } = resolveCipherKey(profile, keyHex, ksn, dukptVariant);

    let ciphertextHex;
    if (profile.startsWith("AES ")) {
        const aes = new AESEncrypt();
        const mode = profile.substring(4);
        ciphertextHex = aes.run(plaintextHex, [
            { string: effectiveKeyHex, option: "Hex" },
            { string: normalizedIv, option: "Hex" },
            mode,
            "Hex",
            "Hex",
            { string: "", option: "Hex" }
        ]).toUpperCase();
    } else {
        const tdes = new TripleDESEncrypt();
        const mode = profile.endsWith("CBC") ? "CBC" : "ECB";
        ciphertextHex = tdes.run(plaintextHex, [
            { string: effectiveKeyHex, option: "Hex" },
            { string: normalizedIv, option: "Hex" },
            mode,
            "Hex",
            "Hex"
        ]).toUpperCase();
    }

    return {
        profile,
        plaintextHex,
        ciphertextHex,
        ivHex: normalizedIv,
        ...keyContext
    };
}

/**
 * Decrypts payment data using the selected profile.
 *
 * @param {string} inputHex
 * @param {string} profile
 * @param {string} keyHex
 * @param {string} ivHex
 * @param {string} ksn
 * @param {string} dukptVariant
 * @returns {Object}
 */
function decryptPaymentData(inputHex, profile, keyHex, ivHex, ksn, dukptVariant) {
    const ciphertextHex = normalizeHex(inputHex, "Input data");
    const normalizedIv = normalizeHex(ivHex, "IV", true);
    const { keyHex: effectiveKeyHex, keyContext } = resolveCipherKey(profile, keyHex, ksn, dukptVariant);

    let plaintextHex;
    if (profile.startsWith("AES ")) {
        const aes = new AESDecrypt();
        const mode = profile.substring(4);
        plaintextHex = aes.run(ciphertextHex, [
            { string: effectiveKeyHex, option: "Hex" },
            { string: normalizedIv, option: "Hex" },
            mode,
            "Hex",
            "Hex",
            { string: "", option: "Hex" },
            { string: "", option: "Hex" }
        ]).toUpperCase();
    } else {
        const tdes = new TripleDESDecrypt();
        const mode = profile.endsWith("CBC") ? "CBC" : "ECB";
        plaintextHex = tdes.run(ciphertextHex, [
            { string: effectiveKeyHex, option: "Hex" },
            { string: normalizedIv, option: "Hex" },
            mode,
            "Hex",
            "Hex"
        ]).toUpperCase();
    }

    return {
        profile,
        ciphertextHex,
        plaintextHex,
        ivHex: normalizedIv,
        ...keyContext
    };
}

/**
 * Re-encrypts payment data by decrypting under one profile and encrypting under another.
 *
 * @param {string} inputHex
 * @param {Object} params
 * @returns {Object}
 */
function reEncryptPaymentData(inputHex, params) {
    const decrypted = decryptPaymentData(
        inputHex,
        params.sourceProfile,
        params.sourceKeyHex,
        params.sourceIvHex,
        params.sourceKsn,
        params.sourceDukptVariant
    );
    const encrypted = encryptPaymentData(
        decrypted.plaintextHex,
        params.targetProfile,
        params.targetKeyHex,
        params.targetIvHex,
        params.targetKsn,
        params.targetDukptVariant
    );

    return {
        source: decrypted,
        target: encrypted
    };
}

export {
    DUKPT_DATA_VARIANTS,
    PAYMENT_CIPHER_PROFILES,
    decryptPaymentData,
    encryptPaymentData,
    reEncryptPaymentData,
};
