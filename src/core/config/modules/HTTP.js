import HTTP from "../../operations/HTTP.js";


/**
 * HTTP module.
 *
 * Libraries:
 *  - UAS_parser
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.HTTP = {
    "HTTP request":       HTTP.runHTTPRequest,
    "Strip HTTP headers": HTTP.runStripHeaders,
    "Parse User Agent":   HTTP.runParseUserAgent,
};

export default OpModules;
