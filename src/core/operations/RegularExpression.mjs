/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import XRegExp from "xregexp";
import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.description =
            "Define your own regular expression (regex) to search the input data with, optionally choosing from a list of pre-defined patterns.<br><br>Supports extended regex syntax including the 'dot matches all' flag, named capture groups, full unicode coverage (including <code>\\p{}</code> categories and scripts as well as astral codes) and recursive matching.";
        this.infoURL = "https://wikipedia.org/wiki/Regular_expression";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                name: "Built in regexes",
                type: "populateOption",
                value: [
                    {
                        name: "User defined",
                        value: "",
                    },
                    {
                        name: "IPv4 address",
                        value: "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
                    },
                    {
                        name: "IPv6 address",
                        value: "((?=.*::)(?!.*::.+::)(::)?([\\dA-Fa-f]{1,4}:(:|\\b)|){5}|([\\dA-Fa-f]{1,4}:){6})((([\\dA-Fa-f]{1,4}((?!\\3)::|:\\b|(?![\\dA-Fa-f])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})",
                    },
                    {
                        name: "Email address",
                        value: "(?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9](?:[\\u00A0-\\uD7FF\\uE000-\\uFFFF-a-z0-9-]*[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9])?\\.)+[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9](?:[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9-]*[\\u00A0-\\uD7FF\\uE000-\\uFFFFa-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}\\])",
                    },
                    {
                        name: "URL",
                        value: '([A-Za-z]+://)([-\\w]+(?:\\.\\w[-\\w]*)+)(:\\d+)?(/[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]*(?:[.!,?]+[^.!,?"<>\\[\\]{}\\s\\x7F-\\xFF]+)*)?',
                    },
                    {
                        name: "Domain",
                        value: "\\b((?=[a-z0-9-]{1,63}\\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\\.)+[a-z]{2,63}\\b",
                    },
                    {
                        name: "Windows file path",
                        value: "([A-Za-z]):\\\\((?:[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)~]{0,61}\\\\?)*[A-Za-z\\d][A-Za-z\\d\\- \\x27_\\(\\)]{0,61})(\\.[A-Za-z\\d]{1,6})?",
                    },
                    {
                        name: "UNIX file path",
                        value: "(?:/[A-Za-z\\d.][A-Za-z\\d\\-.]{0,61})+",
                    },
                    {
                        name: "MAC address",
                        value: "[A-Fa-f\\d]{2}(?:[:-][A-Fa-f\\d]{2}){5}",
                    },
                    {
                        name: "Date (yyyy-mm-dd)",
                        value: "((?:19|20)\\d\\d)[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])",
                    },
                    {
                        name: "Date (dd/mm/yyyy)",
                        value: "(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.]((?:19|20)\\d\\d)",
                    },
                    {
                        name: "Date (mm/dd/yyyy)",
                        value: "(0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])[- /.]((?:19|20)\\d\\d)",
                    },
                    {
                        name: "Strings",
                        value: '[A-Za-z\\d/\\-:.,_$%\\x27"()<>= !\\[\\]{}@]{4,}',
                    },
                    {
                        name: "UUID (any version)",
                        value: "[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}",
                    },
                ],
                target: 1,
            },
            {
                name: "Regex",
                type: "text",
                value: "",
            },
            {
                name: "Case insensitive",
                type: "boolean",
                value: true,
            },
            {
                name: "^ and $ match at newlines",
                type: "boolean",
                value: true,
            },
            {
                name: "Dot matches all",
                type: "boolean",
                value: false,
            },
            {
                name: "Unicode support",
                type: "boolean",
                value: false,
            },
            {
                name: "Astral support",
                type: "boolean",
                value: false,
            },
            {
                name: "Display total",
                type: "boolean",
                value: false,
            },
            {
                name: "Output format",
                type: "option",
                value: [
                    "Highlight matches",
                    "List matches",
                    "List capture groups",
                    "List matches with capture groups",
                ],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {html}
     */
    run(input, args) {
        const [, userRegex, i, m, s, u, a, displayTotal, outputFormat] = args;
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
                        return Utils.escapeHtml(
                            regexList(input, regex, displayTotal, true, false),
                        );
                    case "List capture groups":
                        return Utils.escapeHtml(
                            regexList(input, regex, displayTotal, false, true),
                        );
                    case "List matches with capture groups":
                        return Utils.escapeHtml(
                            regexList(input, regex, displayTotal, true, true),
                        );
                    default:
                        throw new OperationError(
                            "Error: Invalid output format",
                        );
                }
            } catch (err) {
                throw new OperationError(
                    "Invalid regex. Details: " + err.message,
                );
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
function regexList(input, regex, displayTotal, matches, captureGroups) {
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

    if (displayTotal) output = "Total found: " + total + "\n\n" + output;

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
function regexHighlight(input, regex, displayTotal) {
    let output = "",
        title = "",
        hl = 1,
        total = 0;
    const captureGroups = [];

    output = input.replace(regex, (match, ...args) => {
        args.pop(); // Throw away full string
        const offset = args.pop(),
            groups = args;

        title = `Offset: ${offset}\n`;
        if (groups.length) {
            title += "Groups:\n";
            for (let i = 0; i < groups.length; i++) {
                title += `\t${i + 1}: ${Utils.escapeHtml(groups[i] || "")}\n`;
            }
        }

        // Switch highlight
        hl = hl === 1 ? 2 : 1;

        // Store highlighted match and replace with a placeholder
        captureGroups.push(
            `<span class='hl${hl}' title='${title}'>${Utils.escapeHtml(
                match,
            )}</span>`,
        );
        return `[cc_capture_group_${total++}]`;
    });

    // Safely escape all remaining text, then replace placeholders
    output = Utils.escapeHtml(output);
    output = output.replace(/\[cc_capture_group_(\d+)\]/g, (_, i) => {
        return captureGroups[i];
    });

    if (displayTotal) output = "Total found: " + total + "\n\n" + output;

    return output;
}

export default RegularExpression;
