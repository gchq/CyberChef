/**
 * @author Matt C (matt@artemisbot.uk)
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { JSONPath } from "jsonpath-plus";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * JPath expression operation
 */
class JPathExpression extends Operation {
    /**
     * JPathExpression constructor
     */
    constructor() {
        super();

        this.name = "JPath expression";
        this.module = "Code";
        this.description =
            "Extract information from a JSON object with a JPath query.";
        this.infoURL = "http://goessner.net/articles/JsonPath/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Query",
                type: "string",
                value: "",
            },
            {
                name: "Result delimiter",
                type: "binaryShortString",
                value: "\\n",
            },
            {
                name: "Prevent eval",
                type: "boolean",
                value: true,
                description:
                    "Evaluated expressions are disabled by default for security reasons",
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [query, delimiter, preventEval] = args;
        let results, jsonObj;

        try {
            jsonObj = JSON.parse(input);
        } catch (err) {
            throw new OperationError(`Invalid input JSON: ${err.message}`);
        }

        try {
            results = JSONPath({
                path: query,
                json: jsonObj,
                preventEval: preventEval,
            });
        } catch (err) {
            throw new OperationError(
                `Invalid JPath expression: ${err.message}`,
            );
        }

        return results.map((result) => JSON.stringify(result)).join(delimiter);
    }
}

export default JPathExpression;
