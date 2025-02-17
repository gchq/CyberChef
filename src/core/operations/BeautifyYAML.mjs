/**
 * @author ccarpo [ccarpo@gmx.net]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import YAML from "yaml";

/**
 * Beautify YAML operation
 */
class BeautifyYAML extends Operation {

    /**
     * BeautifyYAML constructor
     */
    constructor() {
        super();

        this.name = "Beautify YAML";
        this.module = "Default";
        this.description = "Format a JSON object into YAML";
        this.infoURL = "https://en.wikipedia.org/wiki/YAML";
        this.inputType = "JSON";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            return YAML.stringify(input);
        } catch (err) {
            throw new OperationError("Test");
        }
    }

}

export default BeautifyYAML;
