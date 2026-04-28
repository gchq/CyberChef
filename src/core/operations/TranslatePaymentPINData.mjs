/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import TranslatePINBlock from "./TranslatePINBlock.mjs";

/**
 * Translate payment PIN data operation.
 */
class TranslatePaymentPINData extends Operation {
    /**
     * TranslatePaymentPINData constructor.
     */
    constructor() {
        super();

        this.name = "Translate Payment PIN Data";
        this.module = "Payment";
        this.description = "Paste a clear PIN block into the input field as hex and translate it between supported clear ISO 9564 formats using an AWS-style wrapper.<br><br><b>Input:</b> clear PIN block hex.<br><b>Arguments:</b> choose source and target formats, provide PAN values when required, and optionally randomize target filler digits.";
        this.inlineHelp = "<strong>Input:</strong> source clear PIN block hex.<br><strong>Args:</strong> define source and target format plus PAN context.";
        this.testDataSamples = [
            {
                name: "Format 0 to 1 sample",
                input: "041215FEDCBA9876",
                args: ["ISO Format 0", "5432101234567890", "ISO Format 1", "", false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/DataAPIReference/API_TranslatePinData.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            { name: "Source format", type: "option", value: ["ISO Format 0", "ISO Format 1", "ISO Format 3"], comment: "How to decode the input PIN block." },
            { name: "Source PAN", type: "string", value: "", comment: "Required for source formats 0 and 3." },
            { name: "Target format", type: "option", value: ["ISO Format 0", "ISO Format 1", "ISO Format 3"], defaultIndex: 1, comment: "Target clear PIN-block format." },
            { name: "Target PAN", type: "string", value: "", comment: "Required for target formats 0 and 3." },
            { name: "Randomize target fill digits", type: "boolean", value: false, comment: "Affects only target formats 1 and 3." },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const translator = new TranslatePINBlock();
        return translator.run(input, args);
    }
}

export default TranslatePaymentPINData;
