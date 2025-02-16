/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import YAML from "yaml";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * JSON to YAML operation
 */
class JSONToYAML extends Operation {

    /**
     * JSONToYAML constructor
     */
    constructor() {
        super();

        this.name = "JSON to YAML";
        this.module = "Default";
        this.description = "Converts JSON data to a YAML.";
        this.infoURL = "https://yaml.org/spec/1.2.2/";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const doc = new YAML.Document();
        try {
            doc.contents = YAML.stringify(JSON.parse(input));
            return doc.toString().replace(/^\|\n/, "");
        } catch (err) {
            throw new OperationError("Unable to parse JSON to YAML: " + err.toString());
        }
    }

}

export default JSONToYAML;
