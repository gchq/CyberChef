/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import notepack from "notepack.io";

/**
 * From MessagePack operation
 */
class FromMessagePack extends Operation {

    /**
     * FromMessagePack constructor
     */
    constructor() {
        super();

        this.name = "From MessagePack";
        this.module = "Code";
        this.description = "Converts MessagePack encoded data to JSON";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        try {
            return notepack.decode(input);
        } catch (err) {
            throw new OperationError(`Could not decode MessagePack to JSON: ${err}`);
        }
    }

}

export default FromMessagePack;
