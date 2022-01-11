/**
 * @author kjcain [kyler@kylercain.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Custom Code operation
 */
class CustomCode extends Operation {

    /**
     * CustomCode constructor
     */
    constructor() {
        super();

        this.name = "Custom Code";
        this.module = "Default";
        this.description = "Execute custom javascript code.";
        this.infoURL = "";
        this.inputType = "JSON";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Code",
                type: "text",
                value: "return input;"
            }
        ];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        const [customCode] = args;

        try {
            const wrappedCode = new Function("input", customCode);
            return wrappedCode(input);
        } catch (error) {
            throw new OperationError(error);
        }
    }

}

export default CustomCode;
