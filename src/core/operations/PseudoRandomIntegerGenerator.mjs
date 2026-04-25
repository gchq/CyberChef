/**
 * @author cktgh [chankaitung@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";
import Utils, { isWorkerEnvironment } from "../Utils.mjs";
import { DELIM_OPTIONS } from "../lib/Delim.mjs";

/**
 * Pseudo-Random Integer Generator operation
 */
class PseudoRandomIntegerGenerator extends Operation {

    // in theory 2**53 is the max range, but we use Number.MAX_SAFE_INTEGER (2**53 - 1) as it is more consistent.
    static MAX_RANGE = Number.MAX_SAFE_INTEGER;
    // arbitrary choice
    static BUFFER_SIZE = 1024;

    /**
     * PseudoRandomIntegerGenerator constructor
     */
    constructor() {
        super();

        this.name = "Pseudo-Random Integer Generator";
        this.module = "Ciphers";
        this.description = "A cryptographically-secure pseudo-random number generator (PRNG).<br><br>Generates random integers within a specified range using the browser's built-in <code>crypto.getRandomValues()</code> method if available.<br><br>The supported range of integers is from <code>-(2^53 - 1)</code> to <code>(2^53 - 1)</code>.";
        this.infoURL = "https://wikipedia.org/wiki/Pseudorandom_number_generator";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Number of Integers",
                "type": "number",
                "value": 1,
                "min": 1
            },
            {
                "name": "Min Value",
                "type": "number",
                "value": 0,
                "min": Number.MIN_SAFE_INTEGER,
                "max": Number.MAX_SAFE_INTEGER
            },
            {
                "name": "Max Value",
                "type": "number",
                "value": 99,
                "min": Number.MIN_SAFE_INTEGER,
                "max": Number.MAX_SAFE_INTEGER
            },
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            },
            {
                "name": "Output",
                "type": "option",
                "value": ["Raw", "Hex", "Decimal"]
            }
        ];

        // not using BigUint64Array to avoid BigInt handling overhead
        this.randomBuffer = new Uint32Array(PseudoRandomIntegerGenerator.BUFFER_SIZE);
        this.randomBufferOffset = PseudoRandomIntegerGenerator.BUFFER_SIZE;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [numInts, minInt, maxInt, delimiter, outputType] = args;

        if (minInt === null || maxInt === null) return "";

        const min = Math.ceil(minInt);
        const max = Math.floor(maxInt);
        const delim = Utils.charRep(delimiter || "Space");

        if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
            throw new OperationError("Min and Max must be between `-(2^53 - 1)` and `2^53 - 1`.");
        }
        if (min > max) {
            throw new OperationError("Min cannot be larger than Max.");
        }
        const range = max - min + 1; // inclusive range
        if (range > PseudoRandomIntegerGenerator.MAX_RANGE) {
            throw new OperationError("Range between Min and Max cannot be larger than `2^53`");
        }

        // as large as possible while divisible by range
        const rejectionThreshold = PseudoRandomIntegerGenerator.MAX_RANGE - (PseudoRandomIntegerGenerator.MAX_RANGE % range);
        const output = [];
        for (let i = 0; i < numInts; i++) {
            const result = this._generateRandomValue(rejectionThreshold);
            const intValue = min + (result % range);

            switch (outputType) {
                case "Hex":
                    output.push(intValue.toString(16));
                    break;
                case "Decimal":
                    output.push(intValue.toString(10));
                    break;
                case "Raw":
                default:
                    output.push(Utils.chr(intValue));
            }
        }

        if (outputType === "Raw") {
            return output.join("");
        }
        return output.join(delim);
    }

    /**
     * Generate a random value, result will be less than the rejection threshold (exclusive).
     *
     * @param {number} rejectionThreshold
     * @returns {number}
     */
    _generateRandomValue(rejectionThreshold) {
        let result;
        do {
            if (this.randomBufferOffset + 2 > this.randomBuffer.length) {
                this._resetRandomBuffer();
            }
            // stitching a 53 bit number; not using BigUint64Array to avoid BigInt handling overhead
            result = (this.randomBuffer[this.randomBufferOffset++] & 0x1f_ffff) * 0x1_0000_0000 +
                this.randomBuffer[this.randomBufferOffset++];
        } while (result >= rejectionThreshold);

        return result;
    }

    /**
     * Fill random buffer with new random values and rseet the offset.
     */
    _resetRandomBuffer() {
        if (isWorkerEnvironment() && self.crypto) {
            self.crypto.getRandomValues(this.randomBuffer);
        } else {
            const bytes = forge.random.getBytesSync(this.randomBuffer.length * 4);
            for (let j = 0; j < this.randomBuffer.length; j++) {
                this.randomBuffer[j] = (bytes.charCodeAt(j * 4) << 24) |
                    (bytes.charCodeAt(j * 4 + 1) << 16) |
                    (bytes.charCodeAt(j * 4 + 2) << 8) |
                    bytes.charCodeAt(j * 4 + 3);
            }
        }
        this.randomBufferOffset = 0;
    }

}

export default PseudoRandomIntegerGenerator;
