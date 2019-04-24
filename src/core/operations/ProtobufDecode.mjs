/**
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import Protobuf from "../lib/Protobuf";

/**
 * Protobuf Decode operation
 */
class ProtobufDecode extends Operation {

    /**
     * ProtobufDecode constructor
     */
    constructor() {
        super();

        this.name = "Protobuf Decode";
        this.module = "Default";
        this.description = "Decodes any Protobuf encoded data to a JSON representation of the data using the field number as the field key.";
        this.infoURL = "https://wikipedia.org/wiki/Protocol_Buffers";
        this.inputType = "byteArray";
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
            return Protobuf.decode(input);
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default ProtobufDecode;
