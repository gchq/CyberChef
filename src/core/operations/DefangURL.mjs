/**
 * @author arnydo [arnydo@protonmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";

/**
 * DefangURL operation
 */
class DefangURL extends Operation {

    /**
     * DefangURL constructor
     */
    constructor() {
        super();

        this.name = "Defang URL";
        this.module = "URL";
        this.description = "Takes a Universal Resource Locator (URL) and 'Defangs' it; meaning, the URL becomes invalid and neutralizes the risk of accidentally clicking on a malicious link.<br><br>This is often used when dealing with malicious links or IOCs.<br><br>Works well when combined with the 'Extract URLs' operation.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let defang = input.replace(/http/gi, "hxxp");
        defang = defang.replace(/\./g, "[.]");
        defang = defang.replace(/:\/\//g, "[://]");
        return defang;
    }

}

export default DefangURL;
