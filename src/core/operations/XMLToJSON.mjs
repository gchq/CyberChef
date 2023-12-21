/**
 * @author jpledref [jp.ledref@gmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import xml2js from "xml2js";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * XML to JSON operation
 */
class XMLToJSON extends Operation {

    /**
     * XMLToJSON constructor
     */
    constructor() {
        super();

        this.name = "XML to JSON";
        this.module = "Default";
        this.description = "Converts XML data to JSON format.";
        this.infoURL = "https://wikipedia.org/wiki/XML";
        this.inputType = "string";
        this.outputType = "JSON";
        this.args = [
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        let result;
        try {
            xml2js.parseString(input, {}, (e, r) => result = JSON.stringify(r));
            return JSON.parse(result);
        } catch (err) {
            throw new OperationError("Unable to parse XML to JSON: " + err.toString());
        }
    }

}

export default XMLToJSON;
