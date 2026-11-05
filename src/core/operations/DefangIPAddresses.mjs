/**
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";


/**
 * Defang IP Addresses operation
 */
class DefangIPAddresses extends Operation {

    /**
     * DefangIPAddresses constructor
     */
    constructor() {
        super();

        this.name = "Defang IP Addresses";
        this.module = "Default";
        this.description = "Takes a IPv4 or IPv6 address and 'Defangs' it, meaning the IP becomes invalid, removing the risk of accidentally utilising it as an IP address.<br><br>When 'Last only' is enabled, only the final separator of each IP is replaced (e.g. <code>1.2.3.4</code> becomes <code>1.2.3[.]4</code>), keeping the address visually closer to its original form while still rendering it invalid.";
        this.infoURL = "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Last only",
                type: "boolean",
                value: false
            }
        ];
        this.checks = [
            {
                pattern: "^\\s*(([0-9]{1,3}\\.){3}[0-9]{1,3}|([0-9a-f]{4}:){7}[0-9a-f]{4})\\s*$",
                flags: "i",
                args: [],
                output: {
                    pattern: "^\\s*(([0-9]{1,3}\\[\\.\\]){3}[0-9]{1,3}|([0-9a-f]{4}\\[\\:\\]){7}[0-9a-f]{4})\\s*$",
                    flags: "i"
                }
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [lastOnly] = args;

        input = input.replace(IPV4_REGEX, x => {
            return defangSeparators(x, ".", "[.]", lastOnly);
        });

        input = input.replace(IPV6_REGEX, x => {
            return defangSeparators(x, ":", "[:]", lastOnly);
        });

        return input;
    }
}

export default DefangIPAddresses;


/**
 * Replaces a separator character with a defanged token.
 * If lastOnly is true, only the final occurrence is replaced.
 *
 * @param {string} match
 * @param {string} sep
 * @param {string} token
 * @param {boolean} lastOnly
 * @returns {string}
 */
function defangSeparators(match, sep, token, lastOnly) {
    if (!lastOnly) {
        return match.split(sep).join(token);
    }
    const idx = match.lastIndexOf(sep);
    if (idx === -1) return match;
    return match.slice(0, idx) + token + match.slice(idx + sep.length);
}


/**
 * IPV4 regular expression
 */
const IPV4_REGEX = new RegExp("(?:(?:\\d|[01]?\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d|\\d)(?:\\/\\d{1,2})?", "g");


/**
 * IPV6 regular expression
 */
const IPV6_REGEX = new RegExp("((?=.*::)(?!.*::.+::)(::)?([\\dA-Fa-f]{1,4}:(:|\\b)|){5}|([\\dA-Fa-f]{1,4}:){6})((([\\dA-Fa-f]{1,4}((?!\\3)::|:\\b|(?![\\dA-Fa-f])))|(?!\\2\\3)){2}|(((2[0-4]|1\\d|[1-9])?\\d|25[0-5])\\.?\\b){4})", "g");
