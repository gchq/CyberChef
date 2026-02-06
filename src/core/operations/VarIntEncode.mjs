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
        this.inputType = "string";
        this.outputType = "byteArray";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        try {
            if (typeof BigInt === "function") {
                let value = BigInt(input);
                if (value < 0) throw new OperationError("Negative values cannot be represented as VarInt");
                const result = [];
                while (value >= 0x80) {
                    result.push(Number(value & BigInt(0x7f)) | 0x80);
                    value >>= BigInt(7);
                }
                result.push(Number(value));
                return result;
            } else {
                return Protobuf.varIntEncode(Number(input));
            }
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default VarIntEncode;
