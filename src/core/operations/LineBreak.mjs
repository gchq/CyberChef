/**
 * @author ThomasNotTom
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";


/**
 * Line Break operation
 */
class LineBreak extends Operation {

    /**
     * LineBreak constructor
     */
    constructor() {
        super();

        this.name = "Line Break";
        this.module = "Default";
        this.description = "Breaks the input text every <code>n</code> characters.";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Line break width",
                "type": "number",
                "value": 16,
                "min": 1
            }, {
                "name": "Remove leading whitespace",
                "type": "boolean",
                "value": false
            }
        ];
    }
}

export default LineBreak;
