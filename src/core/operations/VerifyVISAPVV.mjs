/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { verifyVisaPvv } from "../lib/PaymentPinVerification.mjs";

/**
 * Verify VISA PVV operation.
 */
class VerifyVISAPVV extends Operation {
    /**
     * VerifyVISAPVV constructor.
     */
    constructor() {
        super();

        this.name = "Verify VISA PVV";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and verify it against a VISA PVV.<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> provide the clear PVK in hex, PAN, PVKI, and expected PVV.<br><br>Assumption: this is a clear-key software emulation of the common VISA PVV verification flow for test harnesses.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> provide PVK, PAN, PVKI, and expected PVV.";
        this.testDataSamples = [
            {
                name: "VISA PVV verify sample",
                input: "1234",
                args: ["0123456789ABCDEFFEDCBA9876543210", "5432101234567890", 1, "6077", true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VisaPinVerificationValue.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear VISA PVK as 16-byte or 24-byte hex." },
            { name: "Primary account number", type: "string", value: "", comment: "Provide the PAN as digits only. The standard PVV input uses the rightmost 11 digits before the check digit." },
            { name: "PVKI", type: "number", value: 1, min: 0, max: 6, comment: "PIN verification key index from 0 through 6." },
            { name: "Expected PVV", type: "string", value: "", comment: "Stored PVV value to compare against." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the assembled PVV input and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, pan, pvki, expectedPvv, outputJson] = args;
        const result = verifyVisaPvv(pvkHex, pan, pvki, input, expectedPvv);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyVISAPVV;
