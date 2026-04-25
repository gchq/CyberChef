/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Parse TR-31 key block header operation
 */
class ParseTR31KeyBlock extends Operation {

    /**
     * ParseTR31KeyBlock constructor
     */
    constructor() {
        super();

        this.name = "Parse TR-31 key block";
        this.module = "Payment";
        this.description = "Paste the full TR-31 key block into the input field as text or hex characters.<br><br><b>Input:</b> complete TR-31 key block string, with or without spaces. If your source includes a leading <code>R</code> prefix, leave <b>Trim leading R prefix</b> enabled.<br><br>This operation parses the fixed header, any optional blocks it can identify, and reports the remaining body.";
        this.inlineHelp = "<strong>Input:</strong> full TR-31 key block text.<br><strong>Args:</strong> leave the prefix trim enabled if the block starts with <code>R</code>.";
        this.testDataSamples = [
            {
                name: "Fixed-header parser sample",
                input: "D0016D0AB00E0000",
                args: [true]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Key_block";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Trim leading R prefix",
                "type": "boolean",
                "value": true,
                "comment": "Enable this if your source begins with an <code>R</code> transport prefix before the TR-31 block. The parser otherwise expects the block to start at the version byte."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [trimLeadingR] = args;
        let keyBlock = (input || "").replace(/\s+/g, "").toUpperCase();
        const notes = [];

        if (!keyBlock.length) {
            throw new OperationError("No input.");
        }

        if (trimLeadingR && keyBlock.startsWith("R")) {
            keyBlock = keyBlock.substring(1);
            notes.push("Removed leading R prefix.");
        }

        if (keyBlock.length < 16) {
            throw new OperationError("Input too short for TR-31 header.");
        }

        const fixedHeader = keyBlock.substring(0, 16);
        const declaredBlockLength = parseInt(keyBlock.substring(1, 5), 10);
        const optionalBlocksDeclared = parseInt(keyBlock.substring(12, 14), 10);
        let offset = 16;
        let optionalBlocksParsed = 0;
        const optionalBlocks = [];

        while (optionalBlocksParsed < optionalBlocksDeclared && offset + 4 <= keyBlock.length) {
            const blockId = keyBlock.substring(offset, offset + 2);
            const blockLength = parseInt(keyBlock.substring(offset + 2, offset + 4), 10);

            if (!Number.isFinite(blockLength) || blockLength < 4) {
                notes.push(`Stopped optional block parsing due to invalid block length at offset ${offset}.`);
                break;
            }

            if (offset + blockLength > keyBlock.length) {
                notes.push(`Stopped optional block parsing due to truncated block at offset ${offset}.`);
                break;
            }

            optionalBlocks.push({
                "id": blockId,
                "length": blockLength,
                "value": keyBlock.substring(offset + 4, offset + blockLength)
            });
            optionalBlocksParsed += 1;
            offset += blockLength;
        }

        const result = {
            "raw": keyBlock,
            "fixedHeader": {
                "raw": fixedHeader,
                "versionId": keyBlock.substring(0, 1),
                "declaredBlockLength": Number.isFinite(declaredBlockLength) ? declaredBlockLength : null,
                "keyUsage": keyBlock.substring(5, 7),
                "algorithm": keyBlock.substring(7, 8),
                "modeOfUse": keyBlock.substring(8, 9),
                "keyVersionNumber": keyBlock.substring(9, 11),
                "exportability": keyBlock.substring(11, 12),
                "optionalBlocksDeclared": Number.isFinite(optionalBlocksDeclared) ? optionalBlocksDeclared : null,
                "reserved": keyBlock.substring(14, 16)
            },
            "optionalBlocks": optionalBlocks,
            "bodyOffset": offset,
            "remainingBody": keyBlock.substring(offset),
            "notes": notes
        };

        if (result.fixedHeader.declaredBlockLength !== null && result.fixedHeader.declaredBlockLength !== keyBlock.length) {
            result.notes.push(`Declared block length ${result.fixedHeader.declaredBlockLength} does not match actual length ${keyBlock.length}.`);
        }

        if (result.fixedHeader.optionalBlocksDeclared !== null && result.fixedHeader.optionalBlocksDeclared !== optionalBlocks.length) {
            result.notes.push(`Declared optional blocks ${result.fixedHeader.optionalBlocksDeclared} but parsed ${optionalBlocks.length}.`);
        }

        return JSON.stringify(result, null, 4);
    }

}

export default ParseTR31KeyBlock;
