/**
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import { DELIM_OPTIONS } from "../lib/Delim.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * String index lookup operation
 */
class StringIndexLookup extends Operation {

    /**
     * StringIndexLookup constructor
     */
    constructor() {
        super();

        this.name = "String index lookup";
        this.module = "Default";
        this.description = "Looks up characters from a source string using an input list of indexes. This is useful for deobfuscating command lines that build strings by indexing into a lookup string.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Source string",
                "type": "binaryString",
                "value": ""
            },
            {
                "name": "Delimiter",
                "type": "option",
                "value": DELIM_OPTIONS
            },
            {
                "name": "Indexing",
                "type": "option",
                "value": ["Zero-based", "One-based"]
            },
            {
                "name": "Skip invalid indexes",
                "type": "boolean",
                "value": true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if an index is invalid and invalid indexes are not skipped
     */
    run(input, args) {
        const source = [...(args[0] || "")],
            delim = Utils.charRep(args[1] || "Space"),
            indexOffset = args[2] === "One-based" ? 1 : 0,
            skipInvalid = args[3] !== false;

        return input.split(delim).reduce((output, rawIndex) => {
            const trimmedIndex = rawIndex.trim();

            if (trimmedIndex.length === 0) return output;

            const parsedIndex = Number(trimmedIndex);

            if (!Number.isInteger(parsedIndex)) {
                if (skipInvalid) return output;
                throw new OperationError(`Invalid index: ${trimmedIndex}`);
            }

            const sourceIndex = parsedIndex - indexOffset;
            if (sourceIndex < 0 || sourceIndex >= source.length) {
                if (skipInvalid) return output;
                throw new OperationError(`Index out of range: ${parsedIndex}`);
            }

            return output + source[sourceIndex];
        }, "");
    }

}

export default StringIndexLookup;
