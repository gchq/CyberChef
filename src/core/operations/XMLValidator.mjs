/**
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.description = "";
        this.infoURL = "";
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

        const DOMParser = require("xmldom").DOMParser;

        try {
            // Overwrite error handler since the built-in one does not raise exceptions.
            (new DOMParser({errorHandler: {
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
