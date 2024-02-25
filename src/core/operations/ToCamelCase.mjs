/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import camelCase from "lodash/camelCase.js";
import Operation from "../Operation.mjs";
import { replaceVariableNames } from "../lib/Code.mjs";

/**
 * To Camel case operation
 */
class ToCamelCase extends Operation {
    /**
     * ToCamelCase constructor
     */
    constructor() {
        super();

        this.name = "To Camel case";
        this.module = "Code";
        this.description =
            "Converts the input string to camel case.\n<br><br>\nCamel case is all lower case except letters after word boundaries which are uppercase.\n<br><br>\ne.g. thisIsCamelCase\n<br><br>\n'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.";
        this.infoURL = "https://wikipedia.org/wiki/Camel_case";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Attempt to be context aware",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const smart = args[0];

        if (smart) {
            return replaceVariableNames(input, camelCase);
        } else {
            return camelCase(input);
        }
    }
}

export default ToCamelCase;
