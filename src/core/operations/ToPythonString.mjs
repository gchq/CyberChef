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

        this.name = "To Python String";
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
        //check if it's a standard ascii value and return the corresponding char or format it as a hex value with the \x prefix
        if(32 <= value && value <= 126)
            return String.fromCharCode(value)
        else
            return "\\x" + value.toString(16).padStart(2, "0")     
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        //format the converted string as a python byte string
        return 'b"' + input.map(this.toPyChar).join("") + '"';
    }

}

export default ToPythonString;
