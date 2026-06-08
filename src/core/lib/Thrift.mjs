/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Utils from "../Utils.mjs";

/**
 * Recursively parses the JSON object to build out the Thrift byte array structure.
 *
 * @param {Object} jsonStruct
 * @param {number[]} bytes
 */
export function buildBinaryStruct(jsonStruct, bytes) {
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
        writeValue(typeName, value, bytes, typeMap);
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
export function writeValue(typeName, value, bytes, typeMap) {
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
            buildBinaryStruct(value, bytes);
            break;
        case "LIST":
        case "SET": {
            // Expects JSON format: { "elementType": "I32", "elements": [1, 2, 3] }
            const elType = typeMap[value.elementType];
            bytes.push(elType); // 1 byte element type

            const listSize = value.elements.length;
            bytes.push((listSize >> 24) & 0xFF, (listSize >> 16) & 0xFF, (listSize >> 8) & 0xFF, listSize & 0xFF); // 4 byte size

            // Write each element recursively
            value.elements.forEach(el => writeValue(value.elementType, el, bytes, typeMap));
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
                writeValue(value.keyType, pair.key, bytes, typeMap);
                writeValue(value.valType, pair.val, bytes, typeMap);
            });
            break;
        }
        default:
            throw new Error(`Unsupported serialization type: ${typeName}`);
    }
}

// --- TBinaryProtocol Deserialization Functions ---

/**
 * Parses the incoming schema using TBinaryProtocol constraints.
 *
 * @param {DataView} data
 * @param {number} offset
 * @returns {Object}
 */
export function parseBinaryProtocol(data, offset) {
    const result = {};
    while (offset < data.byteLength) {
        const fieldType = data.getUint8(offset++);
        if (fieldType === 0) break; // T_STOP

        const fieldId = data.getInt16(offset);
        offset += 2;

        const parsed = readBinaryType(data, offset, fieldType);
        result[`field_${fieldId}`] = { type: getBinaryTypeName(fieldType), value: parsed.value };
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
export function readBinaryType(data, offset, type) {
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
            const structParsed = parseBinaryProtocol(data, offset);
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
                const k = readBinaryType(data, offset, keyType);
                offset = k.offset;
                const v = readBinaryType(data, offset, valType);
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
                const elem = readBinaryType(data, offset, elemType);
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
export function getBinaryTypeName(type) {
    const types = { 2: "BOOL", 3: "I8", 4: "DOUBLE", 6: "I16", 8: "I32", 10: "I64", 11: "BINARY", 12: "STRUCT", 13: "MAP", 14: "SET", 15: "LIST" };
    return types[type] || `UNKNOWN(${type})`;
}

// --- TCompactProtocol Deserialization Functions ---

/**
 * Parses the incoming schema using TCompactProtocol constraints.
 *
 * @param {DataView} data
 * @param {number} offset
 * @returns {Object}
 */
export function parseCompactProtocol(data, offset) {
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
            const idParsed = readVarint(data, offset);
            fieldId = fromZigZag(idParsed.value);
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

        const parsed = readCompactType(data, offset, fieldType);
        result[`field_${fieldId}`] = { type: getCompactTypeName(fieldType), value: parsed.value };
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
export function readCompactType(data, offset, type) {
    let value, varintParsed;
    switch (type) {
        case 3: // I8
            value = data.getInt8(offset++);
            break;
        case 4: // I16
        case 5: // I32
        case 6: // I64
            varintParsed = readVarint(data, offset);
            value = fromZigZag(varintParsed.value); // Decodes ZigZag
            offset = varintParsed.offset;
            break;
        case 7: // DOUBLE
            value = data.getFloat64(offset, true); // Little endian
            offset += 8;
            break;
        case 8: { // BINARY/STRING
            varintParsed = readVarint(data, offset);
            const strLen = Number(varintParsed.value); // Not zigzagged
            offset = varintParsed.offset;
            const strBytes = new Uint8Array(data.buffer, offset, strLen);
            value = Utils.byteArrayToUtf8(strBytes);
            offset += strLen;
            break;
        }
        case 12: { // STRUCT
            const structParsed = parseCompactProtocol(data, offset);
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
export function getCompactTypeName(type) {
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
export function readVarint(data, offset) {
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
export function fromZigZag(n) {
    // n >>> 1 ^ -(n & 1) using BigInt to prevent 32-bit truncation
    return (n >> 1n) ^ -(n & 1n);
}
