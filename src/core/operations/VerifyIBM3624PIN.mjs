/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { verifyIbm3624Pin } from "../lib/PaymentPinVerification.mjs";

/**
 * Verify IBM 3624 PIN operation.
 */
class VerifyIBM3624PIN extends Operation {
    /**
     * VerifyIBM3624PIN constructor.
     */
    constructor() {
        super();

        this.name = "PIN IBM 3624 Verify";
        this.module = "Payment";
        this.description = "Paste the stored PIN offset into the input field and verify it against a clear PIN.<br><br><b>Input:</b> stored IBM 3624 PIN offset (4 to 12 decimal digits).<br><b>Arguments:</b> provide the clear PVK in hex, decimalization table, validation data, pad character, and the clear PIN to verify.<br><br>This operation re-derives the offset from the supplied PIN and keying material and compares it to the input offset. Use this directly after <b>PIN IBM 3624 Offset Generate</b> in a recipe — the offset output flows naturally into this input.<br><br><b>Validation:</b> Partially verified. This is the verification pair for the same clear-key IBM 3624 helper logic used by generation.<br><br><b>Security:</b> Clear PIN and PVK material are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> stored IBM 3624 PIN offset.<br><strong>Args:</strong> provide PVK, decimalization table, validation data, pad character, and the clear PIN to verify.<br><strong>Validation:</strong> clear-key IBM 3624 verification helper.";
        this.testDataSamples = [
            {
                name: "IBM 3624 verify sample",
                input: "3207",
                args: ["0123456789ABCDEFFEDCBA9876543210", "0123456789012345", "5432101234567890", "F", "1234", true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/IBM_3624";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear IBM 3624 PVK as 16-byte or 24-byte hex." },
            { name: "Decimalization table", type: "string", value: "0123456789012345", comment: "Sixteen decimal digits used to map hex nibbles to decimal digits." },
            { name: "PIN validation data", type: "string", value: "", comment: "Issuer validation data, typically PAN-derived digits, 4 to 16 digits." },
            { name: "Pad character", type: "shortString", value: "F", comment: "Single hex nibble used to right-pad validation data to 16 nibbles." },
            { name: "Clear PIN", type: "string", value: "", comment: "The PIN to verify. The operation re-derives the offset from this PIN and compares it to the input offset." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the recomputed offset and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, decimalizationTable, pinValidationData, padCharacter, pin, outputJson] = args;
        const result = verifyIbm3624Pin(pvkHex, decimalizationTable, pinValidationData, padCharacter, input, pin);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyIBM3624PIN;
