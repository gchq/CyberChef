/* globals unescape */
import Utils from "../Utils.js";
import url from "url";


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
        const encodeAll = args[0];
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
        const data = input.replace(/\+/g, "%20");
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
        const uri = url.parse(input, true);

        let output = "";

        if (uri.protocol) output += "Protocol:\t" + uri.protocol + "\n";
        if (uri.auth) output += "Auth:\t\t" + uri.auth + "\n";
        if (uri.hostname) output += "Hostname:\t" + uri.hostname + "\n";
        if (uri.port) output += "Port:\t\t" + uri.port + "\n";
        if (uri.pathname) output += "Path name:\t" + uri.pathname + "\n";
        if (uri.query) {
            let keys = Object.keys(uri.query),
                padding = 0;

            keys.forEach(k => {
                padding = (k.length > padding) ? k.length : padding;
            });

            output += "Arguments:\n";
            for (let key in uri.query) {
                output += "\t" + Utils.padRight(key, padding);
                if (uri.query[key].length) {
                    output += " = " + uri.query[key] + "\n";
                } else {
                    output += "\n";
                }
            }
        }
        if (uri.hash) output += "Hash:\t\t" + uri.hash + "\n";

        return output;
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
            .replace(/-/g, "%2D")
            .replace(/\./g, "%2E")
            .replace(/_/g, "%5F")
            .replace(/~/g, "%7E");
    },

};

export default URL_;
