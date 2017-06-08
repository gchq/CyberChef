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
     * HTTP request operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHTTPRequest(input, args) {
        const method = args[0],
            url = args[1],
            headersText = args[2],
            ignoreStatusCode = args[3];

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
            method,
            headers,
            mode: "cors",
            cache: "no-cache",
        };

        if (method !== "GET" && method !== "HEAD") {
            config.body = input;
        }

        return fetch(url, config)
        .then(r => {
            if (ignoreStatusCode || r.status === 200) {
                return r.text();
            } else {
                throw `HTTP response code was ${r.status}.`;
            }
        });
    },

};

export default HTTP;
