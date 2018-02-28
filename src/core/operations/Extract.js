import XRegExp from "xregexp";


/**
 * Identifier extraction operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Extract = {

    /**
     * Runs search operations across the input data using regular expressions.
     *
     * @private
     * @param {string} input
     * @param {RegExp} searchRegex
     * @param {RegExp} removeRegex - A regular expression defining results to remove from the
     *      final list
     * @param {boolean} includeTotal - Whether or not to include the total number of results
     * @returns {string}
     */
    _search: function(input, searchRegex, removeRegex, includeTotal) {
        let output = "",
            total = 0,
            match;

        while ((match = searchRegex.exec(input))) {
            // Moves pointer when an empty string is matched (prevents infinite loop)
            if (match.index === searchRegex.lastIndex) {
                searchRegex.lastIndex++;
            }

            if (removeRegex && removeRegex.test(match[0]))
                continue;
            total++;
            output += match[0] + "\n";
        }

        if (includeTotal)
            output = "Total found: " + total + "\n\n" + output;

        return output;
    },


    /**
     * @constant
     * @default
     */
    MIN_STRING_LEN: 4,
    /**
     * @constant
     * @default
     */
    STRING_MATCH_TYPE: [
        "[ASCII]", "Alphanumeric + punctuation (A)", "All printable chars (A)", "Null-terminated strings (A)",
        "[Unicode]", "Alphanumeric + punctuation (U)", "All printable chars (U)", "Null-terminated strings (U)"
    ],
    /**
     * @constant
     * @default
     */
    ENCODING_LIST: ["Single byte", "16-bit littleendian", "16-bit bigendian", "All"],
    /**
     * @constant
     * @default
     */
    DISPLAY_TOTAL: false,

    /**
     * Strings operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runStrings: function(input, args) {
        const encoding = args[0],
            minLen = args[1],
            matchType = args[2],
            displayTotal = args[3],
            alphanumeric = "A-Z\\d",
            punctuation = "/\\-:.,_$%'\"()<>= !\\[\\]{}@",
            printable = "\x20-\x7e",
            uniAlphanumeric = "\\pL\\pN",
            uniPunctuation = "\\pP\\pZ",
            uniPrintable = "\\pL\\pM\\pZ\\pS\\pN\\pP";

        let strings = "";

        switch (matchType) {
            case "Alphanumeric + punctuation (A)":
                strings = `[${alphanumeric + punctuation}]`;
                break;
            case "All printable chars (A)":
            case "Null-terminated strings (A)":
                strings = `[${printable}]`;
                break;
            case "Alphanumeric + punctuation (U)":
                strings = `[${uniAlphanumeric + uniPunctuation}]`;
                break;
            case "All printable chars (U)":
            case "Null-terminated strings (U)":
                strings = `[${uniPrintable}]`;
                break;
        }

        // UTF-16 support is hacked in by allowing null bytes on either side of the matched chars
        switch (encoding) {
            case "All":
                strings = `(\x00?${strings}\x00?)`;
                break;
            case "16-bit littleendian":
                strings = `(${strings}\x00)`;
                break;
            case "16-bit bigendian":
                strings = `(\x00${strings})`;
                break;
            case "Single byte":
            default:
                break;
        }

        strings = `${strings}{${minLen},}`;

        if (matchType.includes("Null-terminated")) {
            strings += "\x00";
        }

        const regex = new XRegExp(strings, "ig");

        return Extract._search(input, regex, null, displayTotal);
    },


    /**
     * @constant
     * @default
     */
    INCLUDE_IPV4: true,
    /**
     * @constant
     * @default
     */
    INCLUDE_IPV6: false,
    /**
     * @constant
     * @default
     */
    REMOVE_LOCAL: false,

    /**
     * Extract IP addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runIp: function(input, args) {
        let includeIpv4  = args[0],
            includeIpv6  = args[1],
            removeLocal  = args[2],
            displayTotal = args[3],
            ipv4 = "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
            ipv6 = "((?=.*::)(?!.*::.+::)(::)?([\\dA-F]{1,4}:(:|\\b)|){5}|([\\dA-F]{1,4}:){6})((([\\dA-F]{1,4}((?!\\3)::|:\\b|(?![\\dA-F])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})",
            ips  = "";

        if (includeIpv4 && includeIpv6) {
            ips = ipv4 + "|" + ipv6;
        } else if (includeIpv4) {
            ips = ipv4;
        } else if (includeIpv6) {
            ips = ipv6;
        }

        if (ips) {
            const regex = new RegExp(ips, "ig");

            if (removeLocal) {
                let ten = "10\\..+",
                    oneninetwo = "192\\.168\\..+",
                    oneseventwo = "172\\.(?:1[6-9]|2\\d|3[01])\\..+",
                    onetwoseven = "127\\..+",
                    removeRegex = new RegExp("^(?:" + ten + "|" + oneninetwo +
                        "|" + oneseventwo + "|" + onetwoseven + ")");

                return Extract._search(input, regex, removeRegex, displayTotal);
            } else {
                return Extract._search(input, regex, null, displayTotal);
            }
        } else {
            return "";
        }
    },


    /**
     * Extract email addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEmail: function(input, args) {
        let displayTotal = args[0],
            regex = /\b\w[-.\w]*@[-\w]+(?:\.[-\w]+)*\.[A-Z]{2,4}\b/ig;

        return Extract._search(input, regex, null, displayTotal);
    },


    /**
     * Extract MAC addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMac: function(input, args) {
        let displayTotal = args[0],
            regex = /[A-F\d]{2}(?:[:-][A-F\d]{2}){5}/ig;

        return Extract._search(input, regex, null, displayTotal);
    },


    /**
     * Extract URLs operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runUrls: function(input, args) {
        let displayTotal = args[0],
            protocol = "[A-Z]+://",
            hostname = "[-\\w]+(?:\\.\\w[-\\w]*)+",
            port = ":\\d+",
            path = "/[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]*";

        path += "(?:[.!,?]+[^.!,?\"<>\\[\\]{}\\s\\x7F-\\xFF]+)*";
        const regex = new RegExp(protocol + hostname + "(?:" + port +
            ")?(?:" + path + ")?", "ig");
        return Extract._search(input, regex, null, displayTotal);
    },


    /**
     * Extract domains operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDomains: function(input, args) {
        const displayTotal = args[0],
            regex = /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/ig;

        return Extract._search(input, regex, null, displayTotal);
    },


    /**
     * @constant
     * @default
     */
    INCLUDE_WIN_PATH: true,
    /**
     * @constant
     * @default
     */
    INCLUDE_UNIX_PATH: true,

    /**
     * Extract file paths operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFilePaths: function(input, args) {
        let includeWinPath = args[0],
            includeUnixPath = args[1],
            displayTotal = args[2],
            winDrive = "[A-Z]:\\\\",
            winName = "[A-Z\\d][A-Z\\d\\- '_\\(\\)~]{0,61}",
            winExt = "[A-Z\\d]{1,6}",
            winPath = winDrive + "(?:" + winName + "\\\\?)*" + winName +
                "(?:\\." + winExt + ")?",
            unixPath = "(?:/[A-Z\\d.][A-Z\\d\\-.]{0,61})+",
            filePaths = "";

        if (includeWinPath && includeUnixPath) {
            filePaths = winPath + "|" + unixPath;
        } else if (includeWinPath) {
            filePaths = winPath;
        } else if (includeUnixPath) {
            filePaths = unixPath;
        }

        if (filePaths) {
            const regex = new RegExp(filePaths, "ig");
            return Extract._search(input, regex, null, displayTotal);
        } else {
            return "";
        }
    },


    /**
     * Extract dates operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDates: function(input, args) {
        let displayTotal = args[0],
            date1 = "(?:19|20)\\d\\d[- /.](?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])", // yyyy-mm-dd
            date2 = "(?:0[1-9]|[12][0-9]|3[01])[- /.](?:0[1-9]|1[012])[- /.](?:19|20)\\d\\d", // dd/mm/yyyy
            date3 = "(?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])[- /.](?:19|20)\\d\\d", // mm/dd/yyyy
            regex = new RegExp(date1 + "|" + date2 + "|" + date3, "ig");

        return Extract._search(input, regex, null, displayTotal);
    },

};

export default Extract;
