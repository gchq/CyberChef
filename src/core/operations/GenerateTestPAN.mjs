/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { PAN_BRANDS, generateTestPan } from "../lib/Pan.mjs";

/**
 * Generate test PAN operation.
 */
class GenerateTestPAN extends Operation {
    /**
     * GenerateTestPAN constructor.
     */
    constructor() {
        super();

        this.name = "Generate Test PAN";
        this.module = "Payment";
        this.description = "Generate a brand-valid payment card number for test workflows.<br><br><b>Input:</b> ignored.<br><b>Arguments:</b> choose the payment network, decide whether to use a curated sample or a locally generated brand-valid PAN, and choose the target length when the network supports multiple lengths.<br><br><b>Validation:</b> Partially verified. Network classification and Luhn behavior are based on public numbering rules. Some curated samples are from public vendor docs, while generated samples are local deterministic test values rather than network-certified sandbox cards.<br><br><b>Security:</b> Test data only. Do not treat generated PANs as live accounts.";
        this.inlineHelp = "<strong>Input:</strong> ignored.<br><strong>Args:</strong> choose the network, sample mode, and target length.<br><strong>Validation:</strong> public numbering rules + Luhn; not all curated samples are network-published official test cards.";
        this.testDataSamples = [
            {
                name: "Visa curated sample",
                input: "",
                args: ["Visa", "Curated sample", 16, true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Payment_card_number";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Network",
                type: "option",
                value: PAN_BRANDS,
                comment: "Choose the payment network whose public numbering rules should be applied."
            },
            {
                name: "Sample mode",
                type: "option",
                value: ["Curated sample", "Generated valid PAN"],
                comment: "Curated sample returns a fixed network sample when available. Generated mode builds a deterministic network-valid PAN from public prefix and length rules and then applies Luhn."
            },
            {
                name: "Target length",
                type: "number",
                value: 16,
                min: 13,
                max: 19,
                comment: "Used only in generated mode. Networks that do not support the requested length fall back to their first supported length."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: true,
                comment: "When enabled, returns the PAN plus the detected network, IIN, Luhn status, and source note."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [brand, mode, length, outputJson] = args;
        const result = generateTestPan(brand, mode, length);
        return outputJson ? JSON.stringify(result, null, 4) : result.pan;
    }
}

export default GenerateTestPAN;
