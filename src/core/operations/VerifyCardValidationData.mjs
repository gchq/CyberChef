/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { CVV_PROFILES, verifyCardValidationData } from "../lib/CardValidation.mjs";

/**
 * Verify card validation data operation.
 */
class VerifyCardValidationData extends Operation {

    /**
     * VerifyCardValidationData constructor.
     */
    constructor() {
        super();

        this.name = "Verify Card Validation Data";
        this.module = "Payment";
        this.description = "Paste the combined CVK pair into the input field as hex and verify a CVV/CVC-style value for software testing.<br><br><b>Input:</b> combined CVK pair as 16-byte or 24-byte hex.<br><b>Arguments:</b> select the validation-data profile, provide the PAN and expiry components, then supply the expected validation data.<br><br>This operation recomputes the validation value using the same assumptions as the generate operation and reports whether the supplied value matches.";
        this.inlineHelp = "<strong>Input:</strong> combined CVK pair hex.<br><strong>Args:</strong> provide PAN, expiry, service-code context, and the validation data to check.";
        this.testDataSamples = [
            {
                name: "Known CVV2 verification sample",
                input: "0123456789ABCDEFFEDCBA9876543210",
                args: ["CVV2 / CVC2 (force 000)", "4123456789012345", "02", "25", "MMYY", "101", "221"]
            }
        ];
        this.infoURL = "https://docs.aws.amazon.com/payment-cryptography/latest/userguide/verify-card-data.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Validation data type",
                type: "option",
                value: CVV_PROFILES,
                comment: "Choose whether the supplied value should be interpreted as CVV/CVC, CVV2/CVC2, or iCVV. Assumption: CVV2 forces service code <code>000</code> and iCVV forces <code>999</code>."
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
                name: "Expected value",
                type: "shortString",
                value: "",
                comment: "Validation data to compare against, using 1 to 5 decimal digits."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [profile, pan, expiryMonth, expiryYear, expiryLayout, serviceCode, expectedValue] = args;
        return JSON.stringify(
            verifyCardValidationData(
                input,
                pan,
                expiryMonth,
                expiryYear,
                expiryLayout,
                serviceCode,
                profile,
                expectedValue
            ),
            null,
            4
        );
    }
}

export default VerifyCardValidationData;
