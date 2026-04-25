/**
 * @license Apache-2.0
 */

import CMAC from "../operations/CMAC.mjs";
import OperationError from "../errors/OperationError.mjs";
import { parseHexBuffer } from "./PaymentUtils.mjs";

/**
 * Generates an EMV AES-CMAC cryptogram and truncates it.
 *
 * @param {string} inputHex
 * @param {string} keyHex
 * @param {number} outputBytes
 * @returns {Object}
 */
function generateEmvAesCmacCryptogram(inputHex, keyHex, outputBytes) {
    const inputBuffer = parseHexBuffer(inputHex, "Input data");
    const normalizedKey = (keyHex || "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(normalizedKey) || normalizedKey.length % 2 !== 0) {
        throw new OperationError("Session key must be hex.");
    }

    const normalizedOutputBytes = Math.max(1, Math.min(16, Number(outputBytes) || 8));
    const cmac = new CMAC();
    const fullMacHex = cmac.run(inputBuffer, [{ string: normalizedKey, option: "Hex" }, "AES"]).toUpperCase();
    const cryptogramHex = fullMacHex.substring(0, normalizedOutputBytes * 2);

    return {
        inputHex: (inputHex || "").replace(/\s+/g, "").toUpperCase(),
        outputBytes: normalizedOutputBytes,
        fullMacHex,
        cryptogramHex
    };
}


export {
    generateEmvAesCmacCryptogram,
};
