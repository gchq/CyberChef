/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError.mjs";
import notepack from "notepack.io";

/**
 * To MessagePack operation
 */
class ToMessagePack extends Operation {

    /**
     * ToMessagePack constructor
     */
    constructor() {
        super();

        this.name = "To MessagePack";
        this.module = "Code";
        this.description = "Converts JSON to MessagePack encoded byte buffer";
        this.inputType = "JSON";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * @param {JSON} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        try {
            return notepack.encode(input);
        } catch (err) {
            throw new OperationError(`Could not encode JSON to MessagePack: ${err}`);
        }   
    }

}

export default ToMessagePack;
