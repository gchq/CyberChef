/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { generateVisaPvv } from "../lib/PaymentPinVerification.mjs";

/**
 * Generate VISA PVV operation.
 */
class GenerateVISAPVV extends Operation {
    /**
     * GenerateVISAPVV constructor.
     */
    constructor() {
        super();

        this.name = "Generate VISA PVV";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and generate a VISA PIN Verification Value (PVV).<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> provide the clear PVK in hex, PAN, and PVKI.<br><br><b>Validation:</b> Partially verified. This is a clear-key software implementation of the common VISA PVV assembly pattern, not an HSM-certified PVV service.<br><br><b>Security:</b> Clear PIN and PVK material are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> provide PVK, PAN, and PVKI.<br><strong>Validation:</strong> clear-key VISA PVV helper.";
        this.testDataSamples = [
            {
                name: "VISA PVV sample",
                input: "1234",
                args: ["0123456789ABCDEFFEDCBA9876543210", "5432101234567890", 1, true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VisaPinVerification.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear VISA PVK as 16-byte or 24-byte hex." },
            { name: "Primary account number", type: "string", value: "", comment: "Provide the PAN as digits only. The standard PVV input uses the rightmost 11 digits before the check digit." },
            { name: "PVKI", type: "number", value: 1, min: 0, max: 6, comment: "PIN verification key index from 0 through 6." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the assembled PVV input and intermediate encrypted block." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, pan, pvki, outputJson] = args;
        const result = generateVisaPvv(pvkHex, pan, pvki, input);
        return outputJson ? JSON.stringify(result, null, 4) : result.pvv;
    }
}

export default GenerateVISAPVV;
