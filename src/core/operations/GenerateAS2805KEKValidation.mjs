/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import CalculatePaymentKCV from "./CalculatePaymentKCV.mjs";
import { bytesToHex, parseHexBytes } from "../lib/PaymentUtils.mjs";

/**
 * Returns cryptographically random bytes when available.
 *
 * @param {number} length
 * @returns {Uint8Array}
 */
function randomBytes(length) {
    const out = new Uint8Array(length);
    if (globalThis.crypto && globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues(out);
        return out;
    }

    for (let i = 0; i < out.length; i++) {
        out[i] = Math.floor(Math.random() * 256);
    }
    return out;
}

/**
 * Inverts all bytes.
 *
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function invertBytes(bytes) {
    return Uint8Array.from(bytes, byte => byte ^ 0xFF);
}

/**
 * Generate AS2805 KEK validation operation.
 */
class GenerateAS2805KEKValidation extends Operation {
    /**
     * GenerateAS2805KEKValidation constructor.
     */
    constructor() {
        super();

        this.name = "Generate AS2805 KEK Validation";
        this.module = "Payment";
        this.description = "Paste the clear sending KEK into the input field as hex and generate an AS2805 KEK validation request or response.<br><br><b>Input:</b> clear KEK as 16-byte or 24-byte hex.<br><b>Arguments:</b> choose request or response mode, select the random-key length, choose the variant mask label, and optionally provide the incoming RandomKeySend value.<br><br><b>Validation:</b> Emulation helper. This software implementation returns <code>RandomKeyReceive</code> as the bytewise inverse of <code>RandomKeySend</code>, which is useful for lab testing but does not claim exact HSM-side AS2805 node-initialization behavior.<br><br><b>Security:</b> Clear KEKs in the recipe are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> clear KEK hex.<br><strong>Args:</strong> choose request or response mode and provide RandomKeySend for response mode.<br><strong>Validation:</strong> explicit emulation, not certified AS2805 behavior.";
        this.testDataSamples = [
            {
                name: "AS2805 request sample",
                input: "0123456789ABCDEFFEDCBA9876543210",
                args: ["KekValidationRequest", "TDES_2KEY", "VARIANT_MASK_82", "", true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_GenerateAs2805KekValidation.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Validation type", type: "option", value: ["KekValidationRequest", "KekValidationResponse"], comment: "Request mode creates a fresh RandomKeySend. Response mode derives RandomKeyReceive from the supplied RandomKeySend." },
            { name: "Derive key algorithm", type: "option", value: ["TDES_2KEY", "TDES_3KEY"], comment: "Controls whether RandomKeySend / RandomKeyReceive are 16 bytes or 24 bytes long." },
            { name: "RandomKeySend variant mask", type: "option", value: ["VARIANT_MASK_82", "VARIANT_MASK_82C0"], comment: "AWS surfaces this as metadata for AS2805 KEK validation. This emulation reports the selected label but does not model HSM-side key custody." },
            { name: "RandomKeySend (response only)", type: "string", value: "", comment: "Required only in response mode. Provide the incoming RandomKeySend hex value from the partner node." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the KEK KCV and both RandomKeySend / RandomKeyReceive values." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [validationType, deriveKeyAlgorithm, randomKeySendVariantMask, randomKeySendHex, outputJson] = args;
        const kek = parseHexBytes(input, "KEK", deriveKeyAlgorithm === "TDES_2KEY" ? [16] : [24]);
        const randomKeyLength = deriveKeyAlgorithm === "TDES_2KEY" ? 16 : 24;

        let randomKeySend;
        if (validationType === "KekValidationRequest") {
            randomKeySend = randomBytes(randomKeyLength);
        } else {
            if (!randomKeySendHex) {
                throw new OperationError("RandomKeySend is required for KEK validation response mode.");
            }
            randomKeySend = parseHexBytes(randomKeySendHex, "RandomKeySend", [randomKeyLength]);
        }

        const randomKeyReceive = invertBytes(randomKeySend);
        const kcv = new CalculatePaymentKCV().run(bytesToHex(kek), ["Hex", "TDES-ECB (Zeros)", 6]);

        const result = {
            validationType,
            deriveKeyAlgorithm,
            randomKeySendVariantMask,
            keyCheckValue: kcv,
            randomKeySend: bytesToHex(randomKeySend),
            randomKeyReceive: bytesToHex(randomKeyReceive)
        };

        return outputJson ? JSON.stringify(result, null, 4) : result.randomKeyReceive;
    }
}

export default GenerateAS2805KEKValidation;
