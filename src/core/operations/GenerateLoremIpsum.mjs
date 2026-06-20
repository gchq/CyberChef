/**
 * @author klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { GenerateParagraphs, GenerateSentences, GenerateWords, GenerateBytes } from "../lib/LoremIpsum.mjs";

// arbitrary limits set to avoid DoS by requesting ridiculous amounts of data
const maxLoremWords = 100_000; // same limit also used for paragraphs/sentences
const maxLoremCharacters = 1_000_000;

/**
 * Generate Lorem Ipsum operation
 */
class GenerateLoremIpsum extends Operation {

    /**
     * GenerateLoremIpsum constructor
     */
    constructor() {
        super();

        this.name = "Generate Lorem Ipsum";
        this.module = "Default";
        this.description = "Generate varying length lorem ipsum placeholder text.";
        this.infoURL = "https://wikipedia.org/wiki/Lorem_ipsum";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Length",
                "type": "number",
                "value": "3"
            },
            {
                "name": "Length in",
                "type": "option",
                "value": ["Paragraphs", "Sentences", "Words", "Bytes"]
            }

        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [length, lengthType] = args;
        checkLimits(lengthType, length);
        switch (lengthType) {
            case "Paragraphs":
                return GenerateParagraphs(length);
            case "Sentences":
                return GenerateSentences(length);
            case "Words":
                return GenerateWords(length);
            case "Bytes":
                return GenerateBytes(length);
            default:
                throw new OperationError("Invalid length type");

        }
    }

}

export default GenerateLoremIpsum;

/**
 * check combined validity of lengthType and length arguments
 * @param {string} lengthType
 * @param {number} length
 * @throws {OperationError}
 */
function checkLimits(lengthType, length) {
    if (length < 1) {
        throw new OperationError("Length must be greater than 0");
    }

    switch (lengthType) {
        case "Paragraphs":
        case "Sentences":
        case "Words":
            if (length > maxLoremWords) {
                throw new OperationError("Length must be less than " + maxLoremWords);
            }
            break;
        case "Bytes":
            if (length > maxLoremCharacters) {
                throw new OperationError("Length must be less than " + maxLoremCharacters);
            }
            break;
        default:
            throw new OperationError("Invalid length type");
    }
}
