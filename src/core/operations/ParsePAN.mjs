/**
 * @license Apache-2.0
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
        this.description = "Paste a payment card number into the input field and classify it by public network rules.<br><br><b>Input:</b> PAN digits.<br><b>Arguments:</b> none.<br><br>This parser identifies Visa, Mastercard, American Express, and Discover based on public prefix and length rules, and reports Luhn validity.";
        this.inlineHelp = "<strong>Input:</strong> PAN digits only.<br><strong>Args:</strong> none.";
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
