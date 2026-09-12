/**
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Protobuf from "../lib/Protobuf.mjs";

/**
 * Protobuf Stream Decode operation
 */
class ProtobufStreamDecode extends Operation {

    /**
     * ProtobufStreamDecode constructor
     */
    constructor() {
        super();

        this.name = "Protobuf Stream Decode";
        this.module = "Protobuf";
        this.description = "Decodes Protobuf encoded data from streams to a JSON array representation of the data using the field number as the field key.<br><br>If a .proto schema is defined, the encoded data will be decoded with reference to the schema. Only one message instance will be decoded. <br><br><u>Show Unknown Fields</u><br>When a schema is used, this option shows fields that are present in the input data but not defined in the schema.<br><br><u>Show Types</u><br>Show the type of a field next to its name. For undefined fields, the wiretype and example types are shown instead.";
        this.infoURL = "https://developers.google.com/protocol-buffers/docs/techniques#streaming";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Show Types",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {JSON}
     */
    run(input, args) {
        input = new Uint8Array(input);
        try {
            // provide standard values for currently removed arguments
            return Protobuf.decodeStream(input, ["", false, ...args]);
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default ProtobufStreamDecode;
