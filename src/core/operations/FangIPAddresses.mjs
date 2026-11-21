/**
 * @author HarelKatz [github.com/HarelKatz]
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
        this.description = "Takes a defanged IPv4 or IPv6 address and 'Fangs' it, restoring it to a valid address. The inverse of <code>Defang IP Addresses</code>.<br><br>e.g. <code>192[.]168[.]1[.]1</code> becomes <code>192.168.1.1</code>.";
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

        if (dots) input = input.replace(/\[\.\]/g, ".");
        if (colons) input = input.replace(/\[:\]/g, ":");

        return input;
    }

}

export default FangIPAddresses;
