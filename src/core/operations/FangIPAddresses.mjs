/**
 * @author Collin Laney [collin.laney@coldogstudios.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Fang IP Addresses operation
 */
class FangIPAddresses extends Operation {

    /**
     * FangIPAddresses constructor
     */
    constructor() {
        super();

        this.name = "Fang IP Addresses";
        this.module = "Default";
        this.description = "Takes 'Defanged' IPv4 or IPv6 addresses and 'Fangs' them, restoring the alterations that made them invalid.";
        this.infoURL = "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Restore [.]",
                type: "boolean",
                value: true
            },
            {
                name: "Restore [:]",
                type: "boolean",
                value: true
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [dots, colons] = args;

        input = input.replace(DEFANGED_IPV4_REGEX, x => {
            return dots ? x.replace(/\[\.\]/g, ".") : x;
        });

        input = input.replace(DEFANGED_IPV6_REGEX, x => {
            return colons ? x.replace(/\[:\]/g, ":") : x;
        });

        return input;
    }
}

export default FangIPAddresses;


/**
 * Defanged IPv4 regular expression
 */
const DEFANGED_IPV4_REGEX = new RegExp("(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\[\\.\\]){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?", "g");


/**
 * Defanged IPv6 regular expression
 */
const DEFANGED_IPV6_REGEX = new RegExp("(?:[\\dA-Fa-f]{0,4}\\[:\\]){2,7}[\\dA-Fa-f]{0,4}(?:\\/\\d{1,3})?", "g");
