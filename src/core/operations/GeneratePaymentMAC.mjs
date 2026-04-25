/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { ISO9797_PADDING_METHODS, PAYMENT_MAC_METHODS, generatePaymentMac } from "../lib/PaymentMac.mjs";

/**
 * Generate payment MAC operation.
 */
class GeneratePaymentMAC extends Operation {

    /**
     * GeneratePaymentMAC constructor.
     */
    constructor() {
        super();

        this.name = "Generate Payment MAC";
        this.module = "Payment";
        this.description = "Paste the message data into the input field and generate a payment-oriented MAC using one payment-facing operation.<br><br><b>Input:</b> message data in the selected input format.<br><b>Arguments:</b> choose the MAC method, provide either a direct key or a DUKPT BDK, optionally provide a KSN for DUKPT methods, choose the ISO9797 padding rule when applicable, and choose the truncation length.<br><br>This wrapper reuses existing HMAC and CMAC primitives where possible and adds payment-specific ISO9797 / AS2805 modes for software testing.";
        this.inlineHelp = "<strong>Input:</strong> message data.<br><strong>Args:</strong> choose the payment MAC method, then provide either a direct key or a DUKPT BDK plus KSN.";
        this.testDataSamples = [
            {
                name: "Static AES-CMAC sample",
                input: "1122334455667788",
                args: ["Hex", "AES-CMAC", "00112233445566778899AABBCCDDEEFF", "Hex", "", "Method 1", 8, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_GenerateMac.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input format",
                type: "option",
                value: ["Hex", "UTF8", "Latin1", "Base64"],
                comment: "How to decode the input field before MAC generation. Use <code>Hex</code> for payment test vectors expressed as hex."
            },
            {
                name: "MAC method",
                type: "option",
                value: PAYMENT_MAC_METHODS,
                comment: "Static-key HMAC and CMAC modes reuse the existing generic primitives. ISO9797 and AS2805 modes apply TDES-based payment MAC logic. DUKPT modes derive a TDES session key first."
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
                name: "ISO9797 padding",
                type: "option",
                value: ISO9797_PADDING_METHODS,
                comment: "Used only for ISO9797 and AS2805 MAC methods. <code>Method 1</code> pads with zero bytes to the next block. <code>Method 2</code> appends <code>80</code> then zeros."
            },
            {
                name: "Output bytes",
                type: "number",
                value: 8,
                min: 1,
                max: 64,
                comment: "Number of leftmost MAC bytes to return. Leave at <code>8</code> for common payment truncation lengths."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
                comment: "When enabled, returns the full MAC, truncation details, and key-context metadata."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [inputFormat, method, keyValue, keyFormat, ksn, paddingMethod, outputBytes, outputJson] = args;
        const result = generatePaymentMac(input, inputFormat, method, keyValue, keyFormat, ksn, outputBytes, paddingMethod);
        return outputJson ? JSON.stringify(result, null, 4) : result.macHex;
    }
}

export default GeneratePaymentMAC;
