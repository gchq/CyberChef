/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import { PIN_BLOCK_FORMATS, buildPinBlock } from "../lib/PinBlock.mjs";

/**
 * Build PIN block operation
 */
class BuildPINBlock extends Operation {

    /**
     * BuildPINBlock constructor
     */
    constructor() {
        super();

        this.name = "Build PIN Block";
        this.module = "Payment";
        this.description = "Paste the clear PIN into the input field and choose the ISO 9564 clear PIN block format to build.<br><br><b>Input:</b> clear PIN digits.<br><b>Arguments:</b> choose the target format, provide the PAN when required, and optionally randomize filler digits for formats 1 and 3.<br><br>This operation currently builds clear test PIN blocks for ISO formats 0, 1, and 3.";
        this.inlineHelp = "<strong>Input:</strong> clear PIN digits.<br><strong>Args:</strong> choose the format, add the PAN for formats 0 and 3, then decide whether format 1 or 3 filler digits should be randomized.";
        this.testDataSamples = [
            {
                name: "Random ISO Format 0 sample",
                input: "__RANDOM_PIN_4__",
                args: ["ISO Format 0", "__RANDOM_PAN_16__", false]
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
                comment: "Choose the clear ISO 9564 block format to build. Assumption: only formats <code>0</code>, <code>1</code>, and <code>3</code> are implemented."
            },
            {
                name: "Primary account number",
                type: "string",
                value: "",
                comment: "Required for formats 0 and 3. Enter digits only; the implementation uses the rightmost 12 digits excluding the check digit."
            },
            {
                name: "Randomize fill digits",
                type: "boolean",
                value: false,
                comment: "Affects only formats 1 and 3. When disabled, filler is deterministic so test vectors stay stable."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [format, pan, randomizeFill] = args;
        return buildPinBlock(format, input, pan, randomizeFill);
    }
}

export default BuildPINBlock;
