/**
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import HMAC from "../operations/HMAC.mjs";
import CMAC from "../operations/CMAC.mjs";
import DeriveDUKPTKey from "../operations/DeriveDUKPTKey.mjs";

const PAYMENT_MAC_METHODS = [
    "HMAC SHA-224",
    "HMAC SHA-256",
    "HMAC SHA-384",
    "HMAC SHA-512",
    "AES-CMAC",
    "TDES-CMAC",
    "DUKPT MAC Request CMAC",
    "DUKPT MAC Response CMAC",
];

/**
 * Converts a string input into an ArrayBuffer according to the selected format.
 *
 * @param {string} input
 * @param {string} inputFormat
 * @returns {ArrayBuffer}
 */
function convertInputToBuffer(input, inputFormat) {
    const byteString = Utils.convertToByteString(input || "", inputFormat);
    return Utils.strToArrayBuffer(byteString);
}

/**
 * Resolves the effective MAC key for the selected method.
 *
 * @param {string} method
 * @param {Object} keySpec
 * @returns {{keyHex: string, keyContext: Object}}
 */
function resolveMacKey(method, keySpec) {
    const normalizedKey = (keySpec.keyValue || "").replace(/\s+/g, "");

    if (method === "DUKPT MAC Request CMAC" || method === "DUKPT MAC Response CMAC") {
        if (keySpec.keyFormat !== "Hex") {
            throw new OperationError("DUKPT BDK must be provided in hex.");
        }
        if (!keySpec.ksn) {
            throw new OperationError("KSN is required for DUKPT MAC methods.");
        }

        const variant = method === "DUKPT MAC Request CMAC" ? "MAC Request" : "MAC Response";
        const dukpt = new DeriveDUKPTKey();
        const keyHex = dukpt.run(normalizedKey, ["Derive Session Key", keySpec.ksn, variant, false]);

        return {
            keyHex,
            keyContext: {
                keySource: "Derived from DUKPT BDK",
                ksn: keySpec.ksn.replace(/\s+/g, "").toUpperCase(),
                dukptVariant: variant
            }
        };
    }

    const byteString = Utils.convertToByteString(keySpec.keyValue || "", keySpec.keyFormat);
    if (!byteString.length) {
        throw new OperationError("Key material is required.");
    }

    return {
        keyHex: byteStringToHex(byteString),
        keyContext: {
            keySource: "Direct key input"
        }
    };
}

/**
 * Converts a byte string into uppercase hex.
 *
 * @param {string} byteString
 * @returns {string}
 */
function byteStringToHex(byteString) {
    return Array.from(byteString, ch => ch.charCodeAt(0).toString(16).padStart(2, "0")).join("").toUpperCase();
}

/**
 * Generates a payment MAC using the selected method.
 *
 * @param {string} input
 * @param {string} inputFormat
 * @param {string} method
 * @param {string} keyValue
 * @param {string} keyFormat
 * @param {string} ksn
 * @param {number} outputBytes
 * @returns {Object}
 */
function generatePaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, outputBytes) {
    const normalizedOutputBytes = Math.max(1, Number(outputBytes) || 8);
    const inputBuffer = convertInputToBuffer(input, inputFormat);
    const inputHex = byteStringToHex(Utils.arrayBufferToStr(inputBuffer, false));
    const { keyHex, keyContext } = resolveMacKey(method, { keyValue, keyFormat, ksn });

    let fullMacHex;
    if (method.startsWith("HMAC ")) {
        const hmac = new HMAC();
        const hashName = {
            "HMAC SHA-224": "SHA224",
            "HMAC SHA-256": "SHA256",
            "HMAC SHA-384": "SHA384",
            "HMAC SHA-512": "SHA512",
        }[method];
        fullMacHex = hmac.run(inputBuffer, [{ string: keyHex, option: "Hex" }, hashName]).toUpperCase();
    } else {
        const cmac = new CMAC();
        const algorithm = method === "AES-CMAC" ? "AES" : "Triple DES";
        fullMacHex = cmac.run(inputBuffer, [{ string: keyHex, option: "Hex" }, algorithm]).toUpperCase();
    }

    const macHex = fullMacHex.substring(0, normalizedOutputBytes * 2);

    return {
        method,
        inputFormat,
        inputHex,
        outputBytes: normalizedOutputBytes,
        fullMacHex,
        macHex,
        ...keyContext
    };
}

/**
 * Verifies a payment MAC by recomputing and comparing it.
 *
 * @param {string} input
 * @param {string} inputFormat
 * @param {string} method
 * @param {string} keyValue
 * @param {string} keyFormat
 * @param {string} ksn
 * @param {string} expectedMac
 * @returns {Object}
 */
function verifyPaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, expectedMac) {
    const normalizedExpected = (expectedMac || "").replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]+$/.test(normalizedExpected) || normalizedExpected.length % 2 !== 0) {
        throw new OperationError("Expected MAC must be even-length hex.");
    }

    const generated = generatePaymentMac(
        input,
        inputFormat,
        method,
        keyValue,
        keyFormat,
        ksn,
        normalizedExpected.length / 2
    );

    return {
        ...generated,
        expectedMacHex: normalizedExpected,
        valid: generated.macHex === normalizedExpected
    };
}

export {
    PAYMENT_MAC_METHODS,
    generatePaymentMac,
    verifyPaymentMac,
};
