/**
 * @author CyberChef
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Automated validation test operation
 */
class AutomatedValidationTestOp extends Operation {

    /**
     * AutomatedValidationTestOp constructor
     */
    constructor() {
        super();

        this.name = "Automated Validation Test Op";
        this.module = "Default";
        this.description = "Operation used specifically to test automated parameter validation.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Integer Number",
                "type": "number",
                "value": 5,
                "min": 5,
                "max": 10,
                "integer": true
            },
            {
                "name": "Real Number",
                "type": "number",
                "value": 1.5,
                "min": 1.5,
                "max": 5.5
            },
            {
                "name": "Non Empty String",
                "type": "string",
                "value": "hello",
                "maxLength": 5,
                "allowEmpty": false
            },
            {
                "name": "Empty Allowed String",
                "type": "string",
                "value": "",
                "allowEmpty": true
            },
            {
                "name": "Non Empty Toggle String",
                "type": "toggleString",
                "value": {
                    "option": "Option A",
                    "string": "test"
                },
                "toggleValues": ["Option A", "Option B"],
                "allowEmpty": false
            },
            {
                "name": "Option Ingredient",
                "type": "option",
                "value": ["[Group 1]", "Option 1", "Option 2", "[/Group 1]", "[Group 2]", "Option 3", "[/Group 2]"],
                "allowEmpty": false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return "Success";
    }

}

export default AutomatedValidationTestOp;
