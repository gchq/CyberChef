/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {
    parseBinaryProtocol,
    parseCompactProtocol
} from "../lib/Thrift.mjs";

/**
 * Operation to decode Apache Thrift binary blobs into JSON structures.
 */
class ThriftDeserialize extends Operation {
    /**
     * ThriftDeserialize constructor.
     */
    constructor() {
        super();
        this.name = "Thrift Deserialize";
        this.module = "Default";
        this.description = "Decodes an Apache Thrift binary blob into a JSON representation without requiring an IDL schema. Supports Binary and Compact protocols.";
        this.infoURL = "https://github.com/apache/thrift/tree/master/doc/specs";
        this.inputType = "ArrayBuffer";
        this.outputType = "String";
        this.args = [
            {
                "name": "Protocol",
                "type": "option",
                "value": ["TBinaryProtocol", "TCompactProtocol"]
            }
        ];
    }

    /**
     * Runs the operation.
     *
     * @param {ArrayBuffer} input
     * @param {Array} args
     * @returns {string}
     */
    run(input, args) {
        const protocol = args[0];
        const data = new DataView(input);
        if (input.byteLength === 0) return "";

        let decodedObject = {};
        try {
            if (protocol === "TBinaryProtocol") {
                decodedObject = parseBinaryProtocol(data, 0).result;
            } else if (protocol === "TCompactProtocol") {
                decodedObject = parseCompactProtocol(data, 0).result;
            }
            return JSON.stringify(decodedObject, null, 4);
        } catch (err) {
            return `Error decoding Thrift payload: ${err.message}\n\nPartial output:\n${JSON.stringify(decodedObject, null, 4)}`;
        }
    }
}

export default ThriftDeserialize;
