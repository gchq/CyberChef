/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

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
        this.buildBinaryStruct(parsedInput, bytes);
        return new Uint8Array(bytes).buffer;
    }

    /**
     * Recursively parses the JSON object to build out the Thrift byte array structure.
     *
     * @param {Object} jsonStruct
     * @param {number[]} bytes
     */
    buildBinaryStruct(jsonStruct, bytes) {
        const typeMap = { "BOOL": 2, "I8": 3, "DOUBLE": 4, "I16": 6, "I32": 8, "I64": 10, "BINARY": 11, "STRUCT": 12, "MAP": 13, "SET": 14, "LIST": 15 };

        for (const [key, fieldData] of Object.entries(jsonStruct)) {
            const fieldId = parseInt(key.replace("field_", ""), 10);
            if (isNaN(fieldId)) continue;

            const typeName = fieldData.type;
            const fieldType = typeMap[typeName];
            const value = fieldData.value;

            // 1. Write Field Type (1 byte)
            bytes.push(fieldType);
            // 2. Write Field ID (2 bytes, Big Endian)
            bytes.push((fieldId >> 8) & 0xFF, fieldId & 0xFF);

            // 3. Write Value
            this.writeValue(typeName, value, bytes, typeMap);
        }

        // Write T_STOP to close the struct
        bytes.push(0);
    }

    /**
     * Serializes values into the byte stream according to their specific Thrift types.
     *
     * @param {string} typeName
     * @param {*} value
     * @param {number[]} bytes
     * @param {Object} typeMap
     */
    writeValue(typeName, value, bytes, typeMap) {
        switch (typeName) {
            case "BOOL":
                bytes.push(value ? 1 : 0);
                break;
            case "I8":
                bytes.push(value & 0xFF);
                break;
            case "I16":
                bytes.push((value >> 8) & 0xFF, value & 0xFF);
                break;
            case "I32":
                bytes.push((value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF);
                break;
            case "I64": {
                const bigVal = BigInt(value);
                for (let i = 7n; i >= 0n; i--) bytes.push(Number((bigVal >> (i * 8n)) & 0xFFn));
                break;
            }
            case "DOUBLE": {
                // 8 bytes IEEE 754 floating point (Big Endian)
                const floatView = new DataView(new ArrayBuffer(8));
                floatView.setFloat64(0, value, false);
                for (let i = 0; i < 8; i++) bytes.push(floatView.getUint8(i));
                break;
            }
            case "BINARY": {
                const textEncoder = new TextEncoder();
                const strBytes = textEncoder.encode(value);
                const len = strBytes.length;
                bytes.push((len >> 24) & 0xFF, (len >> 16) & 0xFF, (len >> 8) & 0xFF, len & 0xFF);
                strBytes.forEach(b => bytes.push(b));
                break;
            }
            case "STRUCT":
                // Recursively build nested structs
                this.buildBinaryStruct(value, bytes);
                break;
            case "LIST":
            case "SET": {
                // Expects JSON format: { "elementType": "I32", "elements": [1, 2, 3] }
                const elType = typeMap[value.elementType];
                bytes.push(elType); // 1 byte element type

                const listSize = value.elements.length;
                bytes.push((listSize >> 24) & 0xFF, (listSize >> 16) & 0xFF, (listSize >> 8) & 0xFF, listSize & 0xFF); // 4 byte size

                // Write each element recursively
                value.elements.forEach(el => this.writeValue(value.elementType, el, bytes, typeMap));
                break;
            }
            case "MAP": {
                // Expects JSON format: { "keyType": "I32", "valType": "BINARY", "elements": [{"key": 1, "val": "hello"}] }
                const kType = typeMap[value.keyType];
                const vType = typeMap[value.valType];
                bytes.push(kType, vType); // 1 byte key type, 1 byte val type

                const mapSize = value.elements.length;
                bytes.push((mapSize >> 24) & 0xFF, (mapSize >> 16) & 0xFF, (mapSize >> 8) & 0xFF, mapSize & 0xFF); // 4 byte size

                // Write pairs
                value.elements.forEach(pair => {
                    this.writeValue(value.keyType, pair.key, bytes, typeMap);
                    this.writeValue(value.valType, pair.val, bytes, typeMap);
                });
                break;
            }
            default:
                throw new Error(`Unsupported serialization type: ${typeName}`);
        }
    }
}

export default ThriftSerialize;
