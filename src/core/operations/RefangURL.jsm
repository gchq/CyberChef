/**
 * @author Matt Kelly @breakersall
 * @copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * RefangURL operation
 */
class RefangURL extends Operation {

    /**
     * RefangURL constructor
     */
    constructor() {
        super();

        this.name = "Refang URL";
        this.module = "Default";
        this.description = "Takes a defanged Universal Resource Locator (URL) and 'Refangs' it, making the URL valid again.<br><br>This can be used to revert a URL that has been defanged once again allowing you to potentially click on a malicious link.<br><br>Use carefully and only with trusted links.<br><br>This is probably irresposible.";
		this.infoURL = "https://isc.sans.edu/forums/diary/Defang+all+the+things/22744/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Unescape dots",
                type: "boolean",
                value: true
            },
            {
                name: "Unescape http",
                type: "boolean",
                value: true
            },
            {
                name: "Unescape ://",
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
        const [dots, http, slashes] = args;

        if (dots) input = input.replace(/\[\.\]/g, ".");
        if (http) input = input.replace(/hxxp/gi, "http");
        if (slashes) input = input.replace(/\[:\/\/\]/g, "://");

        return input;
    }

}

export default RefangURL;
