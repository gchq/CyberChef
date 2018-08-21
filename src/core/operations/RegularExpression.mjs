/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import XRegExp from "xregexp";
import Operation from "../Operation";
import Utils from "../Utils";
import OperationError from "../errors/OperationError";

/**
 * Regular expression operation
 */
class RegularExpression extends Operation {

    /**
     * RegularExpression constructor
     */
    constructor() {
        super();

        this.name = "Regular expression";
        this.module = "Regex";
        this.description = "Define your own regular expression (regex) to search the input data with, optionally choosing from a list of pre-defined patterns.<br><br>Supports extended regex syntax including the 'dot matches all' flag, named capture groups, full unicode coverage (including <code>\\p{}</code> categories and scripts as well as astral codes) and recursive matching.";
        this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Built in regexes",
                "type": "populateOption",
                "value": [
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
                        value: "\\b(\\w[-.\\w]*)@([-\\w]+(?:\\.[-\\w]+)*)\\.([A-Za-z]{2,4})\\b"
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
                        value: "([A-Za-z]):\\\\((?:[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)~]{0,61}\\\\?)*[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)]{0,61})(\\.[A-Za-z\\d]{1,6})?"
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
                "target": 1
            },
            {
                "name": "Regex",
                "type": "text",
                "value": ""
            },
            {
                "name": "Case insensitive",
                "type": "boolean",
                "value": true
            },
            {
                "name": "^ and $ match at newlines",
                "type": "boolean",
                "value": true
            },
            {
                "name": "Dot matches all",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Unicode support",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Astral support",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Display total",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Highlight matches", "List matches", "List capture groups", "List matches with capture groups"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [,
            userRegex,
            i, m, s, u, a,
            displayTotal,
            outputFormat
        ] = args;
        let modifiers = "g";

        if (i) modifiers += "i";
        if (m) modifiers += "m";
        if (s) modifiers += "s";
        if (u) modifiers += "u";
        if (a) modifiers += "A";

        if (userRegex && userRegex !== "^" && userRegex !== "$") {
            try {
                const regex = new XRegExp(userRegex, modifiers);

                switch (outputFormat) {
                    case "Highlight matches":
                        return regexHighlight(input, regex, displayTotal);
                    case "List matches":
                        return Utils.escapeHtml(regexList(input, regex, displayTotal, true, false));
                    case "List capture groups":
                        return Utils.escapeHtml(regexList(input, regex, displayTotal, false, true));
                    case "List matches with capture groups":
                        return Utils.escapeHtml(regexList(input, regex, displayTotal, true, true));
                    default:
                        return "Error: Invalid output format";
                }
            } catch (err) {
                throw new OperationError("Invalid regex. Details: " + err.message);
            }
        } else {
            return Utils.escapeHtml(input);
        }
    }

}

/**
 * Creates a string listing the matches within a string.
 *
 * @param {string} input
 * @param {RegExp} regex
 * @param {boolean} displayTotal
 * @param {boolean} matches - Display full match
 * @param {boolean} captureGroups - Display each of the capture groups separately
 * @returns {string}
 */
function regexList (input, regex, displayTotal, matches, captureGroups) {
    let output = "",
        total = 0,
        match;

    while ((match = regex.exec(input))) {
        // Moves pointer when an empty string is matched (prevents infinite loop)
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

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

    return output.slice(0, -1);
}

/**
 * Adds HTML highlights to matches within a string.
 *
 * @private
 * @param {string} input
 * @param {RegExp} regex
 * @param {boolean} displayTotal
 * @returns {string}
 */
function regexHighlight (input, regex, displayTotal) {
    let output = "",
        m,
        hl = 1,
        i = 0,
        total = 0;

    while ((m = regex.exec(input))) {
        // Moves pointer when an empty string is matched (prevents infinite loop)
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

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
}

export default RegularExpression;
