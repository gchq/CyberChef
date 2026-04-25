/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { parsePan } from "../lib/Pan.mjs";

/**
 * Parse PAN operation.
 */
class ParsePAN extends Operation {
    /**
     * ParsePAN constructor.
     */
    constructor() {
        super();

        this.name = "Parse PAN";
        this.module = "Payment";
        this.description = "Paste a payment card number into the input field and classify it by public network rules.<br><br><b>Input:</b> PAN digits.<br><b>Arguments:</b> none.<br><br><b>Validation:</b> Verified for Luhn behavior and public range matching used in this fork. Classification is limited to the implemented Visa, Mastercard, American Express, and Discover ranges.<br><br><b>Security:</b> PANs may still be sensitive. Use test data wherever possible.";
        this.inlineHelp = "<strong>Input:</strong> PAN digits only.<br><strong>Args:</strong> none.<br><strong>Validation:</strong> public range matching + Luhn.";
        this.testDataSamples = [
            {
                name: "Discover sample",
                input: "6011000991543426",
                args: []
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Payment_card_number";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        return JSON.stringify(parsePan(input), null, 4);
    }
}

export default ParsePAN;
