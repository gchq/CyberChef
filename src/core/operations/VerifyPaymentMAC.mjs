/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { PAYMENT_MAC_METHODS, verifyPaymentMac } from "../lib/PaymentMac.mjs";

/**
 * Verify payment MAC operation.
 */
class VerifyPaymentMAC extends Operation {

    /**
     * VerifyPaymentMAC constructor.
     */
    constructor() {
        super();

        this.name = "Verify payment MAC";
        this.module = "Payment";
        this.description = "Paste the message data into the input field and verify a payment-oriented MAC using one payment-facing operation.<br><br><b>Input:</b> message data in the selected input format.<br><b>Arguments:</b> choose the MAC method, provide either a direct key or a DUKPT BDK, add the KSN for DUKPT methods, and supply the expected MAC as hex.<br><br>This wrapper recomputes the MAC using the same payment-specific assumptions as the generate operation.";
        this.inlineHelp = "<strong>Input:</strong> message data.<br><strong>Args:</strong> choose the payment MAC method, provide the key context, then paste the expected MAC.";
        this.testDataSamples = [
            {
                name: "Static AES-CMAC verification sample",
                input: "1122334455667788",
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", "339AF1AD1650E908", true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VerifyMac.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "UTF8", "Latin1", "Base64"],
                comment: "How to decode the input field before MAC verification."
            },
            {
                name: "MAC method",
                type: "option",
                value: PAYMENT_MAC_METHODS,
                comment: "Static-key HMAC and CMAC modes reuse the existing generic primitives. DUKPT modes derive a TDES session key first and then apply TDES-CMAC."
            },
            {
                name: "Key / BDK",
                type: "string",
                value: "",
                comment: "Provide the direct MAC key for HMAC or CMAC methods, or the clear BDK for DUKPT methods."
            },
            {
                name: "Key format",
                type: "option",
                value: ["Hex", "UTF8", "Latin1", "Base64"],
                comment: "How to decode the key input. Assumption: DUKPT BDK input must be <code>Hex</code>."
            },
            {
                name: "KSN (DUKPT only)",
                type: "string",
                value: "",
                comment: "Required only for DUKPT MAC methods. Provide the full 10-byte KSN as 20 hex characters."
            },
            {
                name: "Expected MAC (hex)",
                type: "string",
                value: "",
                comment: "MAC value to compare against, expressed as even-length hex."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: true,
                comment: "When enabled, returns the recomputed MAC, comparison target, and validity result."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat, method, keyValue, keyFormat, ksn, expectedMac, outputJson] = args;
        const result = verifyPaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, expectedMac);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyPaymentMAC;
