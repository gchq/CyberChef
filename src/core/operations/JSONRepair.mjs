/**
 * @author maojunxyz [maojun@linux.com]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";
import Operation from "../Operation.mjs";

/**
 * JSON Repair operation
 */
class JSONRepair extends Operation {

    /**
     * JSONRepair constructor
     */
    constructor() {
        super();

        this.name = "JSON Repair";
        this.module = "Code";
        this.description = "Attempts to repair invalid JSON by fixing common issues such as missing quotes around keys, trailing commas, single quotes, missing brackets, and more.<br><br>This operation can fix:<br>• Missing quotes around keys<br>• Single quotes instead of double quotes<br>• Trailing commas<br>• Missing commas<br>• Missing closing brackets<br>• Python constants (None, True, False)<br>• Comments<br>• JSONP notation<br>• And many other common JSON formatting issues<br><br>Uses the jsonrepair library for comprehensive JSON repair.<br><br>Tags: json fix, json repair, json validate, json format";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        if (!input) return "";

        try {
            // Dynamic import of jsonrepair to handle potential module loading issues
            const { jsonrepair } = await import("jsonrepair");
            return jsonrepair(input);
            
        } catch (err) {
            throw new OperationError("Unable to repair JSON. The input contains errors that cannot be automatically fixed.\n" + err.message);
        }
    }
}

export default JSONRepair;
