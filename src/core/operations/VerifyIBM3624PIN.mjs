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

        this.name = "Verify IBM 3624 PIN";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and verify it against an IBM 3624 offset.<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> provide the clear PVK in hex, decimalization table, validation data, pad character, and expected offset.<br><br><b>Validation:</b> Partially verified. This is the verification pair for the same clear-key IBM 3624 helper logic used by generation.<br><br><b>Security:</b> Clear PIN and PVK material are test-use only.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> provide PVK, decimalization table, validation data, pad character, and expected offset.<br><strong>Validation:</strong> clear-key IBM 3624 verification helper.";
        this.testDataSamples = [
            {
                name: "IBM 3624 verify sample",
                input: "1234",
                args: ["0123456789ABCDEFFEDCBA9876543210", "0123456789012345", "5432101234567890", "F", "3207", true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/verify-pin-data.ibm3624-example.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear IBM 3624 PVK as 16-byte or 24-byte hex." },
            { name: "Decimalization table", type: "string", value: "0123456789012345", comment: "Sixteen decimal digits used to map hex nibbles to decimal digits." },
            { name: "PIN validation data", type: "string", value: "", comment: "Issuer validation data, typically PAN-derived digits, 4 to 16 digits." },
            { name: "Pad character", type: "shortString", value: "F", comment: "Single hex nibble used to right-pad validation data to 16 nibbles." },
            { name: "PIN offset", type: "string", value: "", comment: "Stored IBM 3624 offset value to compare against." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the recomputed offset and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, decimalizationTable, pinValidationData, padCharacter, pinOffset, outputJson] = args;
        const result = verifyIbm3624Pin(pvkHex, decimalizationTable, pinValidationData, padCharacter, pinOffset, input);
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyIBM3624PIN;
