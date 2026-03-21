/**
 * @author ccarpo [ccarpo@gmx.net]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import jsYaml from "js-yaml";
/**
 * YAML to JSON operation
 */
class YAMLToJSON extends Operation {

    /**
     * YAMLToJSON constructor
     */
    constructor() {
        super();

        this.name = "YAML to JSON";
        this.module = "Default";
        this.description = "Convert YAML to JSON";
        this.infoURL = "https://en.wikipedia.org/wiki/YAML";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        try {
            return jsYaml.load(input);
        } catch (err) {
            throw new OperationError("Unable to parse YAML: " + err);
        }
    }

}

export default YAMLToJSON;
