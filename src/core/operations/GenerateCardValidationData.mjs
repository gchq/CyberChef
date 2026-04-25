/**
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { CVV_PROFILES, generateCardValidationData } from "../lib/CardValidation.mjs";

/**
 * Generate card validation data operation.
 */
class GenerateCardValidationData extends Operation {

    /**
     * GenerateCardValidationData constructor.
     */
    constructor() {
        super();

        this.name = "Generate card validation data";
        this.module = "Payment";
        this.description = "Paste the combined CVK pair into the input field as hex and generate a card-verification value for software testing.<br><br><b>Input:</b> combined CVK pair as 16-byte or 24-byte hex.<br><b>Arguments:</b> select whether you are generating CVV/CVC, CVV2/CVC2, or iCVV, then provide the PAN, expiry components, and service code details.<br><br>This implementation is intended for test harnesses and assumes the common CVV decimalization flow used by payment HSM integrations.";
        this.inlineHelp = "<strong>Input:</strong> combined CVK pair hex.<br><strong>Args:</strong> choose the validation-data profile, then provide PAN, expiry, and service-code inputs.";
        this.testDataSamples = [
            {
                name: "Known CVV2 test sample",
                input: "0123456789ABCDEFFEDCBA9876543210",
                args: ["CVV2 / CVC2 (force 000)", "4123456789012345", "02", "25", "MMYY", "101", 3, false]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/generate-card-data.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Validation data type",
                type: "option",
                value: CVV_PROFILES,
                comment: "Choose whether the output should behave like CVV/CVC, CVV2/CVC2, or iCVV. Assumption: CVV2 forces service code <code>000</code> and iCVV forces <code>999</code>."
            },
            {
                name: "Primary account number",
                type: "string",
                value: "",
                comment: "Provide the PAN as 13 to 19 decimal digits with no separators."
            },
            {
                name: "Expiry month (MM)",
                type: "shortString",
                value: "",
                comment: "Two-digit month component used when assembling the expiry date."
            },
            {
                name: "Expiry year (YY)",
                type: "shortString",
                value: "",
                comment: "Two-digit year component used when assembling the expiry date."
            },
            {
                name: "Expiry layout",
                type: "option",
                value: ["YYMM", "MMYY"],
                defaultIndex: 1,
                comment: "Assumption: this controls only how the month and year are assembled into the 4-digit expiry value used by the CVV algorithm."
            },
            {
                name: "Service code",
                type: "shortString",
                value: "101",
                comment: "Three-digit service code. Used directly for CVV/CVC. Ignored for CVV2 and iCVV because those profiles force <code>000</code> and <code>999</code>."
            },
            {
                name: "Output digits",
                type: "number",
                value: 3,
                min: 1,
                max: 5,
                comment: "How many digits of validation data to return. Common card-security-code lengths are <code>3</code> and sometimes <code>4</code>."
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
                comment: "When enabled, returns the assembled input, intermediate hex, and decimalized value along with the final output."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [profile, pan, expiryMonth, expiryYear, expiryLayout, serviceCode, outputDigits, outputJson] = args;
        const result = generateCardValidationData(
            input,
            pan,
            expiryMonth,
            expiryYear,
            expiryLayout,
            serviceCode,
            profile,
            outputDigits
        );

        return outputJson ? JSON.stringify(result, null, 4) : result.validationData;
    }
}

export default GenerateCardValidationData;
