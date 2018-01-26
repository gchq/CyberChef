import IP from "../../operations/IP.js";


/**
 * JSBN module.
 *
 * Libraries:
 *  - jsbn
 *  - ./Checksum.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.JSBN = {
    "Parse IP range":     IP.runParseIpRange,
    "Parse IPv6 address": IP.runParseIPv6,
    "Parse IPv4 header":  IP.runParseIPv4Header,
    "Change IP format":   IP.runChangeIpFormat,
    "Group IP addresses": IP.runGroupIps,
};

export default OpModules;
