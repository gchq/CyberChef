/**
 * @author zhzy0077 [zhzy0077@hotmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import jq from "jq-web";

/**
 * jq operation
 */
class Jq extends Operation {

    /**
     * Jq constructor
     */
    constructor() {
        super();

        this.name = "Jq";
        this.module = "Jq";
        this.description = "jq is a lightweight and flexible command-line JSON processor.";
        this.infoURL = "https://github.com/jqlang/jq";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [
            {
                name: "Query",
                type: "string",
                value: ""
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [query] = args;
        let result;

        try {
            result = jq.json(input, query);
        } catch (err) {
            throw new OperationError(`Invalid jq expression: ${err.message}`);
        }

        return JSON.stringify(result);
    }

}

export default Jq;
