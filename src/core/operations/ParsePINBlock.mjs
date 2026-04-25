/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { PIN_BLOCK_FORMATS, parsePinBlock } from "../lib/PinBlock.mjs";

/**
 * Parse PIN block operation
 */
class ParsePINBlock extends Operation {

    /**
     * ParsePINBlock constructor
     */
    constructor() {
        super();

        this.name = "Parse PIN Block";
        this.module = "Payment";
        this.description = "Paste a clear ISO 9564 PIN block into the input field as hex and decode it into its component fields.<br><br><b>Input:</b> 8-byte clear PIN block as hex.<br><b>Arguments:</b> choose the format and provide the PAN when the format binds to PAN data.<br><br>This operation currently parses clear test PIN blocks for ISO formats 0, 1, and 3.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN block hex.<br><strong>Args:</strong> choose the format and provide the PAN for formats 0 and 3 so the block can be decoded.";
        this.testDataSamples = [
            {
                name: "Known ISO Format 0 vector",
                input: "041215FEDCBA9876",
                args: ["ISO Format 0", "5432101234567890"]
            }
        ];
        this.infoURL = "https://wikipedia.org/wiki/ISO_9564";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Format",
                type: "option",
                value: PIN_BLOCK_FORMATS,
                comment: "Choose the format you expect the input block to decode as. The parser validates the format nibble after PAN unmasking."
            },
            {
                name: "Primary account number",
                type: "string",
                value: "",
                comment: "Required for formats 0 and 3. Enter digits only; the implementation uses the rightmost 12 digits excluding the check digit."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, pan] = args;
        return JSON.stringify(parsePinBlock(format, input, pan), null, 4);
    }
}

export default ParsePINBlock;
