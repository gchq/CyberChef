/**
 * @author Collin Laney [collin.laney@coldogstudios.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {EMAIL_REGEX} from "../lib/Extract.mjs";

/**
 * Defang email addresses operation
 */
class DefangEmailAddresses extends Operation {

    /**
     * DefangEmailAddresses constructor
     */
    constructor() {
        super();

        this.name = "Defang email addresses";
        this.module = "Default";
        this.description = "Takes email addresses and 'Defangs' them, meaning the addresses become invalid, removing the risk of accidentally using them as email links or indicators.";
        this.infoURL = "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Escape @",
                type: "boolean",
                value: true
            },
            {
                name: "Escape dots",
                type: "boolean",
                value: true
            },
            {
                name: "Process",
                type: "option",
                value: ["Valid email addresses", "Everything"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [at, dots, process] = args;

        switch (process) {
            case "Valid email addresses":
                input = input.replace(EMAIL_REGEX, x => {
                    return defangEmailAddress(x, at, dots);
                });
                break;
            case "Everything":
                input = defangEmailAddress(input, at, dots);
                break;
        }

        return input;
    }
}


/**
 * Defangs a given email address
 *
 * @param {string} email
 * @param {boolean} at
 * @param {boolean} dots
 * @returns {string}
 */
function defangEmailAddress(email, at, dots) {
    if (at) email = email.replace(/@/g, "[@]");
    if (dots) email = email.replace(/\./g, "[.]");

    return email;
}

export default DefangEmailAddresses;
