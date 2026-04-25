/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import BuildPINBlock from "./BuildPINBlock.mjs";

/**
 * Generate payment PIN data operation.
 */
class GeneratePaymentPINData extends Operation {
    /**
     * GeneratePaymentPINData constructor.
     */
    constructor() {
        super();

        this.name = "Generate Payment PIN Data";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and generate clear PIN-block test data using an AWS-style payment wrapper.<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> choose the PIN-block format, provide the PAN when required, and optionally return structured JSON.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> choose the block format and provide the PAN for PAN-bound formats.";
        this.testDataSamples = [
            {
                name: "Format 0 sample",
                input: "1234",
                args: ["ISO Format 0", "5432101234567890", false, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_GeneratePinData.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Format", type: "option", value: ["ISO Format 0", "ISO Format 1", "ISO Format 3"], comment: "Clear ISO 9564 format to generate. This wrapper currently supports only formats 0, 1, and 3." },
            { name: "Primary account number", type: "string", value: "", comment: "Required for formats 0 and 3. Enter digits only." },
            { name: "Randomize fill digits", type: "boolean", value: false, comment: "Affects only formats 1 and 3. Leave disabled for repeatable vectors." },
            { name: "Output as JSON", type: "boolean", value: false, comment: "When enabled, returns the clear PIN block plus the source context." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, pan, randomizeFill, outputJson] = args;
        const builder = new BuildPINBlock();
        const pinBlockHex = builder.run(input, [format, pan, randomizeFill]);
        const result = { format, pan, pinBlockHex };
        return outputJson ? JSON.stringify(result, null, 4) : pinBlockHex;
    }
}

export default GeneratePaymentPINData;
