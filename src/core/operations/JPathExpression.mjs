/**
 * @author Matt C (matt@artemisbot.uk)
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import jpath from "jsonpath";
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
        this.description = "Extract information from a JSON object with a JPath query.";
        this.infoURL = "http://goessner.net/articles/JsonPath/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Query",
                "type": "string",
                "value": ""
            },
            {
                "name": "Result delimiter",
                "type": "binaryShortString",
                "value": "\\n"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [query, delimiter] = args;
        let results,
            obj;

        // Split the string by literal quotes
        const quoteSplit = query.split(/(?<=[^\\])"/);
        for (let i = 0; i < quoteSplit.length; i++) {
            // Only check the text that isn't surrounded by quotes.
            if (i % 2 === 0 && quoteSplit[i].match(/\[\??\(/))
                throw new OperationError("Query contains unsafe expression.");
        }

        try {
            obj = JSON.parse(input);
        } catch (err) {
            throw new OperationError(`Invalid input JSON: ${err.message}`);
        }

        try {
            results = jpath.query(obj, query);
        } catch (err) {
            throw new OperationError(`Invalid JPath expression: ${err.message}`);
        }

        return results.map(result => JSON.stringify(result)).join(delimiter);
    }

}

export default JPathExpression;
