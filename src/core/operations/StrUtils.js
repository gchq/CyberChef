import Utils from "../Utils.js";
import * as JsDiff from "diff";


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
    REGEX_PRE_POPULATE: [
        {
            name: "User defined",
            value: ""
        },
        {
            name: "IPv4 address",
            value: "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?"
        },
        {
            name: "IPv6 address",
            value: "((?=.*::)(?!.*::.+::)(::)?([\\dA-Fa-f]{1,4}:(:|\\b)|){5}|([\\dA-Fa-f]{1,4}:){6})((([\\dA-Fa-f]{1,4}((?!\\3)::|:\\b|(?![\\dA-Fa-f])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})"
        },
        {
            name: "Email address",
            value: "(\\w[-.\\w]*)@([-\\w]+(?:\\.[-\\w]+)*)\\.([A-Za-z]{2,4})"
        },
        {
            name: "URL",
            value: "([A-Za-z]+://)([-\\w]+(?:\\.\\w[-\\w]*)+)(:\\d+)?(/[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]*(?:[.!,?]+[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]+)*)?"
        },
        {
            name: "Domain",
            value: "\\b((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}\\b"
        },
        {
            name: "Windows file path",
            value: "([A-Za-z]):\\\\((?:[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)]{0,61}\\\\?)*[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)]{0,61})(\\.[A-Za-z\\d]{1,6})?"
        },
        {
            name: "UNIX file path",
            value: "(?:/[A-Za-z\\d.][A-Za-z\\d\\-.]{0,61})+"
        },
        {
            name: "MAC address",
            value: "[A-Fa-f\\d]{2}(?:[:-][A-Fa-f\\d]{2}){5}"
        },
        {
            name: "Date (yyyy-mm-dd)",
            value: "((?:19|20)\\d\\d)[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])"
        },
        {
            name: "Date (dd/mm/yyyy)",
            value: "(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.]((?:19|20)\\d\\d)"
        },
        {
            name: "Date (mm/dd/yyyy)",
            value: "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.]((?:19|20)\\d\\d)"
        },
        {
            name: "Strings",
            value: "[A-Za-z\\d/\\-:.,_$%\\x27\"()<>= !\\[\\]{}@]{4,}"
        },
    ],
    /**
     * @constant
     * @default
     */
    REGEX_CASE_INSENSITIVE: true,
    /**
     * @constant
     * @default
     */
    REGEX_MULTILINE_MATCHING: true,
    /**
     * @constant
     * @default
     */
    OUTPUT_FORMAT: ["Highlight matches", "List matches", "List capture groups", "List matches with capture groups"],
    /**
     * @constant
     * @default
     */
    DISPLAY_TOTAL: false,

    /**
     * Regular expression operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    runRegex: function(input, args) {
        let userRegex = args[1],
            i = args[2],
            m = args[3],
            displayTotal = args[4],
            outputFormat = args[5],
            modifiers = "g";

        if (i) modifiers += "i";
        if (m) modifiers += "m";

        if (userRegex && userRegex !== "^" && userRegex !== "$") {
            try {
                const regex = new RegExp(userRegex, modifiers);

                switch (outputFormat) {
                    case "Highlight matches":
                        return StrUtils._regexHighlight(input, regex, displayTotal);
                    case "List matches":
                        return Utils.escapeHtml(StrUtils._regexList(input, regex, displayTotal, true, false));
                    case "List capture groups":
                        return Utils.escapeHtml(StrUtils._regexList(input, regex, displayTotal, false, true));
                    case "List matches with capture groups":
                        return Utils.escapeHtml(StrUtils._regexList(input, regex, displayTotal, true, true));
                    default:
                        return "Error: Invalid output format";
                }
            } catch (err) {
                return "Invalid regex. Details: " + err.message;
            }
        } else {
            return Utils.escapeHtml(input);
        }
    },


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
    SEARCH_TYPE: ["Regex", "Extended (\\n, \\t, \\x...)", "Simple string"],
    /**
     * @constant
     * @default
     */
    FIND_REPLACE_GLOBAL: true,
    /**
     * @constant
     * @default
     */
    FIND_REPLACE_CASE: false,
    /**
     * @constant
     * @default
     */
    FIND_REPLACE_MULTILINE: true,

    /**
     * Find / Replace operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFindReplace: function(input, args) {
        let find = args[0].string,
            type = args[0].option,
            replace = args[1],
            g = args[2],
            i = args[3],
            m = args[4],
            modifiers = "";

        if (g) modifiers += "g";
        if (i) modifiers += "i";
        if (m) modifiers += "m";

        if (type === "Regex") {
            find = new RegExp(find, modifiers);
            return input.replace(find, replace);
        }

        if (type.indexOf("Extended") === 0) {
            find = Utils.parseEscapedChars(find);
        }

        find = new RegExp(Utils.escapeRegex(find), modifiers);

        return input.replace(find, replace);
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


    /**
     * Adds HTML highlights to matches within a string.
     *
     * @private
     * @param {string} input
     * @param {RegExp} regex
     * @param {boolean} displayTotal
     * @returns {string}
     */
    _regexHighlight: function(input, regex, displayTotal) {
        let output = "",
            m,
            hl = 1,
            i = 0,
            total = 0;

        while ((m = regex.exec(input))) {
            // Add up to match
            output += Utils.escapeHtml(input.slice(i, m.index));

            // Add match with highlighting
            output += "<span class='hl"+hl+"'>" + Utils.escapeHtml(m[0]) + "</span>";

            // Switch highlight
            hl = hl === 1 ? 2 : 1;

            i = regex.lastIndex;
            total++;
        }

        // Add all after final match
        output += Utils.escapeHtml(input.slice(i, input.length));

        if (displayTotal)
            output = "Total found: " + total + "\n\n" + output;

        return output;
    },


    /**
     * Creates a string listing the matches within a string.
     *
     * @private
     * @param {string} input
     * @param {RegExp} regex
     * @param {boolean} displayTotal
     * @param {boolean} matches - Display full match
     * @param {boolean} captureGroups - Display each of the capture groups separately
     * @returns {string}
     */
    _regexList: function(input, regex, displayTotal, matches, captureGroups) {
        let output = "",
            total = 0,
            match;

        while ((match = regex.exec(input))) {
            total++;
            if (matches) {
                output += match[0] + "\n";
            }
            if (captureGroups) {
                for (let i = 1; i < match.length; i++) {
                    if (matches) {
                        output += "  Group " + i + ": ";
                    }
                    output += match[i] + "\n";
                }
            }
        }

        if (displayTotal)
            output = "Total found: " + total + "\n\n" + output;

        return output;
    },
};

export default StrUtils;
