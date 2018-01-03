import XRegExp from "xregexp";
import Utils from "../Utils.js";


/**
 * Regex operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 *
 * @namespace
 */
const Regex = {

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
                const regex = new XRegExp(userRegex, modifiers);

                switch (outputFormat) {
                    case "Highlight matches":
                        return Regex._regexHighlight(input, regex, displayTotal);
                    case "List matches":
                        return Utils.escapeHtml(Regex._regexList(input, regex, displayTotal, true, false));
                    case "List capture groups":
                        return Utils.escapeHtml(Regex._regexList(input, regex, displayTotal, false, true));
                    case "List matches with capture groups":
                        return Utils.escapeHtml(Regex._regexList(input, regex, displayTotal, true, true));
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

export default Regex;
