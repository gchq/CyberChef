/**
 * @author zhzy0077 [zhzy0077@hotmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import * as jq from "jq-wasm";

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
            },
            {
                name: "Raw",
                type: "boolean",
                value: false
            },
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return (async () => {
            const [query, raw] = args;
            if (raw) {
                const result = await jq.raw(input, query, ["-r"]);
                if (result.stderr !== "") {
                    throw new OperationError(`Invalid jq expression: ${result.stderr}`);
                }
                return result.stdout;
            } else {
                try {
                    const result = await jq.json(input, query);
                    return JSON.stringify(result);
                } catch (err) {
                    throw new OperationError(`Invalid jq expression: ${err.message}`);
                }
            }
        })();
    }

}

export default Jq;
