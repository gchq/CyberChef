/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { PIN_BLOCK_FORMATS, translatePinBlock } from "../lib/PinBlock.mjs";

/**
 * Translate PIN block operation
 */
class TranslatePINBlock extends Operation {

    /**
     * TranslatePINBlock constructor
     */
    constructor() {
        super();

        this.name = "Translate PIN Block";
        this.module = "Payment";
        this.description = "Paste a clear ISO 9564 PIN block into the input field as hex and translate it between supported clear block formats.<br><br><b>Input:</b> 8-byte clear PIN block as hex.<br><b>Arguments:</b> choose the source and target formats, provide source and target PAN values when required, and optionally randomize target filler digits for formats 1 and 3.<br><br>This operation currently translates clear test PIN blocks for ISO formats 0, 1, and 3.";
        this.inlineHelp = "<strong>Input:</strong> source clear PIN block hex.<br><strong>Args:</strong> choose source and target formats, then provide the source and target PAN values where the formats require them.";
        this.testDataSamples = [
            {
                name: "ISO Format 0 to 1 translation",
                input: "041215FEDCBA9876",
                args: ["ISO Format 0", "5432101234567890", "ISO Format 1", "", false]
            }
        ];
        this.infoURL = "https://wikipedia.org/wiki/ISO_9564";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Source format",
                type: "option",
                value: PIN_BLOCK_FORMATS,
                comment: "How the input block should be decoded before translation."
            },
            {
                name: "Source PAN",
                type: "string",
                value: "",
                comment: "Required when the source format is 0 or 3. Enter digits only; the implementation uses the rightmost 12 digits excluding the check digit."
            },
            {
                name: "Target format",
                type: "option",
                value: PIN_BLOCK_FORMATS,
                defaultIndex: 1,
                comment: "The clear PIN block format to emit after decoding the source block."
            },
            {
                name: "Target PAN",
                type: "string",
                value: "",
                comment: "Required when the target format is 0 or 3. Enter digits only; the implementation uses the rightmost 12 digits excluding the check digit."
            },
            {
                name: "Randomize target fill digits",
                type: "boolean",
                value: false,
                comment: "Affects only target formats 1 and 3. Leave disabled if you want repeatable vectors."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [sourceFormat, sourcePan, targetFormat, targetPan, randomizeFill] = args;
        return JSON.stringify(
            translatePinBlock(input, sourceFormat, sourcePan, targetFormat, targetPan, randomizeFill),
            null,
            4
        );
    }
}

export default TranslatePINBlock;
