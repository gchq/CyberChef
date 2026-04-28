/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import ParsePINBlock from "./ParsePINBlock.mjs";

/**
 * Verify payment PIN data operation.
 */
class VerifyPaymentPINData extends Operation {
    /**
     * VerifyPaymentPINData constructor.
     */
    constructor() {
        super();

        this.name = "Verify Payment PIN Data";
        this.module = "Payment";
        this.description = "Paste a clear PIN block into the input field as hex and verify it against an expected PIN using an AWS-style wrapper.<br><br><b>Input:</b> clear PIN block hex.<br><b>Arguments:</b> choose the format, provide the PAN when required, and supply the expected clear PIN.<br><br><b>Validation:</b> Partially verified. This wrapper currently covers clear ISO 9564 formats 0, 1, and 3 only.<br><br><b>Security:</b> Clear PIN handling is test-use only.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN block hex.<br><strong>Args:</strong> define the PIN-block format, PAN context, and expected PIN.<br><strong>Validation:</strong> clear ISO formats 0, 1, and 3 only.";
        this.testDataSamples = [
            {
                name: "Format 0 verification sample",
                input: "041215FEDCBA9876",
                args: ["ISO Format 0", "5432101234567890", "1234"]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_VerifyPinData.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Format", type: "option", value: ["ISO Format 0", "ISO Format 1", "ISO Format 3"], comment: "How to decode the input PIN block." },
            { name: "Primary account number", type: "string", value: "", comment: "Required for formats 0 and 3." },
            { name: "Expected PIN", type: "string", value: "", comment: "Clear PIN digits to compare against." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, pan, expectedPin] = args;
        const parser = new ParsePINBlock();
        const parsed = JSON.parse(parser.run(input, [format, pan]));
        return JSON.stringify({
            ...parsed,
            expectedPin,
            valid: parsed.pin === String(expectedPin || "")
        }, null, 4);
    }
}

export default VerifyPaymentPINData;
