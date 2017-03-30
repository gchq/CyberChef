/* globals unescape */
import Utils from "../Utils.js";


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
const URL_ = {

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
    runTo: function(input, args) {
        var encodeAll = args[0];
        return encodeAll ? URL_._encodeAllChars(input) : encodeURI(input);
    },


    /**
     * URL Decode operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runFrom: function(input, args) {
        var data = input.replace(/\+/g, "%20");
        try {
            return decodeURIComponent(data);
        } catch (err) {
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
    runParse: function(input, args) {
        if (!document) {
            throw "This operation only works in a browser.";
        }

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
                var splitArgs = [], padding = 0;
                for (var i = 0; i < args_.length; i++) {
                    splitArgs.push(args_[i].split("="));
                    padding = (splitArgs[i][0].length > padding) ? splitArgs[i][0].length : padding;
                }
                for (i = 0; i < splitArgs.length; i++) {
                    output += "\t" + Utils.padRight(splitArgs[i][0], padding);
                    if (splitArgs[i].length > 1 && splitArgs[i][1].length)
                        output += " = " + splitArgs[i][1] + "\n";
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
    _encodeAllChars: function(str) {
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

export default URL_;
