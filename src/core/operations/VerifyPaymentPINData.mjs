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

        this.name = "PIN Data Verify";
        this.module = "Payment";
        this.description = "Paste a clear PIN block into the input field as hex and verify it against an expected PIN.<br><br><b>Input:</b> clear PIN block hex.<br><b>Arguments:</b> choose the format, provide the PAN when required, supply the expected clear PIN, and optionally return structured JSON.<br><br><b>Validation:</b> Partially verified. This wrapper currently covers clear ISO 9564 formats 0, 1, and 3 only.<br><br><b>Security:</b> Clear PIN handling is test-use only.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN block hex.<br><strong>Args:</strong> define the PIN-block format, PAN context, expected PIN, and output format.<br><strong>Validation:</strong> clear ISO formats 0, 1, and 3 only.";
        this.testDataSamples = [
            {
                name: "Format 0 verification sample",
                input: "041215FEDCBA9876",
                args: ["ISO Format 0", "5432101234567890", "1234", true]
            }
        ];
        this.infoURL = "https://wikipedia.org/wiki/ISO_9564";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Format", type: "option", value: ["ISO Format 0", "ISO Format 1", "ISO Format 3"], comment: "How to decode the input PIN block." },
            { name: "Primary account number", type: "string", value: "", comment: "Required for formats 0 and 3." },
            { name: "Expected PIN", type: "string", value: "", comment: "Clear PIN digits to compare against." },
            { name: "Output as JSON", type: "boolean", value: true, comment: "When enabled, returns the parsed PIN block and validity result." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, pan, expectedPin, outputJson] = args;
        const parser = new ParsePINBlock();
        const parsed = JSON.parse(parser.run(input, [format, pan]));
        const result = {
            ...parsed,
            expectedPin,
            valid: parsed.pin === String(expectedPin || "")
        };
        return outputJson ? JSON.stringify(result, null, 4) : String(result.valid);
    }
}

export default VerifyPaymentPINData;
