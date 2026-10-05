/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { build, parseBinary } from "plist";

/**
 * Binary P-list to XML P-list operation
 */
class BplistToPlist extends Operation {

    /**
     * BplistToPlist constructor
     */
    constructor() {
        super();

        this.name = "Binary P-list to XML P-list";
        this.module = "Default";
        this.description = "Converts a binary p-list into an XML p-list.<br><br>UID objects become a dictionary with the key <code>UID</code>.";
        this.infoURL = "https://wikipedia.org/wiki/Property_list";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
            return build(parseBinary(bytes));
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new OperationError(message);
        }
    }

}

export default BplistToPlist;
