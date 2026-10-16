/**
 * @author ccarpo [ccarpo@gmx.net]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { dump } from "js-yaml";

/**
 * JSON to YAML operation
 */
class JSONtoYAML extends Operation {

    /**
     * JSONtoYAML constructor
     */
    constructor() {
        super();

        this.name = "JSON to YAML";
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
            return dump(input);
        } catch (err) {
            throw new OperationError("Unable to stringify YAML: " + err);
        }
    }

}

export default JSONtoYAML;
