import {UAS_parser as UAParser} from "../lib/uas_parser.js";


/**
 * HTTP operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const HTTP = {

    /**
     * @constant
     * @default
     */
    METHODS: [
        "GET", "POST", "HEAD",
        "PUT", "PATCH", "DELETE",
        "CONNECT", "TRACE", "OPTIONS"
    ],


    /**
     * Strip HTTP headers operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runStripHeaders: function(input, args) {
        let headerEnd = input.indexOf("\r\n\r\n");
        headerEnd = (headerEnd < 0) ? input.indexOf("\n\n") + 2 : headerEnd + 4;

        return (headerEnd < 2) ? input : input.slice(headerEnd, input.length);
    },


    /**
     * Parse User Agent operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseUserAgent: function(input, args) {
        const ua = UAParser.parse(input);

        return "Type: " + ua.type + "\n" +
            "Family: " + ua.uaFamily + "\n" +
            "Name: " + ua.uaName + "\n" +
            "URL: " + ua.uaUrl + "\n" +
            "Company: " + ua.uaCompany + "\n" +
            "Company URL: " + ua.uaCompanyUrl + "\n\n" +
            "OS Family: " + ua.osFamily + "\n" +
            "OS Name: " + ua.osName + "\n" +
            "OS URL: " + ua.osUrl + "\n" +
            "OS Company: " + ua.osCompany + "\n" +
            "OS Company URL: " + ua.osCompanyUrl + "\n" +
            "Device Type: " + ua.deviceType + "\n";
    },


    /**
     * @constant
     * @default
     */
    MODE: [
        "Cross-Origin Resource Sharing",
        "No CORS (limited to HEAD, GET or POST)",
    ],

    /**
     * Lookup table for HTTP modes
     *
     * @private
     * @constant
     */
    _modeLookup: {
        "Cross-Origin Resource Sharing": "cors",
        "No CORS (limited to HEAD, GET or POST)": "no-cors",
    },

    /**
     * HTTP request operation.
     *
     * @author tlwr [toby@toby.codes]
     * @author n1474335 [n1474335@gmail.com]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHTTPRequest(input, args) {
        const method = args[0],
            url = args[1],
            headersText = args[2],
            mode = args[3],
            showResponseMetadata = args[4];

        if (url.length === 0) return "";

        let headers = new Headers();
        headersText.split(/\r?\n/).forEach(line => {
            line = line.trim();

            if (line.length === 0) return;

            let split = line.split(":");
            if (split.length !== 2) throw `Could not parse header in line: ${line}`;

            headers.set(split[0].trim(), split[1].trim());
        });

        let config = {
            method: method,
            headers: headers,
            mode: HTTP._modeLookup[mode],
            cache: "no-cache",
        };

        if (method !== "GET" && method !== "HEAD") {
            config.body = input;
        }

        return fetch(url, config)
        .then(r => {
            if (showResponseMetadata) {
                let headers = "";
                for (let pair of r.headers.entries()) {
                    headers += "    " + pair[0] + ": " + pair[1] + "\n";
                }
                return r.text().then(b => {
                    return "####\n  Status: " + r.status + " " + r.statusText +
                        "\n  Exposed headers:\n" + headers + "####\n\n" + b;
                });
            }
            return r.text();
        })
        .catch(e => {
            return e.toString() +
                "\n\nThis error could be caused by one of the following:\n" +
                " - An invalid URL\n" +
                " - Making a cross-origin request to a server which does not support CORS\n";
        });
    },

};

export default HTTP;
