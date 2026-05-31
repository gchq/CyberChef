/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";

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
                decodedObject = this.parseBinaryProtocol(data, 0).result;
            } else if (protocol === "TCompactProtocol") {
                decodedObject = this.parseCompactProtocol(data, 0).result;
            }
            return JSON.stringify(decodedObject, null, 4);
        } catch (err) {
            return `Error decoding Thrift payload: ${err.message}\n\nPartial output:\n${JSON.stringify(decodedObject, null, 4)}`;
        }
    }

    // --- TBinaryProtocol Implementation ---

    /**
     * Parses the incoming schema using TBinaryProtocol constraints.
     *
     * @param {DataView} data
     * @param {number} offset
     * @returns {Object}
     */
    parseBinaryProtocol(data, offset) {
        const result = {};
        while (offset < data.byteLength) {
            const fieldType = data.getUint8(offset++);
            if (fieldType === 0) break; // T_STOP

            const fieldId = data.getInt16(offset);
            offset += 2;

            const parsed = this.readBinaryType(data, offset, fieldType);
            result[`field_${fieldId}`] = { type: this.getBinaryTypeName(fieldType), value: parsed.value };
            offset = parsed.offset;
        }
        return { result, offset };
    }

    /**
     * Reads and transforms binary datatypes based on identifier rules.
     *
     * @param {DataView} data
     * @param {number} offset
     * @param {number} type
     * @returns {Object}
     */
    readBinaryType(data, offset, type) {
        let value;
        switch (type) {
            case 2: // BOOL
                value = data.getUint8(offset++) === 1;
                break;
            case 3: // I8
                value = data.getInt8(offset++);
                break;
            case 4: // DOUBLE
                value = data.getFloat64(offset);
                offset += 8;
                break;
            case 6: // I16
                value = data.getInt16(offset);
                offset += 2;
                break;
            case 8: // I32
                value = data.getInt32(offset);
                offset += 4;
                break;
            case 10: // I64
                // Note: using BigInt to avoid precision loss on 64-bit integers
                value = data.getBigInt64(offset).toString();
                offset += 8;
                break;
            case 11: { // BINARY/STRING
                const strLen = data.getInt32(offset);
                offset += 4;
                const strBytes = new Uint8Array(data.buffer, offset, strLen);
                value = Utils.byteArrayToUtf8(strBytes);
                offset += strLen;
                break;
            }
            case 12: { // STRUCT
                const structParsed = this.parseBinaryProtocol(data, offset);
                value = structParsed.result;
                offset = structParsed.offset;
                break;
            }
            case 13: { // MAP
                const keyType = data.getUint8(offset++);
                const valType = data.getUint8(offset++);
                const mapSize = data.getInt32(offset);
                offset += 4;
                value = [];
                for (let i = 0; i < mapSize; i++) {
                    const k = this.readBinaryType(data, offset, keyType);
                    offset = k.offset;
                    const v = this.readBinaryType(data, offset, valType);
                    offset = v.offset;
                    value.push({ key: k.value, val: v.value });
                }
                break;
            }
            case 14: // SET
            case 15: { // LIST
                const elemType = data.getUint8(offset++);
                const listSize = data.getInt32(offset);
                offset += 4;
                value = [];
                for (let i = 0; i < listSize; i++) {
                    const elem = this.readBinaryType(data, offset, elemType);
                    value.push(elem.value);
                    offset = elem.offset;
                }
                break;
            }
            default:
                throw new Error(`Unknown Binary Protocol Type: ${type} at offset ${offset}`);
        }
        return { value, offset };
    }

    /**
     * Returns string names for Binary protocol types.
     *
     * @param {number} type
     * @returns {string}
     */
    getBinaryTypeName(type) {
        const types = { 2: "BOOL", 3: "I8", 4: "DOUBLE", 6: "I16", 8: "I32", 10: "I64", 11: "BINARY", 12: "STRUCT", 13: "MAP", 14: "SET", 15: "LIST" };
        return types[type] || `UNKNOWN(${type})`;
    }

    // --- TCompactProtocol Implementation ---

    /**
     * Parses the incoming schema using TCompactProtocol constraints.
     *
     * @param {DataView} data
     * @param {number} offset
     * @returns {Object}
     */
    parseCompactProtocol(data, offset) {
        const result = {};
        let lastFieldId = 0;

        while (offset < data.byteLength) {
            const byte = data.getUint8(offset++);
            if (byte === 0) break; // STOP field

            const modifier = (byte & 0xf0) >> 4;
            const fieldType = byte & 0x0f;

            let fieldId;
            if (modifier === 0) {
                // Long form: read zigzag varint field ID
                const idParsed = this.readVarint(data, offset);
                fieldId = this.fromZigZag(idParsed.value);
                offset = idParsed.offset;
            } else {
                // Short form: delta
                fieldId = lastFieldId + modifier;
            }
            lastFieldId = fieldId;

            // Types 1 and 2 are boolean true/false encoded directly in the modifier
            if (fieldType === 1) {
                result[`field_${fieldId}`] = { type: "BOOL", value: true };
                continue;
            } else if (fieldType === 2) {
                result[`field_${fieldId}`] = { type: "BOOL", value: false };
                continue;
            }

            const parsed = this.readCompactType(data, offset, fieldType);
            result[`field_${fieldId}`] = { type: this.getCompactTypeName(fieldType), value: parsed.value };
            offset = parsed.offset;
        }
        return { result, offset };
    }

    /**
     * Reads and transforms compact datatypes based on identifier rules.
     *
     * @param {DataView} data
     * @param {number} offset
     * @param {number} type
     * @returns {Object}
     */
    readCompactType(data, offset, type) {
        let value, varintParsed;
        switch (type) {
            case 3: // I8
                value = data.getInt8(offset++);
                break;
            case 4: // I16
            case 5: // I32
            case 6: // I64
                varintParsed = this.readVarint(data, offset);
                value = this.fromZigZag(varintParsed.value); // Decodes ZigZag
                offset = varintParsed.offset;
                break;
            case 7: // DOUBLE
                value = data.getFloat64(offset, true); // Little endian
                offset += 8;
                break;
            case 8: { // BINARY/STRING
                varintParsed = this.readVarint(data, offset);
                const strLen = Number(varintParsed.value); // Not zigzagged
                offset = varintParsed.offset;
                const strBytes = new Uint8Array(data.buffer, offset, strLen);
                value = Utils.byteArrayToUtf8(strBytes);
                offset += strLen;
                break;
            }
            case 12: { // STRUCT
                const structParsed = this.parseCompactProtocol(data, offset);
                value = structParsed.result;
                offset = structParsed.offset;
                break;
            }
            // Note: Lists (9), Sets (10), Maps (11) follow slightly different header rules in Compact
            // Implement based on the spec provided (e.g., sssstttt for lists)
            default:
                throw new Error(`Unimplemented/Unknown Compact Type: ${type} at offset ${offset}`);
        }
        return { value, offset };
    }

    /**
     * Returns string names for Compact protocol types.
     *
     * @param {number} type
     * @returns {string}
     */
    getCompactTypeName(type) {
        const types = { 1: "BOOLEAN_TRUE", 2: "BOOLEAN_FALSE", 3: "I8", 4: "I16", 5: "I32", 6: "I64", 7: "DOUBLE", 8: "BINARY", 9: "LIST", 10: "SET", 11: "MAP", 12: "STRUCT", 13: "UUID" };
        return types[type] || `UNKNOWN(${type})`;
    }

    /**
     * Variable-length integer parsing logic helper.
     *
     * @param {DataView} data
     * @param {number} offset
     * @returns {Object}
     */
    readVarint(data, offset) {
        let result = 0n;
        let shift = 0n;
        while (true) {
            if (offset >= data.byteLength) throw new Error("EOF reading varint");
            const byte = BigInt(data.getUint8(offset++));
            result |= (byte & 0x7fn) << shift;
            if ((byte & 0x80n) === 0n) break;
            shift += 7n;
        }
        return { value: result, offset: offset };
    }

    /**
     * Decodes ZigZag parameters to system numbers.
     *
     * @param {bigint} n
     * @returns {bigint}
     */
    fromZigZag(n) {
        // n >>> 1 ^ -(n & 1) using BigInt to prevent 32-bit truncation
        return (n >> 1n) ^ -(n & 1n);
    }
}

export default ThriftDeserialize;
