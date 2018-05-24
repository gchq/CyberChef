import UAParser from "ua-parser-js";


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
     * Dechunk response operation
     *
     * @param {string} input
     * @param {Object[]} args}
     * @returns {string}
    */
    runDechunk: function(input, args) {
        let chunks = [];
        let chunkSizeEnd = input.indexOf("\n") + 1;
        let lineEndings = input.charAt(chunkSizeEnd - 2) === "\r" ? "\r\n" : "\n";
        let lineEndingsLength = lineEndings.length;
        let chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
        while (!isNaN(chunkSize)) {
            chunks.push(input.slice(chunkSizeEnd, chunkSize + chunkSizeEnd)); 
            input = input.slice(chunkSizeEnd + chunkSize + lineEndingsLength);
            chunkSizeEnd = input.indexOf(lineEndings) + lineEndingsLength;
            chunkSize = parseInt(input.slice(0, chunkSizeEnd), 16);
        }
        return chunks.join("") + input;
    },

    /**
     * Parse User Agent operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runParseUserAgent: function(input, args) {
        const ua = UAParser(input);
        return `Browser
    Name: ${ua.browser.name || "unknown"}
    Version: ${ua.browser.version || "unknown"}
Device
    Model: ${ua.device.model || "unknown"}
    Type: ${ua.device.type || "unknown"}
    Vendor: ${ua.device.vendor || "unknown"}
Engine
    Name: ${ua.engine.name || "unknown"}
    Version: ${ua.engine.version || "unknown"}
OS
    Name: ${ua.os.name || "unknown"}
    Version: ${ua.os.version || "unknown"}
CPU
    Architecture: ${ua.cpu.architecture || "unknown"}`;
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
                if (r.status === 0 && r.type === "opaque") {
                    return "Error: Null response. Try setting the connection mode to CORS.";
                }

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
                    " - Making a request to an insecure resource (HTTP) from a secure source (HTTPS)\n" +
                    " - Making a cross-origin request to a server which does not support CORS\n";
            });
    },

};

export default HTTP;
