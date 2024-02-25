/**
 * @author GCHQ Contributor [3]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Protobuf from "../lib/Protobuf.mjs";

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
        this.module = "Protobuf";
        this.description =
            "Decodes any Protobuf encoded data to a JSON representation of the data using the field number as the field key.<br><br>If a .proto schema is defined, the encoded data will be decoded with reference to the schema. Only one message instance will be decoded. <br><br><u>Show Unknown Fields</u><br>When a schema is used, this option shows fields that are present in the input data but not defined in the schema.<br><br><u>Show Types</u><br>Show the type of a field next to its name. For undefined fields, the wiretype and example types are shown instead.";
        this.infoURL = "https://wikipedia.org/wiki/Protocol_Buffers";
        this.inputType = "ArrayBuffer";
        this.outputType = "JSON";
        this.args = [
            {
                name: "Schema (.proto text)",
                type: "text",
                value: "",
                rows: 8,
                hint: "Drag and drop is enabled on this ingredient",
            },
            {
                name: "Show Unknown Fields",
                type: "boolean",
                value: false,
            },
            {
                name: "Show Types",
                type: "boolean",
                value: false,
            },
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
            return Protobuf.decode(input, args);
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default ProtobufDecode;
