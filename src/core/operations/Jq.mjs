/**
 * @author zhzy0077 [zhzy0077@hotmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import * as jq from "jq-wasm";
import * as jqjs from "@michaelhomer/jqjs";

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
                name: "Implementation",
                type: "option",
                value: ["WASM", "Native JS"]
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
            const query = args[0];
            const implementation = args[1].toLowerCase();

            switch (implementation) {
                case "wasm":
                    try {
                        const result = await jq.json(input, query);
                        return JSON.stringify(result);
                    } catch (err) {
                        throw new OperationError(`Invalid jq expression: ${err.message}`);
                    }
                case "native js":
                    let result = '';
                    let filter = jqjs.compile(query)
                    for (let i of filter(input)) {
                        if (typeof i == 'undefined') {
                            result += 'undefined (runtime error)\n'
                        } else {
                            result += jqjs.prettyPrint(i) + '\n'
                        }
                    }
                    return result;
                default:
                    throw new OperationError(`Invalid jq implementation: ${implementation}`);
                    break;
            }
        })();
    }

}

export default Jq;
