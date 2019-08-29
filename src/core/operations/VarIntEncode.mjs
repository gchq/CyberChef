/**
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Protobuf from "../lib/Protobuf.mjs";

/**
 * VarInt Encode operation
 */
class VarIntEncode extends Operation {

    /**
     * VarIntEncode constructor
     */
    constructor() {
        super();

        this.name = "VarInt Encode";
        this.module = "Default";
        this.description = "Encodes a Vn integer as a VarInt. VarInt is an efficient way of encoding variable length integers and is commonly used with Protobuf.";
        this.infoURL = "https://developers.google.com/protocol-buffers/docs/encoding#varints";
        this.inputType = "number";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {number} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        try {
            return Protobuf.varIntEncode(input);
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default VarIntEncode;
