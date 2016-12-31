/* globals unescape */

/**
 * URL operations.
 * Namespace is appended with an underscore to prevent overwriting the global URL object.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var URL_ = {

    /**
     * @constant
     * @default
     */
    ENCODE_ALL: false,
    
    /**
     * URL Encode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_to: function(input, args) {
        var encode_all = args[0];
        return encode_all ? URL_._encode_all_chars(input) : encodeURI(input);
    },
    
    
    /**
     * URL Decode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_from: function(input, args) {
        var data = input.replace(/\+/g, "%20");
        try {
            return decodeURIComponent(data);
        } catch(err) {
            return unescape(data);
        }
    },
    
    
    /**
     * Parse URI operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_parse: function(input, args) {
        var a = document.createElement("a");
        
        // Overwrite base href which will be the current CyberChef URL to reduce confusion.
        a.href = "http://example.com/";
        a.href = input;
        
        if (a.protocol) {
            var output = "";
            if (a.hostname !== window.location.hostname) {
                output = "Protocol:\t" + a.protocol + "\n";
                if (a.hostname) output += "Hostname:\t" + a.hostname + "\n";
                if (a.port) output += "Port:\t\t" + a.port + "\n";
            }
            
            if (a.pathname && a.pathname !== window.location.pathname) {
                var pathname = a.pathname;
                if (pathname.indexOf(window.location.pathname) === 0)
                    pathname = pathname.replace(window.location.pathname, "");
                if (pathname)
                    output += "Path name:\t" + pathname + "\n";
            }
            
            if (a.hash && a.hash !== window.location.hash) {
                output += "Hash:\t\t" + a.hash + "\n";
            }
            
            if (a.search && a.search !== window.location.search) {
                output += "Arguments:\n";
                var args_ = (a.search.slice(1, a.search.length)).split("&");
                var split_args = [], padding = 0;
                for (var i = 0; i < args_.length; i++) {
                    split_args.push(args_[i].split("="));
                    padding = (split_args[i][0].length > padding) ? split_args[i][0].length : padding;
                }
                for (i = 0; i < split_args.length; i++) {
                    output += "\t" + Utils.pad_right(split_args[i][0], padding);
                    if (split_args[i].length > 1 && split_args[i][1].length)
                        output += " = " + split_args[i][1] + "\n";
                    else output += "\n";
                }
            }
                    
            return output;
        }
        
        return "Invalid URI";
    },
    
    
    /**
     * URL encodes additional special characters beyond the standard set.
     *
     * @private
     * @param {string} str
     * @returns {string}
     */
    _encode_all_chars: function(str) {
        //TODO Do this programatically
        return encodeURIComponent(str)
            .replace(/!/g, "%21")
            .replace(/#/g, "%23")
            .replace(/'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/\*/g, "%2A")
            .replace(/\-/g, "%2D")
            .replace(/\./g, "%2E")
            .replace(/_/g, "%5F")
            .replace(/~/g, "%7E");
    },
    
};
