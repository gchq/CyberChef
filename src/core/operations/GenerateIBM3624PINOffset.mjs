/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { generateIbm3624PinOffset } from "../lib/PaymentPinVerification.mjs";

/**
 * Generate IBM 3624 PIN offset operation.
 */
class GenerateIBM3624PINOffset extends Operation {
    /**
     * GenerateIBM3624PINOffset constructor.
     */
    constructor() {
        super();

        this.name = "Generate IBM 3624 PIN Offset";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and generate the IBM 3624 offset used by issuer-side PIN verification.<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> provide the clear PVK in hex, decimalization table, validation data, and pad character.<br><br>Assumption: this is a clear-key software emulation of the IBM 3624 offset algorithm for test harnesses.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> provide PVK, decimalization table, validation data, and pad character.";
        this.testDataSamples = [
            {
                name: "IBM 3624 offset sample",
                input: "1234",
                args: ["0123456789ABCDEFFEDCBA9876543210", "0123456789012345", "5432101234567890", "F", true]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/generate-ibm3624.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "PIN verification key (hex)", type: "string", value: "", comment: "Provide the clear IBM 3624 PVK as 16-byte or 24-byte hex." },
            { name: "Decimalization table", type: "string", value: "0123456789012345", comment: "Sixteen decimal digits used to map hex nibbles to decimal digits." },
            { name: "PIN validation data", type: "string", value: "", comment: "Issuer validation data, typically PAN-derived digits, 4 to 16 digits." },
            { name: "Pad character", type: "shortString", value: "F", comment: "Single hex nibble used to right-pad validation data to 16 nibbles." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the intermediate natural PIN and validation-block details." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pvkHex, decimalizationTable, pinValidationData, padCharacter, outputJson] = args;
        const result = generateIbm3624PinOffset(pvkHex, decimalizationTable, pinValidationData, padCharacter, input);
        return outputJson ? JSON.stringify(result, null, 4) : result.pinOffset;
    }
}

export default GenerateIBM3624PINOffset;
