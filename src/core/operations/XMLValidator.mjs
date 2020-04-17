/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import DOMParser from "xmldom";

/**
 * XML Validator operation
 */
class XMLValidator extends Operation {

    /**
     * XMLValidator constructor
     */
    constructor() {
        super();

        this.name = "XML Validator";
        this.module = "Default";
        this.description = "Extensible Markup Language (XML) is a markup language that defines a set of rules for encoding documents in a format that is both human-readable and machine-readable.";
        this.infoURL = "https://wikipedia.org/wiki/XML";
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
            // Overwrite error handler since the built-in one does not raise exceptions.
            (new DOMParser.DOMParser({errorHandler: {
                warning: (msg) => {
                    throw new OperationError(msg);
                },
                error: (msg) => {
                    throw new OperationError(msg);
                },
                fatalError: (msg) => {
                    throw new OperationError(msg);
                },
            }})).parseFromString(input);
        } catch (err) {
            throw new OperationError(err);
        }
        return input;
    }
}

export default XMLValidator;
