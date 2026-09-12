/**
 * @author Collin Laney [collin.laney@coldogstudios.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Fang email addresses operation
 */
class FangEmailAddresses extends Operation {

    /**
     * FangEmailAddresses constructor
     */
    constructor() {
        super();

        this.name = "Fang email addresses";
        this.module = "Default";
        this.description = "Takes 'Defanged' email addresses and 'Fangs' them, restoring the alterations that made them invalid.";
        this.infoURL = "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Restore [@] and [at]",
                type: "boolean",
                value: true
            },
            {
                name: "Restore [.]",
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
        const [at, dots] = args;

        return fangEmailAddress(input, at, dots);
    }
}


/**
 * Fangs a given email address
 *
 * @param {string} email
 * @param {boolean} at
 * @param {boolean} dots
 * @returns {string}
 */
function fangEmailAddress(email, at, dots) {
    if (at) email = email.replace(/\[@\]|\[at\]/gi, "@");
    if (dots) email = email.replace(/\[\.\]/g, ".");

    return email;
}

export default FangEmailAddresses;
