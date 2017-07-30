import Utils from "../Utils.js";
import * as JsDiff from "diff";


/**
 * Diff operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Diff = {

    /**
     * @constant
     * @default
     */
    DIFF_SAMPLE_DELIMITER: "\\n\\n",
    /**
     * @constant
     * @default
     */
    DIFF_BY: ["Character", "Word", "Line", "Sentence", "CSS", "JSON"],

    /**
     * Diff operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runDiff: function(input, args) {
        let sampleDelim = args[0],
            diffBy = args[1],
            showAdded = args[2],
            showRemoved = args[3],
            ignoreWhitespace = args[4],
            samples = input.split(sampleDelim),
            output = "",
            diff;

        if (!samples || samples.length !== 2) {
            return "Incorrect number of samples, perhaps you need to modify the sample delimiter or add more samples?";
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
                return "Invalid 'Diff by' option.";
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
    },

};

export default Diff;