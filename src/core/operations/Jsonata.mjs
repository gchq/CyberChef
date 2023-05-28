/**
 * @author Jon K (jon@ajarsoftware.com)
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import jsonata from "jsonata";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Jsonata Query operation
 */
class JsonataQuery extends Operation {
    /**
     * JsonataQuery constructor
     */
    constructor() {
        super();

        this.name = "Jsonata Query";
        this.module = "Code";
        this.description =
            "Query and transform JSON data with a jsonata query.";
        this.infoURL = "https://docs.jsonata.org/overview.html";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Query",
                type: "text",
                value: "string",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    async run(input, args) {
        const [query] = args;
        let result, jsonObj;

        try {
            jsonObj = JSON.parse(input);
        } catch (err) {
            throw new OperationError(`Invalid input JSON: ${err.message}`);
        }

        try {
            const expression = jsonata(query);
            result = await expression.evaluate(jsonObj);
        } catch (err) {
            throw new OperationError(
                `Invalid Jsonata Expression: ${err.message}`
            );
        }

        return JSON.stringify(result);
    }
}

export default JsonataQuery;
