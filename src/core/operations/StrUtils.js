import Utils from "../Utils.js";


/**
 * String utility operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const StrUtils = {

    /**
     * @constant
     * @default
     */
    CASE_SCOPE: ["All", "Word", "Sentence", "Paragraph"],

    /**
     * To Upper case operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runUpper: function (input, args) {
        const scope = args[0];

        switch (scope) {
            case "Word":
                return input.replace(/(\b\w)/gi, function(m) {
                    return m.toUpperCase();
                });
            case "Sentence":
                return input.replace(/(?:\.|^)\s*(\b\w)/gi, function(m) {
                    return m.toUpperCase();
                });
            case "Paragraph":
                return input.replace(/(?:\n|^)\s*(\b\w)/gi, function(m) {
                    return m.toUpperCase();
                });
            case "All":
                /* falls through */
            default:
                return input.toUpperCase();
        }
    },


    /**
     * To Upper case operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runLower: function (input, args) {
        return input.toLowerCase();
    },


    /**
     * @constant
     * @default
     */
    SPLIT_DELIM: ",",
    /**
     * @constant
     * @default
     */
    DELIMITER_OPTIONS: ["Line feed", "CRLF", "Space", "Comma", "Semi-colon", "Colon", "Nothing (separate chars)"],

    /**
     * Split operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSplit: function(input, args) {
        let splitDelim = args[0] || StrUtils.SPLIT_DELIM,
            joinDelim = Utils.charRep[args[1]],
            sections = input.split(splitDelim);

        return sections.join(joinDelim);
    },


    /**
     * Filter operation.
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFilter: function(input, args) {
        let delim = Utils.charRep[args[0]],
            regex,
            reverse = args[2];

        try {
            regex = new RegExp(args[1]);
        } catch (err) {
            return "Invalid regex. Details: " + err.message;
        }

        const regexFilter = function(value) {
            return reverse ^ regex.test(value);
        };

        return input.split(delim).filter(regexFilter).join(delim);
    },


    /**
     * @constant
     * @default
     */
    OFF_CHK_SAMPLE_DELIMITER: "\\n\\n",

    /**
     * Offset checker operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runOffsetChecker: function(input, args) {
        let sampleDelim = args[0],
            samples = input.split(sampleDelim),
            outputs = new Array(samples.length),
            i = 0,
            s = 0,
            match = false,
            inMatch = false,
            chr;

        if (!samples || samples.length < 2) {
            return "Not enough samples, perhaps you need to modify the sample delimiter or add more data?";
        }

        // Initialise output strings
        outputs.fill("", 0, samples.length);

        // Loop through each character in the first sample
        for (i = 0; i < samples[0].length; i++) {
            chr = samples[0][i];
            match = false;

            // Loop through each sample to see if the chars are the same
            for (s = 1; s < samples.length; s++) {
                if (samples[s][i] !== chr) {
                    match = false;
                    break;
                }
                match = true;
            }

            // Write output for each sample
            for (s = 0; s < samples.length; s++) {
                if (samples[s].length <= i) {
                    if (inMatch) outputs[s] += "</span>";
                    if (s === samples.length - 1) inMatch = false;
                    continue;
                }

                if (match && !inMatch) {
                    outputs[s] += "<span class='hl5'>" + Utils.escapeHtml(samples[s][i]);
                    if (samples[s].length === i + 1) outputs[s] += "</span>";
                    if (s === samples.length - 1) inMatch = true;
                } else if (!match && inMatch) {
                    outputs[s] += "</span>" + Utils.escapeHtml(samples[s][i]);
                    if (s === samples.length - 1) inMatch = false;
                } else {
                    outputs[s] += Utils.escapeHtml(samples[s][i]);
                    if (inMatch && samples[s].length === i + 1) {
                        outputs[s] += "</span>";
                        if (samples[s].length - 1 !== i) inMatch = false;
                    }
                }

                if (samples[0].length - 1 === i) {
                    if (inMatch) outputs[s] += "</span>";
                    outputs[s] += Utils.escapeHtml(samples[s].substring(i + 1));
                }
            }
        }

        return outputs.join(sampleDelim);
    },


    /**
     * @constant
     * @default
     */
    ESCAPE_REPLACEMENTS: [
        {"escaped": "\\\\", "unescaped": "\\"}, // Must be first
        {"escaped": "\\'", "unescaped": "'"},
        {"escaped": "\\\"", "unescaped": "\""},
        {"escaped": "\\n", "unescaped": "\n"},
        {"escaped": "\\r", "unescaped": "\r"},
        {"escaped": "\\t", "unescaped": "\t"},
        {"escaped": "\\b", "unescaped": "\b"},
        {"escaped": "\\f", "unescaped": "\f"},
    ],

    /**
     * Escape string operation.
     *
     * @author Vel0x [dalemy@microsoft.com]
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @example
     * StrUtils.runUnescape("Don't do that", [])
     * > "Don\'t do that"
     * StrUtils.runUnescape(`Hello
     * World`, [])
     * > "Hello\nWorld"
     */
    runEscape: function(input, args) {
        return StrUtils._replaceByKeys(input, "unescaped", "escaped");
    },


    /**
     * Unescape string operation.
     *
     * @author Vel0x [dalemy@microsoft.com]
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @example
     * StrUtils.runUnescape("Don\'t do that", [])
     * > "Don't do that"
     * StrUtils.runUnescape("Hello\nWorld", [])
     * > `Hello
     * World`
     */
    runUnescape: function(input, args) {
        return StrUtils._replaceByKeys(input, "escaped", "unescaped");
    },


    /**
     * Replaces all matching tokens in ESCAPE_REPLACEMENTS with the correction. The
     * ordering is determined by the patternKey and the replacementKey.
     *
     * @author Vel0x [dalemy@microsoft.com]
     * @author Matt C [matt@artemisbot.uk]
     *
     * @param {string} input
     * @param {string} pattern_key
     * @param {string} replacement_key
     * @returns {string}
     */
    _replaceByKeys: function(input, patternKey, replacementKey) {
        let output = input;

        // Catch the \\x encoded characters
        if (patternKey === "escaped") output = Utils.parseEscapedChars(input);

        StrUtils.ESCAPE_REPLACEMENTS.forEach(replacement => {
            output = output.split(replacement[patternKey]).join(replacement[replacementKey]);
        });
        return output;
    },


    /**
     * Head lines operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHead: function(input, args) {
        let delimiter = args[0],
            number = args[1];

        delimiter = Utils.charRep[delimiter];
        const splitInput = input.split(delimiter);

        return splitInput
            .filter((line, lineIndex) => {
                lineIndex += 1;

                if (number < 0) {
                    return lineIndex <= splitInput.length + number;
                } else {
                    return lineIndex <= number;
                }
            })
            .join(delimiter);
    },


    /**
     * Tail lines operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTail: function(input, args) {
        let delimiter = args[0],
            number = args[1];

        delimiter = Utils.charRep[delimiter];
        const splitInput = input.split(delimiter);

        return splitInput
            .filter((line, lineIndex) => {
                lineIndex += 1;

                if (number < 0) {
                    return lineIndex > -number;
                } else {
                    return lineIndex > splitInput.length - number;
                }
            })
            .join(delimiter);
    },
};

export default StrUtils;
