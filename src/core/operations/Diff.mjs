/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import * as JsDiff from "diff";
import OperationError from "../errors/OperationError";

/**
 * Diff operation
 */
class Diff extends Operation {

    /**
     * Diff constructor
     */
    constructor() {
        super();

        this.name = "Diff";
        this.module = "Diff";
        this.description = "Compares two inputs (separated by the specified delimiter) and highlights the differences between them.";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Sample delimiter",
                "type": "binaryString",
                "value": "\\n\\n"
            },
            {
                "name": "Diff by",
                "type": "option",
                "value": ["Character", "Word", "Line", "Sentence", "CSS", "JSON"]
            },
            {
                "name": "Show added",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Show removed",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Ignore whitespace (relevant for word and line)",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [
                sampleDelim,
                diffBy,
                showAdded,
                showRemoved,
                ignoreWhitespace
            ] = args,
            samples = input.split(sampleDelim);
        let output = "",
            diff;

        if (!samples || samples.length !== 2) {
            throw new OperationError("Incorrect number of samples, perhaps you need to modify the sample delimiter or add more samples?");
        }

        switch (diffBy) {
            case "Character":
                diff = JsDiff.diffChars(samples[0], samples[1]);
                break;
            case "Word":
                if (ignoreWhitespace) {
                    diff = JsDiff.diffWords(samples[0], samples[1]);
                } else {
                    diff = JsDiff.diffWordsWithSpace(samples[0], samples[1]);
                }
                break;
            case "Line":
                if (ignoreWhitespace) {
                    diff = JsDiff.diffTrimmedLines(samples[0], samples[1]);
                } else {
                    diff = JsDiff.diffLines(samples[0], samples[1]);
                }
                break;
            case "Sentence":
                diff = JsDiff.diffSentences(samples[0], samples[1]);
                break;
            case "CSS":
                diff = JsDiff.diffCss(samples[0], samples[1]);
                break;
            case "JSON":
                diff = JsDiff.diffJson(samples[0], samples[1]);
                break;
            default:
                throw new OperationError("Invalid 'Diff by' option.");
        }

        for (let i = 0; i < diff.length; i++) {
            if (diff[i].added) {
                if (showAdded) output += "<span class='hl5'>" + Utils.escapeHtml(diff[i].value) + "</span>";
            } else if (diff[i].removed) {
                if (showRemoved) output += "<span class='hl3'>" + Utils.escapeHtml(diff[i].value) + "</span>";
            } else {
                output += Utils.escapeHtml(diff[i].value);
            }
        }

        return output;
    }

}

export default Diff;
