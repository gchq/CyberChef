/**
 * @author arnydo [github@arnydo.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * FangURL operation
 */
class FangURL extends Operation {

    /**
     * FangURL constructor
     */
    constructor() {
        super();

        this.name = "Fang URL";
        this.module = "Default";
        this.description = "Takes a 'Defanged' Universal Resource Locator (URL) and 'Fangs' it. Meaning, it removes the alterations (defanged) that render it useless so that it can be used again.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Restore [.]",
                type: "boolean",
                value: true
            },
            {
                name: "Restore hxxp",
                type: "boolean",
                value: true
            },
            {
                name: "Restore ://",
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

        input = fangURL(input, dots, http, slashes);

        return input;
    }

}


/**
 * Defangs a given URL
 *
 * @param {string} url
 * @param {boolean} dots
 * @param {boolean} http
 * @param {boolean} slashes
 * @returns {string}
 */
function fangURL(url, dots, http, slashes) {
    if (dots) url = url.replace(/\[\.\]/g, ".");
    if (http) url = url.replace(/hxxp/g, "http");
    if (slashes) url = url.replace(/\[:\/\/\]/g, "://");

    return url;
}

export default FangURL;
