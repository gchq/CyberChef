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
 * Search operation
 */
class Search extends Operation {

    /**
     * Search constructor
     */
    constructor() {
        super();

        this.name = "Search";
        this.module = "Regex";
        this.description = "Searches the input for list of strings or regexs.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "html";
        this.args = [
            {
                "name": "Search strings",
                "type": "text",
                "value": ""
            },
            {
                "name": "Strings are regex",
                "type": "boolean",
                "value": false
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
        const [
            searchText,
            regex, i, m, s, u,
            displayTotal,
            outputFormat
        ] = args;
        let modifiers = "g";
        let userRegex;

        if (i) modifiers += "i";
        if (m) modifiers += "m";
        if (s) modifiers += "s";
        if (u) modifiers += "u";

        if (regex) {
            userRegex = "(" + searchText.split("\n").join("|") + ")";
        } else {
            userRegex = "(" + Utils.escapeRegex(searchText).split("\n").join("|") + ")";
        }

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
                        throw new OperationError("Error: Invalid output format");
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
                title += `\t${i+1}: ${Utils.escapeHtml(groups[i] || "")}\n`;
            }
        }

        // Switch highlight
        hl = hl === 1 ? 2 : 1;

        // Store highlighted match and replace with a placeholder
        captureGroups.push(`<span class='hl${hl}' title='${title}'>${Utils.escapeHtml(match)}</span>`);
        return `[cc_capture_group_${total++}]`;
    });

    // Safely escape all remaining text, then replace placeholders
    output = Utils.escapeHtml(output);
    output = output.replace(/\[cc_capture_group_(\d+)\]/g, (_, i) => {
        return captureGroups[i];
    });

    if (displayTotal)
        output = "Total found: " + total + "\n\n" + output;

    return output;
}

export default Search;
