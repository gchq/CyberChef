/* globals xpath */

/**
 * Identifier extraction operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Extract = {

    /**
     * Runs search operations across the input data using regular expressions.
     *
     * @private
     * @param {string} input
     * @param {RegExp} search_regex
     * @param {RegExp} remove_regex - A regular expression defining results to remove from the
     *      final list
     * @param {boolean} include_total - Whether or not to include the total number of results
     * @returns {string}
     */
    _search: function(input, search_regex, remove_regex, include_total) {
        var output = "",
            total = 0,
            match;
            
        while ((match = search_regex.exec(input))) {
            if (remove_regex && remove_regex.test(match[0]))
                continue;
            total++;
            output += match[0] + "\n";
        }
        
        if (include_total)
            output = "Total found: " + total + "\n\n" + output;
            
        return output;
    },


    /**
     * @constant
     * @default
     */
    MIN_STRING_LEN: 3,
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
    run_strings: function(input, args) {
        var min_len = args[0] || Extract.MIN_STRING_LEN,
            display_total = args[1],
            strings = "[A-Z\\d/\\-:.,_$%'\"()<>= !\\[\\]{}@]",
            regex = new RegExp(strings + "{" + min_len + ",}", "ig");
            
        return Extract._search(input, regex, null, display_total);
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
    run_ip: function(input, args) {
        var include_ipv4  = args[0],
            include_ipv6  = args[1],
            remove_local  = args[2],
            display_total = args[3],
            ipv4 = "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
            ipv6 = "((?=.*::)(?!.*::.+::)(::)?([\\dA-F]{1,4}:(:|\\b)|){5}|([\\dA-F]{1,4}:){6})((([\\dA-F]{1,4}((?!\\3)::|:\\b|(?![\\dA-F])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})",
            ips  = "";
        
        if (include_ipv4 && include_ipv6) {
            ips = ipv4 + "|" + ipv6;
        } else if (include_ipv4) {
            ips = ipv4;
        } else if (include_ipv6) {
            ips = ipv6;
        }
        
        if (ips) {
            var regex = new RegExp(ips, "ig");
            
            if (remove_local) {
                var ten = "10\\..+",
                    oneninetwo = "192\\.168\\..+",
                    oneseventwo = "172\\.(?:1[6-9]|2\\d|3[01])\\..+",
                    onetwoseven = "127\\..+",
                    remove_regex = new RegExp("^(?:" + ten + "|" + oneninetwo +
                        "|" + oneseventwo + "|" + onetwoseven + ")");
                        
                return Extract._search(input, regex, remove_regex, display_total);
            } else {
                return Extract._search(input, regex, null, display_total);
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
    run_email: function(input, args) {
        var display_total = args[0],
            regex = /\w[-.\w]*@[-\w]+(?:\.[-\w]+)*\.[A-Z]{2,4}/ig;
            
        return Extract._search(input, regex, null, display_total);
    },
    
    
    /**
     * Extract MAC addresses operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_mac: function(input, args) {
        var display_total = args[0],
            regex = /[A-F\d]{2}(?:[:-][A-F\d]{2}){5}/ig;
            
        return Extract._search(input, regex, null, display_total);
    },
    
    
    /**
     * Extract URLs operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_urls: function(input, args) {
        var display_total = args[0],
            protocol = "[A-Z]+://",
            hostname = "[-\\w]+(?:\\.\\w[-\\w]*)+",
            port = ":\\d+",
            path = "/[^.!,?;\"'<>()\\[\\]{}\\s\\x7F-\\xFF]*";
            
        path += "(?:[.!,?]+[^.!,?;\"'<>()\\[\\]{}\\s\\x7F-\\xFF]+)*";
        var regex = new RegExp(protocol + hostname + "(?:" + port +
            ")?(?:" + path + ")?", "ig");
        return Extract._search(input, regex, null, display_total);
    },
    
    
    /**
     * Extract domains operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_domains: function(input, args) {
        var display_total = args[0],
            protocol = "https?://",
            hostname = "[-\\w\\.]+",
            tld = "\\.(?:com|net|org|biz|info|co|uk|onion|int|mobi|name|edu|gov|mil|eu|ac|ae|af|de|ca|ch|cn|cy|es|gb|hk|il|in|io|tv|me|nl|no|nz|ro|ru|tr|us|az|ir|kz|uz|pk)+",
            regex = new RegExp("(?:" + protocol + ")?" + hostname + tld, "ig");
        
        return Extract._search(input, regex, null, display_total);
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
    run_file_paths: function(input, args) {
        var include_win_path = args[0],
            include_unix_path = args[1],
            display_total = args[2],
            win_drive = "[A-Z]:\\\\",
            win_name = "[A-Z\\d][A-Z\\d\\- '_\\(\\)]{0,61}",
            win_ext = "[A-Z\\d]{1,6}",
            win_path = win_drive + "(?:" + win_name + "\\\\?)*" + win_name +
                "(?:\\." + win_ext + ")?",
            unix_path = "(?:/[A-Z\\d.][A-Z\\d\\-.]{0,61})+",
            file_paths = "";
        
        if (include_win_path && include_unix_path) {
            file_paths = win_path + "|" + unix_path;
        } else if (include_win_path) {
            file_paths = win_path;
        } else if (include_unix_path) {
            file_paths = unix_path;
        }
        
        if (file_paths) {
            var regex = new RegExp(file_paths, "ig");
            return Extract._search(input, regex, null, display_total);
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
    run_dates: function(input, args) {
        var display_total = args[0],
            date1 = "(?:19|20)\\d\\d[- /.](?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])", // yyyy-mm-dd
            date2 = "(?:0[1-9]|[12][0-9]|3[01])[- /.](?:0[1-9]|1[012])[- /.](?:19|20)\\d\\d", // dd/mm/yyyy
            date3 = "(?:0[1-9]|1[012])[- /.](?:0[1-9]|[12][0-9]|3[01])[- /.](?:19|20)\\d\\d", // mm/dd/yyyy
            regex = new RegExp(date1 + "|" + date2 + "|" + date3, "ig");
            
        return Extract._search(input, regex, null, display_total);
    },
    
    
    /**
     * Extract all identifiers operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_all_idents: function(input, args) {
        var output = "";
        output += "IP addresses\n";
        output += Extract.run_ip(input, [true, true, false]);
        
        output += "\nEmail addresses\n";
        output += Extract.run_email(input, []);
        
        output += "\nMAC addresses\n";
        output += Extract.run_mac(input, []);
        
        output += "\nURLs\n";
        output += Extract.run_urls(input, []);
        
        output += "\nDomain names\n";
        output += Extract.run_domains(input, []);
        
        output += "\nFile paths\n";
        output += Extract.run_file_paths(input, [true, true]);
        
        output += "\nDates\n";
        output += Extract.run_dates(input, []);
        return output;
    },

    /**
     * @constant
     * @default
     */
    XPATH_INITIAL: "",

    /**
     * @constant
     * @default
     */
    XPATH_DELIMITER: "\\n",

    /**
     * Extract information (from an xml document) with an XPath query
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_xpath:function(input, args) {
        const query = args[0];
        const delimiter = args[1];

        var xml;
        try {
            xml = $.parseXML(input);
        } catch (err) {
            return "Invalid input XML.";
        }

        var result;
        try {
            result = xpath.evaluate(xml, query);
        } catch (err) {
            return "Invalid XPath. Details:\n" + err.message;
        }

        const serializer = new XMLSerializer();
        const nodeToString = function(node) {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE: return serializer.serializeToString(node);
                case Node.ATTRIBUTE_NODE: return node.value;
                case Node.COMMENT_NODE: return node.data;
                case Node.DOCUMENT_NODE: return serializer.serializeToString(node);
                default: throw new Error("Unknown Node Type: " + node.nodeType);
            }
        };

        return Object.values(result).slice(0, -1) // all values except last (length)
            .map(nodeToString)
            .join(delimiter);
    },


    /**
     * @constant
     * @default
     */
    SELECTOR_INITIAL: "",
    /**
     * @constant
     * @default
     */
    CSS_QUERY_DELIMITER: "\\n",

    /**
     * Extract information (from an hmtl document) with an css selector
     *
     * @author Mikescher (https://github.com/Mikescher | https://mikescher.com)
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_css_query: function(input, args) {
        const query = args[0];
        const delimiter = args[1];

        var html;
        try {
            html = $.parseHTML(input);
        } catch (err) {
            return "Invalid input HTML.";
        }

        var result;
        try {
            result = $(html).find(query);
        } catch (err) {
            return "Invalid CSS Selector. Details:\n" + err.message;
        }

        const nodeToString = function(node) {
            switch (node.nodeType) {
                case Node.ELEMENT_NODE: return node.outerHTML;
                case Node.ATTRIBUTE_NODE: return node.value;
                case Node.COMMENT_NODE: return node.data;
                case Node.TEXT_NODE: return node.wholeText;
                case Node.DOCUMENT_NODE: return node.outerHTML;
                default: throw new Error("Unknown Node Type: " + node.nodeType);
            }
        };

        return Array.apply(null, Array(result.length))
            .map(function(_, i) {
                return result[i];
            })
            .map(nodeToString)
            .join(delimiter);
    },

};
