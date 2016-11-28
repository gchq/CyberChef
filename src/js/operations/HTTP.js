/* globals UAS_parser */

/**
 * HTTP operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var HTTP = {
    
    /**
     * Strip HTTP headers operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_strip_headers: function(input, args) {
        var header_end = input.indexOf("\r\n\r\n") +
            (header_end < 0) ? input.indexOf("\n\n") + 2 : header_end + 4;
            
        return (header_end < 2) ? input : input.slice(header_end, input.length);
    },
    
    
    /**
     * Parse User Agent operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_parse_user_agent: function(input, args) {
        var ua = UAS_parser.parse(input);
        
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

};
