/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { kebabCase } from "lodash";
import Operation from "../Operation";
import { replaceVariableNames } from "../lib/Code";

/**
 * To Kebab case operation
 */
class ToKebabCase extends Operation {

    /**
     * ToKebabCase constructor
     */
    constructor() {
        super();

        this.name = "To Kebab case";
        this.module = "Code";
        this.description = "Converts the input string to kebab case.\n<br><br>\nKebab case is all lower case with dashes as word boundaries.\n<br><br>\ne.g. this-is-kebab-case\n<br><br>\n'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Attempt to be context aware",
                "type": "boolean",
                "value": false
            }
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
            return replaceVariableNames(input, kebabCase);
        } else {
            return kebabCase(input);
        }
    }

}

export default ToKebabCase;
