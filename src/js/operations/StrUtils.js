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
    run_regex: function(input, args) {
        var user_regex = args[1],
            i = args[2],
            m = args[3],
            display_total = args[4],
            output_format = args[5],
            modifiers = "g";
        
        if (i) modifiers += "i";
        if (m) modifiers += "m";
        
        if (user_regex && user_regex !== "^" && user_regex !== "$") {
            try {
                var regex = new RegExp(user_regex, modifiers);
                
                switch (output_format) {
                    case "Highlight matches":
                        return StrUtils._regex_highlight(input, regex, display_total);
                    case "List matches":
                        return Utils.escape_html(StrUtils._regex_list(input, regex, display_total, true, false));
                    case "List capture groups":
                        return Utils.escape_html(StrUtils._regex_list(input, regex, display_total, false, true));
                    case "List matches with capture groups":
                        return Utils.escape_html(StrUtils._regex_list(input, regex, display_total, true, true));
                    default:
                        return "Error: Invalid output format";
                }
            } catch (err) {
                return "Invalid regex. Details: " + err.message;
            }
        } else {
            return Utils.escape_html(input);
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
    run_upper: function (input, args) {
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
    run_lower: function (input, args) {
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
    run_find_replace: function(input, args) {
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
            find = Utils.parse_escaped_chars(find);
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
    run_split: function(input, args) {
        var split_delim = args[0] || StrUtils.SPLIT_DELIM,
            join_delim = Utils.char_rep[args[1]],
            sections = input.split(split_delim);
            
        return sections.join(join_delim);
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
    run_diff: function(input, args) {
        var sample_delim = args[0],
            diff_by = args[1],
            show_added = args[2],
            show_removed = args[3],
            ignore_whitespace = args[4],
            samples = input.split(sample_delim),
            output = "",
            diff;
            
        if (!samples || samples.length !== 2) {
            return "Incorrect number of samples, perhaps you need to modify the sample delimiter or add more samples?";
        }
        
        switch (diff_by) {
            case "Character":
                diff = JsDiff.diffChars(samples[0], samples[1]);
                break;
            case "Word":
                if (ignore_whitespace) {
                    diff = JsDiff.diffWords(samples[0], samples[1]);
                } else {
                    diff = JsDiff.diffWordsWithSpace(samples[0], samples[1]);
                }
                break;
            case "Line":
                if (ignore_whitespace) {
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
                if (show_added) output += "<span class='hlgreen'>" + Utils.escape_html(diff[i].value) + "</span>";
            } else if (diff[i].removed) {
                if (show_removed) output += "<span class='hlred'>" + Utils.escape_html(diff[i].value) + "</span>";
            } else {
                output += Utils.escape_html(diff[i].value);
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
    run_offset_checker: function(input, args) {
        var sample_delim = args[0],
            samples = input.split(sample_delim),
            outputs = [],
            i = 0,
            s = 0,
            match = false,
            in_match = false,
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
                    if (in_match) outputs[s] += "</span>";
                    if (s === samples.length - 1) in_match = false;
                    continue;
                }
                
                if (match && !in_match) {
                    outputs[s] += "<span class='hlgreen'>" + Utils.escape_html(samples[s][i]);
                    if (samples[s].length === i + 1) outputs[s] += "</span>";
                    if (s === samples.length - 1) in_match = true;
                } else if (!match && in_match) {
                    outputs[s] += "</span>" + Utils.escape_html(samples[s][i]);
                    if (s === samples.length - 1) in_match = false;
                } else {
                    outputs[s] += Utils.escape_html(samples[s][i]);
                    if (in_match && samples[s].length === i + 1) {
                        outputs[s] += "</span>";
                        if (samples[s].length - 1 !== i) in_match = false;
                    }
                }
                
                if (samples[0].length - 1 === i) {
                    if (in_match) outputs[s] += "</span>";
                    outputs[s] += Utils.escape_html(samples[s].substring(i + 1));
                }
            }
        }
        
        return outputs.join(sample_delim);
    },
    
    
    /**
     * Parse escaped string operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_parse_escaped_string: function(input, args) {
        return Utils.parse_escaped_chars(input);
    },
    
    
    /**
     * Adds HTML highlights to matches within a string.
     *
     * @private
     * @param {string} input
     * @param {RegExp} regex
     * @param {boolean} display_total
     * @returns {string}
     */
    _regex_highlight: function(input, regex, display_total) {
        var output = "",
            m,
            hl = 1,
            i = 0,
            total = 0;
        
        while ((m = regex.exec(input))) {
            // Add up to match
            output += Utils.escape_html(input.slice(i, m.index));
            
            // Add match with highlighting
            output += "<span class='hl"+hl+"'>" + Utils.escape_html(m[0]) + "</span>";
            
            // Switch highlight
            hl = hl === 1 ? 2 : 1;
            
            i = regex.lastIndex;
            total++;
        }
        
        // Add all after final match
        output += Utils.escape_html(input.slice(i, input.length));
        
        if (display_total)
            output = "Total found: " + total + "\n\n" + output;

        return output;
    },
    
    
    /**
     * Creates a string listing the matches within a string.
     *
     * @private
     * @param {string} input
     * @param {RegExp} regex
     * @param {boolean} display_total
     * @param {boolean} matches - Display full match
     * @param {boolean} capture_groups - Display each of the capture groups separately
     * @returns {string}
     */
    _regex_list: function(input, regex, display_total, matches, capture_groups) {
        var output = "",
            total = 0,
            match;
            
        while ((match = regex.exec(input))) {
            total++;
            if (matches) {
                output += match[0] + "\n";
            }
            if (capture_groups) {
                for (var i = 1; i < match.length; i++) {
                    if (matches) {
                        output += "  Group " + i + ": ";
                    }
                    output += match[i] + "\n";
                }
            }
        }
        
        if (display_total)
            output = "Total found: " + total + "\n\n" + output;
            
        return output;
    },
    
};
