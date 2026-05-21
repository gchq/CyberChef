/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { buildPinBlock } from "../lib/PinBlock.mjs";

const PIN_OUTPUT_MODES = [
    "PIN digits",
    "ISO Format 0 clear PIN block",
    "ISO Format 1 clear PIN block",
    "ISO Format 3 clear PIN block",
];

// Maps output mode label → PIN_BLOCK_FORMATS string used by buildPinBlock
const OUTPUT_TO_FORMAT = {
    "ISO Format 0 clear PIN block": "ISO Format 0",
    "ISO Format 1 clear PIN block": "ISO Format 1",
    "ISO Format 3 clear PIN block": "ISO Format 3",
};

/**
 * Generate PIN operation.
 */
class GeneratePIN extends Operation {
    /**
     * GeneratePIN constructor.
     */
    constructor() {
        super();

        this.name = "PIN Generate";
        this.module = "Payment";
        this.description = "Generate a cryptographically random cardholder PIN and optionally encode it as a clear ISO 9564 PIN block for use in test recipes.<br><br><b>Input:</b> ignored.<br><b>Arguments:</b> choose the PIN length, the output mode, and (for block modes) the PAN.<br><br>The PIN digits are drawn using <code>crypto.getRandomValues</code> with rejection sampling to guarantee uniform distribution across 0–9.<br><br>Block output modes produce the clear (unencrypted) PIN block directly; these are test artifacts and must not be treated as production PIN blocks.<br><br><b>Security:</b> Test data only. Do not use generated PINs or clear PIN blocks in production systems.";
        this.inlineHelp = "<strong>Input:</strong> ignored.<br><strong>Args:</strong> PIN length, output mode, and PAN for block formats.<br><strong>Validation:</strong> uniform random digits via crypto.getRandomValues; clear ISO 9564 block formats 0, 1, and 3.";
        this.testDataSamples = [
            {
                name: "4-digit PIN, digits only",
                input: "",
                args: [4, "PIN digits", ""]
            },
            {
                name: "4-digit PIN, Format 0 block",
                input: "",
                args: [4, "ISO Format 0 clear PIN block", "5432101234567890"]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Personal_identification_number";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "PIN length",
                type: "number",
                value: 4,
                min: 4,
                max: 12,
                comment: "Number of PIN digits to generate. Most cardholder PINs are 4 digits."
            },
            {
                name: "Output",
                type: "option",
                value: PIN_OUTPUT_MODES,
                comment: "PIN digits only, or a clear ISO 9564 PIN block. Block modes require the PAN argument."
            },
            {
                name: "PAN (for block formats)",
                type: "string",
                value: "",
                comment: "Required for ISO Format 0 and Format 3 block output. Ignored for PIN digits and ISO Format 1."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [length, outputMode, pan] = args;

        if (!Number.isInteger(length) || length < 4 || length > 12) {
            throw new OperationError("PIN length must be between 4 and 12.");
        }

        const pin = generateRandomPin(length);

        if (outputMode === "PIN digits") return pin;

        const format = OUTPUT_TO_FORMAT[outputMode];
        return buildPinBlock(format, pin, pan, true);
    }
}

/**
 * Generates a single random decimal digit using rejection sampling.
 * Rejects values >= 250 to ensure uniform distribution across 0–9
 * (250 = 25 × 10, so bytes 0–249 map to exactly 25 values per digit).
 *
 * @returns {number}
 */
function randomDecimalDigit() {
    const buf = new Uint8Array(1);
    let b;
    do {
        globalThis.crypto.getRandomValues(buf);
        b = buf[0];
    } while (b >= 250);
    return b % 10;
}

/**
 * Generates a random PIN of the given length.
 *
 * @param {number} length
 * @returns {string}
 */
function generateRandomPin(length) {
    return Array.from({ length }, () => randomDecimalDigit()).join("");
}

export default GeneratePIN;
