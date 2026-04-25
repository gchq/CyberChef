/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";
import HMAC from "../operations/HMAC.mjs";
import CMAC from "../operations/CMAC.mjs";
import DeriveDUKPTKey from "../operations/DeriveDUKPTKey.mjs";
import {
    ISO9797_PADDING_METHODS,
    generateAs2805Mac,
    generateIso9797Algorithm1Mac,
    generateIso9797Algorithm3Mac,
} from "./Iso9797.mjs";

const PAYMENT_MAC_METHODS = [
    "HMAC SHA-224",
    "HMAC SHA-256",
    "HMAC SHA-384",
    "HMAC SHA-512",
    "AES-CMAC",
    "TDES-CMAC",
    "ISO 9797-1 Algorithm 1",
    "ISO 9797-1 Algorithm 3",
    "AS2805-4.1",
    "DUKPT MAC Request CMAC",
    "DUKPT MAC Response CMAC",
    "DUKPT ISO 9797-1 Algorithm 1",
    "DUKPT ISO 9797-1 Algorithm 3",
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

    if (
        method === "DUKPT MAC Request CMAC" ||
        method === "DUKPT MAC Response CMAC" ||
        method === "DUKPT ISO 9797-1 Algorithm 1" ||
        method === "DUKPT ISO 9797-1 Algorithm 3"
    ) {
        if (keySpec.keyFormat !== "Hex") {
            throw new OperationError("DUKPT BDK must be provided in hex.");
        }
        if (!keySpec.ksn) {
            throw new OperationError("KSN is required for DUKPT MAC methods.");
        }

        const variant = method === "DUKPT MAC Request CMAC" ? "MAC Request" :
            method === "DUKPT MAC Response CMAC" ? "MAC Response" :
                "MAC Request";
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
 * @param {string} paddingMethod
 * @returns {Object}
 */
function generatePaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, outputBytes, paddingMethod="Method 1") {
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
    } else if (method === "AES-CMAC" || method === "TDES-CMAC" || method === "DUKPT MAC Request CMAC" || method === "DUKPT MAC Response CMAC") {
        const cmac = new CMAC();
        const algorithm = method === "AES-CMAC" ? "AES" : "Triple DES";
        fullMacHex = cmac.run(inputBuffer, [{ string: keyHex, option: "Hex" }, algorithm]).toUpperCase();
    } else if (method === "ISO 9797-1 Algorithm 1" || method === "DUKPT ISO 9797-1 Algorithm 1") {
        fullMacHex = generateIso9797Algorithm1Mac(inputHex, keyHex, paddingMethod, 8).fullMacHex;
    } else if (method === "ISO 9797-1 Algorithm 3" || method === "DUKPT ISO 9797-1 Algorithm 3") {
        fullMacHex = generateIso9797Algorithm3Mac(inputHex, keyHex, paddingMethod, 8).fullMacHex;
    } else if (method === "AS2805-4.1") {
        fullMacHex = generateAs2805Mac(inputHex, keyHex, paddingMethod, 8).fullMacHex;
    } else {
        throw new OperationError("Unsupported payment MAC method.");
    }

    const macHex = fullMacHex.substring(0, normalizedOutputBytes * 2);

    return {
        method,
        inputFormat,
        inputHex,
        paddingMethod: method.startsWith("HMAC ") || method.includes("CMAC") ? null : paddingMethod,
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
 * @param {string} paddingMethod
 * @returns {Object}
 */
function verifyPaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, expectedMac, paddingMethod="Method 1") {
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
        normalizedExpected.length / 2,
        paddingMethod
    );

    return {
        ...generated,
        expectedMacHex: normalizedExpected,
        valid: generated.macHex === normalizedExpected
    };
}

export {
    ISO9797_PADDING_METHODS,
    PAYMENT_MAC_METHODS,
    generatePaymentMac,
    verifyPaymentMac,
};
