/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import YAML from "yaml";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * YAML To JSON operation
 */
class YAMLToJSON extends Operation {

    /**
     * YAMLToJSON constructor
     */
    constructor() {
        super();

        this.name = "YAML to JSON";
        this.module = "Default";
        this.description = "Converts YAML data to a JSON based on the definition in RFC 4180.";
        this.infoURL = "https://en.wikipedia.org/wiki/JSON";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Use Spaces",
                type: "number",
                value: 0
            }
        ];
    }

    /**
     * @param {YAML} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [spaces] = args;
        try {
            return JSON.stringify(YAML.parseDocument(input).toJSON(), null, spaces);
        } catch (err) {
            throw new OperationError("Unable to parse YAML To JSON: " + err.toString());
        }
    }

}

export default YAMLToJSON;
