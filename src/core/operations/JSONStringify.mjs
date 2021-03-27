/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * JSON Stringify operation
 */
class JSONStringify extends Operation {

    /**
     * JSONStringify constructor
     */
    constructor() {
        super();

        this.name = "JSON Stringify";
        this.module = "Default";
        this.description = "The JSON.stringify() method converts a JavaScript object or value to a JSON string.";
        this.infoURL = "https://w3schools.com/js/js_json_stringify.asp";
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
        let result;
        try {
            result = JSON.parse(input);
        } catch (err) {
            throw new OperationError(err);
        }
        return JSON.stringify(result);
    }

}

export default JSONStringify;
