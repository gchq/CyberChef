/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
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

        this.name = "VISA PVV Verify";
        this.module = "Payment";
        this.description = "Paste the stored PVV into the input field and verify it against a clear PIN.<br><br><b>Input:</b> stored PVV (4 decimal digits).<br><b>Arguments:</b> provide the clear PVK in hex, PAN, PVKI, and the clear PIN to verify.<br><br>This operation re-derives the PVV from the supplied PIN and keying material and compares it to the input PVV. Use this directly after <b>VISA PVV Generate</b> in a recipe — the PVV output flows naturally into this input.<br><br><b>Validation:</b> Partially verified. This is the verification pair for the same clear-key VISA PVV helper logic used by generation.<br><br><b>Security:</b> Clear PIN and PVK material are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> stored PVV (4 decimal digits).<br><strong>Args:</strong> provide PVK, PAN, PVKI, and the clear PIN to verify.<br><strong>Validation:</strong> clear-key VISA PVV verification helper.";
        this.testDataSamples = [
            {
                name: "VISA PVV verify sample",
                input: "6077",
                args: ["0123456789ABCDEFFEDCBA9876543210", "5432101234567890", 1, "1234", true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/ISO_9564";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear VISA PVK as 16-byte or 24-byte hex." },
            { name: "Primary account number", type: "string", value: "", comment: "Provide the PAN as digits only. The standard PVV input uses the rightmost 11 digits before the check digit." },
            { name: "PVKI", type: "number", value: 1, min: 0, max: 6, comment: "PIN verification key index from 0 through 6." },
            { name: "Clear PIN", type: "string", value: "", comment: "The PIN to verify. The operation re-derives the PVV from this PIN and compares it to the input PVV." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the assembled PVV input and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, pan, pvki, pin, outputJson] = args;
        const result = verifyVisaPvv(pvkHex, pan, pvki, pin, input);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyVISAPVV;
