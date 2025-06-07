/**
 * @author MrMadFox [c.saipraneeth888@gmail.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import YAML from "js-yaml";
import OperationError from "../errors/OperationError.mjs";

/**
 * YAMLBeautify operation
 */
class YAMLBeautify extends Operation {

    /**
     * YAMLBeautify constructor
     */
    constructor() {
        super();

        this.name = "YAML Beautify";
        this.module = "Code";
        this.description = "Indents and prettifies YAML code.";
        this.infoURL = "https://yaml.org/";
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
        try {
            return YAML.dump(YAML.load(input), {
                styles: {
                    "!!null": "empty"
                }
            });
        } catch (err) {
            if (err instanceof YAML.YAMLException) {
                throw new OperationError(err.message);
            }
        }
    }
}

export default YAMLBeautify;
