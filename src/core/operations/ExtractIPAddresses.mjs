/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import { search } from "../lib/Extract";

/**
 * Extract IP addresses operation
 */
class ExtractIPAddresses extends Operation {

    /**
     * ExtractIPAddresses constructor
     */
    constructor() {
        super();

        this.name = "Extract IP addresses";
        this.module = "Regex";
        this.description = "Extracts all IPv4 and IPv6 addresses.<br><br>Warning: Given a string <code>710.65.0.456</code>, this will match <code>10.65.0.45</code> so always check the original input!";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "IPv4",
                "type": "boolean",
                "value": true
            },
            {
                "name": "IPv6",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Remove local IPv4 addresses",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Display total",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [includeIpv4, includeIpv6, removeLocal, displayTotal] = args,
            ipv4 = "(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?",
            ipv6 = "((?=.*::)(?!.*::.+::)(::)?([\\dA-F]{1,4}:(:|\\b)|){5}|([\\dA-F]{1,4}:){6})((([\\dA-F]{1,4}((?!\\3)::|:\\b|(?![\\dA-F])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})";
        let ips  = "";

        if (includeIpv4 && includeIpv6) {
            ips = ipv4 + "|" + ipv6;
        } else if (includeIpv4) {
            ips = ipv4;
        } else if (includeIpv6) {
            ips = ipv6;
        }

        if (ips) {
            const regex = new RegExp(ips, "ig");

            if (removeLocal) {
                const ten = "10\\..+",
                    oneninetwo = "192\\.168\\..+",
                    oneseventwo = "172\\.(?:1[6-9]|2\\d|3[01])\\..+",
                    onetwoseven = "127\\..+",
                    removeRegex = new RegExp("^(?:" + ten + "|" + oneninetwo +
                        "|" + oneseventwo + "|" + onetwoseven + ")");

                return search(input, regex, removeRegex, displayTotal);
            } else {
                return search(input, regex, null, displayTotal);
            }
        } else {
            return "";
        }
    }

}

export default ExtractIPAddresses;
