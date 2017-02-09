/* globals JsDiff */

/**
 * String utility operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var StrUtils = {

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
            value: "([A-Za-z]+://)([-\\w]+(?:\\.\\w[-\\w]*)+)(:\\d+)?(/[^.!,?;\"\\x27<>()\\[\\]{}\\s\\x7F-\\xFF]*(?:[.!,?]+[^.!,?;\"\\x27<>()\\[\\]{}\\s\\x7F-\\xFF]+)*)?"
        },
        {
            name: "Domain",
            value: "(?:(https?):\\/\\/)?([-\\w.]+)\\.(com|net|org|biz|info|co|uk|onion|int|mobi|name|edu|gov|mil|eu|ac|ae|af|de|ca|ch|cn|cy|es|gb|hk|il|in|io|tv|me|nl|no|nz|ro|ru|tr|us|az|ir|kz|uz|pk)+"
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
        var userRegex = args[1],
            i = args[2],
            m = args[3],
            displayTotal = args[4],
            outputFormat = args[5],
            modifiers = "g";

        if (i) modifiers += "i";
        if (m) modifiers += "m";

        if (userRegex && userRegex !== "^" && userRegex !== "$") {
            try {
                var regex = new RegExp(userRegex, modifiers);

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
        var scope = args[0];

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
    FIND_REPLACE_GLOBAL : true,
    /**
     * @constant
     * @default
     */
    FIND_REPLACE_CASE : false,
    /**
     * @constant
     * @default
     */
    FIND_REPLACE_MULTILINE : true,

    /**
     * Find / Replace operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFindReplace: function(input, args) {
        var find = args[0].string,
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
        } else if (type.indexOf("Extended") === 0) {
            find = Utils.parseEscapedChars(find);
        }

        return input.replace(find, replace, modifiers);
        // Non-standard addition of flags in the third argument. This will work in Firefox but
        // probably nowhere else. The purpose is to allow global matching when the `find` parameter
        // is just a string.
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
        var splitDelim = args[0] || StrUtils.SPLIT_DELIM,
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
        var delim = Utils.charRep[args[0]],
            reverse = args[2];

        try {
            var regex = new RegExp(args[1]);
        } catch (err) {
            return "Invalid regex. Details: " + err.message;
        }

        var regexFilter = function(value) {
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
        var sampleDelim = args[0],
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

        for (var i = 0; i < diff.length; i++) {
            if (diff[i].added) {
                if (showAdded) output += "<span class='hlgreen'>" + Utils.escapeHtml(diff[i].value) + "</span>";
            } else if (diff[i].removed) {
                if (showRemoved) output += "<span class='hlred'>" + Utils.escapeHtml(diff[i].value) + "</span>";
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
        var sampleDelim = args[0],
            samples = input.split(sampleDelim),
            outputs = [],
            i = 0,
            s = 0,
            match = false,
            inMatch = false,
            chr;

        if (!samples || samples.length < 2) {
            return "Not enough samples, perhaps you need to modify the sample delimiter or add more data?";
        }

        // Initialise output strings
        for (s = 0; s < samples.length; s++) {
            outputs[s] = "";
        }

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
                    outputs[s] += "<span class='hlgreen'>" + Utils.escapeHtml(samples[s][i]);
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
     * Parse escaped string operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseEscapedString: function(input, args) {
        return Utils.parseEscapedChars(input);
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
        var output = "",
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
        var output = "",
            total = 0,
            match;

        while ((match = regex.exec(input))) {
            total++;
            if (matches) {
                output += match[0] + "\n";
            }
            if (captureGroups) {
                for (var i = 1; i < match.length; i++) {
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
