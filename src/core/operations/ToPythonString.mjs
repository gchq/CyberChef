/**
 * @author SamueleFacenda [samuele.facenda@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * toPythonString operation
 */
class ToPythonString extends Operation {

    /**
     * ToPythonString constructor
     */
    constructor() {
        super();

        this.name = "toPythonString";
        this.module = "Default";
        this.description = "Convert any byte array to python string or byte string";
        this.infoURL = "";
        this.inputType = "byteArray";
        this.outputType = "string";
        this.args = [
            /* Example arguments. See the project wiki for full details.
            {
                name: "First arg",
                type: "string",
                value: "Don't Panic"
            },
            {
                name: "Second arg",
                type: "number",
                value: 42
            }
            */
        ];
    }

    /**
     * convert a single byte to his string representation
     * @param {int} value
     * @returns {string}
     */
    toPyChar(value){
        //check if it's a standard ascii value
        if(32 <= value && value <= 126)
            return String.fromCharCode(value)
            
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // const [firstArg, secondArg] = args;

        throw new OperationError("Test");
    }

}

export default ToPythonString;
