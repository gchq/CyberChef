/**
 * @author klaxon [klaxon@veyr.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import { GenerateParagraphs, GenerateSentences, GenerateWords, GenerateBytes } from "../lib/LoremIpsum";

/**
 * Lorem Ipsum Generator operation
 */
class LoremIpsumGenerator extends Operation {

    /**
     * LoremIpsumGenerator constructor
     */
    constructor() {
        super();

        this.name = "Lorem Ipsum Generator";
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
        if (length < 1){
            throw new OperationError("Length must be greater than 0");
        }
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
                throw new OperationError("invalid lengthType");

        }
    }

}

export default LoremIpsumGenerator;
