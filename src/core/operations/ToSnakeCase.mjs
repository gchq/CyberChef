/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import { snakeCase } from "lodash";
import Operation from "../Operation";
import { replaceVariableNames } from "../lib/Code";

/**
 * To Snake case operation
 */
class ToSnakeCase extends Operation {

    /**
     * ToSnakeCase constructor
     */
    constructor() {
        super();

        this.name = "To Snake case";
        this.module = "Code";
        this.description = "Converts the input string to snake case.\n<br><br>\nSnake case is all lower case with underscores as word boundaries.\n<br><br>\ne.g. this_is_snake_case\n<br><br>\n'Attempt to be context aware' will make the operation attempt to nicely transform variable and function names.";
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
            return replaceVariableNames(input, snakeCase);
        } else {
            return snakeCase(input);
        }
    }
}

export default ToSnakeCase;
