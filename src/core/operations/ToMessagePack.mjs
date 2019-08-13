/**
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import notepack from "notepack.io";
import { isWorkerEnvironment } from "../Utils.mjs";

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
        this.description = "Converts JSON to MessagePack encoded byte buffer. MessagePack is a computer data interchange format. It is a binary form for representing simple data structures like arrays and associative arrays.";
        this.infoURL = "https://wikipedia.org/wiki/MessagePack";
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
            if (isWorkerEnvironment()) {
                return notepack.encode(input);
            } else {
                const res = notepack.encode(input);
                // Safely convert from Node Buffer to ArrayBuffer using the correct view of the data
                return (new Uint8Array(res)).buffer;
            }
        } catch (err) {
            throw new OperationError(`Could not encode JSON to MessagePack: ${err}`);
        }
    }

}

export default ToMessagePack;
