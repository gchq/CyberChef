/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import { 
    buildBinaryStruct, 
    writeValue 
} from "../lib/Thrift.mjs";

/**
 * Operation to encode a JSON structure into Apache Thrift TBinaryProtocol binary format.
 */
class ThriftSerialize extends Operation {
    /**
     * ThriftSerialize constructor.
     */
    constructor() {
        super();
        this.name = "Thrift Serialize";
        this.module = "Default";
        this.description = "Encodes a JSON representation back into an Apache Thrift TBinaryProtocol binary format.";
        this.infoURL = "https://github.com/apache/thrift/blob/master/doc/specs/thrift-binary-encoding.md";
        this.inputType = "String";
        this.outputType = "ArrayBuffer";
        this.args = [];
    }

    /**
     * Runs the operation.
     *
     * @param {string} input
     * @param {Array} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        if (!input || input.trim() === "") return new ArrayBuffer(0);

        let parsedInput;
        try {
            parsedInput = JSON.parse(input);
        } catch (e) {
            throw new Error("Input must be valid JSON.");
        }

        const bytes = [];
        buildBinaryStruct(parsedInput, bytes);
        return new Uint8Array(bytes).buffer;
    }
}

export default ThriftSerialize;
