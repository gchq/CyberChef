import TestRegister from "../../../lib/TestRegister.mjs";
import {
    buildBinaryStruct,
    writeValue,
    parseBinaryProtocol,
    readBinaryType,
    getBinaryTypeName,
    parseCompactProtocol,
    readCompactType,
    getCompactTypeName,
    readVarint,
    fromZigZag
} from "../../../../src/core/lib/Thrift.mjs";
import it from "../../assertionHandler.mjs";
import assert from "assert";

TestRegister.addApiTests([
    // ===== readVarint tests =====
    it("Thrift: readVarint - single byte (0)", () => {
        const bytes = new Uint8Array([0x00]);
        const data = new DataView(bytes.buffer);
        const result = readVarint(data, 0);
        assert.strictEqual(result.value, 0n);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readVarint - single byte (127)", () => {
        const bytes = new Uint8Array([0x7F]);
        const data = new DataView(bytes.buffer);
        const result = readVarint(data, 0);
        assert.strictEqual(result.value, 127n);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readVarint - two bytes (128)", () => {
        const bytes = new Uint8Array([0x80, 0x01]);
        const data = new DataView(bytes.buffer);
        const result = readVarint(data, 0);
        assert.strictEqual(result.value, 128n);
        assert.strictEqual(result.offset, 2);
    }),

    it("Thrift: readVarint - multiple bytes (16384)", () => {
        const bytes = new Uint8Array([0x80, 0x80, 0x01]);
        const data = new DataView(bytes.buffer);
        const result = readVarint(data, 0);
        assert.strictEqual(result.value, 16384n);
        assert.strictEqual(result.offset, 3);
    }),

    it("Thrift: readVarint - starting from non-zero offset", () => {
        const bytes = new Uint8Array([0xFF, 0xFF, 0x42]); // 0xFF is continuation, 0xFF is continuation, 0x42 is end
        const data = new DataView(bytes.buffer);
        const result = readVarint(data, 1);
        assert.strictEqual(result.offset, 3);
    }),

    it("Thrift: readVarint - EOF error", () => {
        const bytes = new Uint8Array([0x80]); // Missing continuation byte
        const data = new DataView(bytes.buffer);
        assert.throws(() => readVarint(data, 0), /EOF reading varint/);
    }),

    // ===== fromZigZag tests =====
    it("Thrift: fromZigZag - zero", () => {
        assert.strictEqual(fromZigZag(0n), 0n);
    }),

    it("Thrift: fromZigZag - positive numbers", () => {
        assert.strictEqual(fromZigZag(2n), 1n);
        assert.strictEqual(fromZigZag(4n), 2n);
        assert.strictEqual(fromZigZag(6n), 3n);
    }),

    it("Thrift: fromZigZag - negative numbers", () => {
        assert.strictEqual(fromZigZag(1n), -1n);
        assert.strictEqual(fromZigZag(3n), -2n);
        assert.strictEqual(fromZigZag(5n), -3n);
    }),

    it("Thrift: fromZigZag - large positive", () => {
        assert.strictEqual(fromZigZag(BigInt("1000000000")), BigInt("500000000"));
    }),

    it("Thrift: fromZigZag - large negative", () => {
        assert.strictEqual(fromZigZag(BigInt("1000000001")), BigInt("-500000001"));
    }),

    // ===== getBinaryTypeName tests =====
    it("Thrift: getBinaryTypeName - all type mappings", () => {
        assert.strictEqual(getBinaryTypeName(2), "BOOL");
        assert.strictEqual(getBinaryTypeName(3), "I8");
        assert.strictEqual(getBinaryTypeName(4), "DOUBLE");
        assert.strictEqual(getBinaryTypeName(6), "I16");
        assert.strictEqual(getBinaryTypeName(8), "I32");
        assert.strictEqual(getBinaryTypeName(10), "I64");
        assert.strictEqual(getBinaryTypeName(11), "BINARY");
        assert.strictEqual(getBinaryTypeName(12), "STRUCT");
        assert.strictEqual(getBinaryTypeName(13), "MAP");
        assert.strictEqual(getBinaryTypeName(14), "SET");
        assert.strictEqual(getBinaryTypeName(15), "LIST");
    }),

    it("Thrift: getBinaryTypeName - unknown type", () => {
        assert.strictEqual(getBinaryTypeName(99), "UNKNOWN(99)");
    }),

    // ===== getCompactTypeName tests =====
    it("Thrift: getCompactTypeName - all type mappings", () => {
        assert.strictEqual(getCompactTypeName(1), "BOOLEAN_TRUE");
        assert.strictEqual(getCompactTypeName(2), "BOOLEAN_FALSE");
        assert.strictEqual(getCompactTypeName(3), "I8");
        assert.strictEqual(getCompactTypeName(4), "I16");
        assert.strictEqual(getCompactTypeName(5), "I32");
        assert.strictEqual(getCompactTypeName(6), "I64");
        assert.strictEqual(getCompactTypeName(7), "DOUBLE");
        assert.strictEqual(getCompactTypeName(8), "BINARY");
        assert.strictEqual(getCompactTypeName(9), "LIST");
        assert.strictEqual(getCompactTypeName(10), "SET");
        assert.strictEqual(getCompactTypeName(11), "MAP");
        assert.strictEqual(getCompactTypeName(12), "STRUCT");
        assert.strictEqual(getCompactTypeName(13), "UUID");
    }),

    it("Thrift: getCompactTypeName - unknown type", () => {
        assert.strictEqual(getCompactTypeName(99), "UNKNOWN(99)");
    }),

    // ===== writeValue tests - basic types =====
    it("Thrift: writeValue - BOOL true", () => {
        const bytes = [];
        const typeMap = { "BOOL": 2 };
        writeValue("BOOL", true, bytes, typeMap);
        assert.deepStrictEqual(bytes, [1]);
    }),

    it("Thrift: writeValue - BOOL false", () => {
        const bytes = [];
        const typeMap = { "BOOL": 2 };
        writeValue("BOOL", false, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0]);
    }),

    it("Thrift: writeValue - I8 zero", () => {
        const bytes = [];
        const typeMap = { "I8": 3 };
        writeValue("I8", 0, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0]);
    }),

    it("Thrift: writeValue - I8 positive", () => {
        const bytes = [];
        const typeMap = { "I8": 3 };
        writeValue("I8", 42, bytes, typeMap);
        assert.deepStrictEqual(bytes, [42]);
    }),

    it("Thrift: writeValue - I8 max", () => {
        const bytes = [];
        const typeMap = { "I8": 3 };
        writeValue("I8", 127, bytes, typeMap);
        assert.deepStrictEqual(bytes, [127]);
    }),

    it("Thrift: writeValue - I16", () => {
        const bytes = [];
        const typeMap = { "I16": 6 };
        writeValue("I16", 0x1234, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0x12, 0x34]);
    }),

    it("Thrift: writeValue - I16 zero", () => {
        const bytes = [];
        const typeMap = { "I16": 6 };
        writeValue("I16", 0, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0, 0]);
    }),

    it("Thrift: writeValue - I32", () => {
        const bytes = [];
        const typeMap = { "I32": 8 };
        writeValue("I32", 0x12345678, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0x12, 0x34, 0x56, 0x78]);
    }),

    it("Thrift: writeValue - I32 zero", () => {
        const bytes = [];
        const typeMap = { "I32": 8 };
        writeValue("I32", 0, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0, 0, 0, 0]);
    }),

    it("Thrift: writeValue - I32 negative", () => {
        const bytes = [];
        const typeMap = { "I32": 8 };
        writeValue("I32", -1, bytes, typeMap);
        assert.deepStrictEqual(bytes, [0xFF, 0xFF, 0xFF, 0xFF]);
    }),

    it("Thrift: writeValue - I64", () => {
        const bytes = [];
        const typeMap = { "I64": 10 };
        writeValue("I64", "0x0102030405060708", bytes, typeMap);
        assert.deepStrictEqual(bytes, [0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    }),

    it("Thrift: writeValue - I64 zero", () => {
        const bytes = [];
        const typeMap = { "I64": 10 };
        writeValue("I64", "0", bytes, typeMap);
        assert.deepStrictEqual(bytes, [0, 0, 0, 0, 0, 0, 0, 0]);
    }),

    it("Thrift: writeValue - DOUBLE", () => {
        const bytes = [];
        const typeMap = { "DOUBLE": 4 };
        writeValue("DOUBLE", 3.14159, bytes, typeMap);
        assert.strictEqual(bytes.length, 8);
        // Verify it's a valid IEEE 754 double by reading it back
        const view = new DataView(new ArrayBuffer(8));
        bytes.forEach((b, i) => view.setUint8(i, b));
        assert.ok(Math.abs(view.getFloat64(0, false) - 3.14159) < 0.00001);
    }),

    it("Thrift: writeValue - DOUBLE zero", () => {
        const bytes = [];
        const typeMap = { "DOUBLE": 4 };
        writeValue("DOUBLE", 0.0, bytes, typeMap);
        assert.strictEqual(bytes.length, 8);
        const view = new DataView(new ArrayBuffer(8));
        bytes.forEach((b, i) => view.setUint8(i, b));
        assert.strictEqual(view.getFloat64(0, false), 0);
    }),

    it("Thrift: writeValue - DOUBLE negative", () => {
        const bytes = [];
        const typeMap = { "DOUBLE": 4 };
        writeValue("DOUBLE", -42.5, bytes, typeMap);
        assert.strictEqual(bytes.length, 8);
        const view = new DataView(new ArrayBuffer(8));
        bytes.forEach((b, i) => view.setUint8(i, b));
        assert.strictEqual(view.getFloat64(0, false), -42.5);
    }),

    it("Thrift: writeValue - BINARY empty string", () => {
        const bytes = [];
        const typeMap = { "BINARY": 11 };
        writeValue("BINARY", "", bytes, typeMap);
        assert.deepStrictEqual(bytes, [0, 0, 0, 0]);
    }),

    it("Thrift: writeValue - BINARY ASCII", () => {
        const bytes = [];
        const typeMap = { "BINARY": 11 };
        writeValue("BINARY", "hello", bytes, typeMap);
        const expected = [0, 0, 0, 5, ...new TextEncoder().encode("hello")];
        assert.deepStrictEqual(bytes, expected);
    }),

    it("Thrift: writeValue - BINARY UTF-8", () => {
        const bytes = [];
        const typeMap = { "BINARY": 11 };
        writeValue("BINARY", "你好", bytes, typeMap);
        const encoded = new TextEncoder().encode("你好");
        const expected = [0, 0, 0, encoded.length, ...Array.from(encoded)];
        assert.deepStrictEqual(bytes, expected);
    }),

    // ===== writeValue tests - collections =====
    it("Thrift: writeValue - LIST of I32 empty", () => {
        const bytes = [];
        const typeMap = { "I32": 8, "LIST": 15 };
        const listValue = { elementType: "I32", elements: [] };
        writeValue("LIST", listValue, bytes, typeMap);
        assert.deepStrictEqual(bytes, [8, 0, 0, 0, 0]);
    }),

    it("Thrift: writeValue - LIST of I32", () => {
        const bytes = [];
        const typeMap = { "I32": 8, "LIST": 15 };
        const listValue = { elementType: "I32", elements: [1, 2, 3] };
        writeValue("LIST", listValue, bytes, typeMap);
        const expected = [
            8, // element type (I32)
            0, 0, 0, 3, // list size = 3
            0, 0, 0, 1, // element 1
            0, 0, 0, 2, // element 2
            0, 0, 0, 3  // element 3
        ];
        assert.deepStrictEqual(bytes, expected);
    }),

    it("Thrift: writeValue - SET of BINARY", () => {
        const bytes = [];
        const typeMap = { "BINARY": 11, "SET": 14 };
        const setValue = { elementType: "BINARY", elements: ["a"] };
        writeValue("SET", setValue, bytes, typeMap);
        const encoded = new TextEncoder().encode("a");
        const expected = [
            11, // element type (BINARY)
            0, 0, 0, 1, // set size = 1
            0, 0, 0, 1, // string length
            ...encoded // string data
        ];
        assert.deepStrictEqual(bytes, expected);
    }),

    it("Thrift: writeValue - MAP empty", () => {
        const bytes = [];
        const typeMap = { "I32": 8, "BINARY": 11, "MAP": 13 };
        const mapValue = { keyType: "I32", valType: "BINARY", elements: [] };
        writeValue("MAP", mapValue, bytes, typeMap);
        assert.deepStrictEqual(bytes, [8, 11, 0, 0, 0, 0]); // key type, val type, size = 0
    }),

    it("Thrift: writeValue - MAP with entry", () => {
        const bytes = [];
        const typeMap = { "I32": 8, "BINARY": 11, "MAP": 13 };
        const mapValue = {
            keyType: "I32",
            valType: "BINARY",
            elements: [{ key: 1, val: "test" }]
        };
        writeValue("MAP", mapValue, bytes, typeMap);
        const encoded = new TextEncoder().encode("test");
        const expected = [
            8, 11, // key type, val type
            0, 0, 0, 1, // map size = 1
            0, 0, 0, 1, // key value
            0, 0, 0, 4, // val length
            ...encoded // val data
        ];
        assert.deepStrictEqual(bytes, expected);
    }),

    // ===== buildBinaryStruct tests =====
    it("Thrift: buildBinaryStruct - simple struct", () => {
        const bytes = [];
        // eslint-disable camelcase
        const jsonStruct = {
            field_1: { type: "I32", value: 42 }
        };
        // eslint-enable camelcase
        buildBinaryStruct(jsonStruct, bytes);
        const expected = [
            8, 0, 1, // field type (I32), field id = 1
            0, 0, 0, 42, // value
            0 // T_STOP
        ];
        assert.deepStrictEqual(bytes, expected);
    }),

    it("Thrift: buildBinaryStruct - multiple fields", () => {
        const bytes = [];
        // eslint-disable camelcase
        const jsonStruct = {
            field_1: { type: "I32", value: 42 },
            field_2: { type: "BINARY", value: "hello" }
        };
        // eslint-enable camelcase
        buildBinaryStruct(jsonStruct, bytes);
        // Should end with T_STOP
        assert.strictEqual(bytes[bytes.length - 1], 0);
    }),

    it("Thrift: buildBinaryStruct - BOOL field", () => {
        const bytes = [];
        // eslint-disable camelcase
        const jsonStruct = {
            field_1: { type: "BOOL", value: true }
        };
        // eslint-enable camelcase
        buildBinaryStruct(jsonStruct, bytes);
        const expected = [
            2, 0, 1, // field type (BOOL), field id = 1
            1, // value = true
            0 // T_STOP
        ];
        assert.deepStrictEqual(bytes, expected);
    }),

    it("Thrift: buildBinaryStruct - nested struct", () => {
        const bytes = [];
        // eslint-disable camelcase
        const jsonStruct = {
            field_1: {
                type: "STRUCT",
                value: {
                    field_1: { type: "I32", value: 10 }
                }
            }
        };
        // eslint-enable camelcase
        buildBinaryStruct(jsonStruct, bytes);
        // Should contain nested structure with T_STOP markers
        assert.ok(bytes.length > 0);
        assert.strictEqual(bytes[bytes.length - 1], 0); // ends with T_STOP
    }),

    it("Thrift: buildBinaryStruct - invalid field ID skipped", () => {
        const bytes = [];
        // eslint-disable camelcase
        const jsonStruct = {
            invalid_field: { type: "I32", value: 42 },
            field_1: { type: "I32", value: 10 }
        };
        // eslint-enable camelcase
        buildBinaryStruct(jsonStruct, bytes);
        // Should skip invalid_field and only process field_1
        assert.strictEqual(bytes[0], 8); // field type
        assert.strictEqual(bytes[3], 10); // field value
    }),

    // ===== readBinaryType tests =====
    it("Thrift: readBinaryType - BOOL true", () => {
        const bytes = new Uint8Array([1]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 2);
        assert.strictEqual(result.value, true);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readBinaryType - BOOL false", () => {
        const bytes = new Uint8Array([0]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 2);
        assert.strictEqual(result.value, false);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readBinaryType - I8", () => {
        const bytes = new Uint8Array([42]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 3);
        assert.strictEqual(result.value, 42);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readBinaryType - I16", () => {
        const bytes = new Uint8Array([0x12, 0x34]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 6);
        assert.strictEqual(result.value, 0x1234);
        assert.strictEqual(result.offset, 2);
    }),

    it("Thrift: readBinaryType - I32", () => {
        const bytes = new Uint8Array([0x12, 0x34, 0x56, 0x78]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 8);
        assert.strictEqual(result.value, 0x12345678);
        assert.strictEqual(result.offset, 4);
    }),

    it("Thrift: readBinaryType - I64", () => {
        const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x42]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 10);
        assert.strictEqual(result.value, "66");
        assert.strictEqual(result.offset, 8);
    }),

    it("Thrift: readBinaryType - DOUBLE", () => {
        const bytes = new Uint8Array(8);
        const view = new DataView(bytes.buffer);
        view.setFloat64(0, 3.14159, false);
        const result = readBinaryType(view, 0, 4);
        assert.ok(Math.abs(result.value - 3.14159) < 0.00001);
        assert.strictEqual(result.offset, 8);
    }),

    it("Thrift: readBinaryType - BINARY empty", () => {
        const bytes = new Uint8Array([0, 0, 0, 0]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 11);
        assert.strictEqual(result.value, "");
        assert.strictEqual(result.offset, 4);
    }),

    it("Thrift: readBinaryType - BINARY with data", () => {
        const str = "hello";
        const encoded = new TextEncoder().encode(str);
        const bytes = new Uint8Array([0, 0, 0, 5, ...encoded]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 11);
        assert.strictEqual(result.value, str);
        assert.strictEqual(result.offset, 9);
    }),

    it("Thrift: readBinaryType - LIST of I32", () => {
        const bytes = new Uint8Array([
            8, // element type (I32)
            0, 0, 0, 2, // size = 2
            0, 0, 0, 1, // element 1
            0, 0, 0, 2  // element 2
        ]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 15);
        assert.deepStrictEqual(result.value, [1, 2]);
        assert.strictEqual(result.offset, 13);
    }),

    it("Thrift: readBinaryType - LIST empty", () => {
        const bytes = new Uint8Array([8, 0, 0, 0, 0]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 15);
        assert.deepStrictEqual(result.value, []);
        assert.strictEqual(result.offset, 5);
    }),

    it("Thrift: readBinaryType - MAP", () => {
        const str = "key";
        const encoded = new TextEncoder().encode(str);
        const bytes = new Uint8Array([
            8, 11, // key type (I32), val type (BINARY)
            0, 0, 0, 1, // size = 1
            0, 0, 0, 1, // key value
            0, 0, 0, 3, // val length
            ...encoded // val data
        ]);
        const data = new DataView(bytes.buffer);
        const result = readBinaryType(data, 0, 13);
        assert.deepStrictEqual(result.value, [{ key: 1, val: "key" }]);
        assert.strictEqual(result.offset, 13);
    }),

    // ===== parseBinaryProtocol tests =====
    it("Thrift: parseBinaryProtocol - simple I32", () => {
        const bytes = new Uint8Array([
            8, 0, 1, // field type (I32), field id = 1
            0, 0, 0, 42, // value
            0 // T_STOP
        ]);
        const data = new DataView(bytes.buffer);
        const result = parseBinaryProtocol(data, 0);
        assert.deepStrictEqual(result.result.field_1, { type: "I32", value: 42 });
        assert.strictEqual(result.offset, 8);
    }),

    it("Thrift: parseBinaryProtocol - multiple fields", () => {
        const bytes = new Uint8Array([
            2, 0, 1, // BOOL field 1
            1, // value = true
            8, 0, 2, // I32 field 2
            0, 0, 0, 42, // value = 42
            0 // T_STOP
        ]);
        const data = new DataView(bytes.buffer);
        const result = parseBinaryProtocol(data, 0);
        assert.strictEqual(result.result.field_1.type, "BOOL");
        assert.strictEqual(result.result.field_1.value, true);
        assert.strictEqual(result.result.field_2.type, "I32");
        assert.strictEqual(result.result.field_2.value, 42);
    }),

    it("Thrift: parseBinaryProtocol - nested struct", () => {
        const bytes = new Uint8Array([
            12, 0, 1, // STRUCT field 1
            8, 0, 1, // nested I32 field 1
            0, 0, 0, 10, // value
            0, // nested T_STOP
            0 // outer T_STOP
        ]);
        const data = new DataView(bytes.buffer);
        const result = parseBinaryProtocol(data, 0);
        assert.ok(result.result.field_1);
        assert.strictEqual(result.result.field_1.type, "STRUCT");
        assert.deepStrictEqual(result.result.field_1.value.field_1, { type: "I32", value: 10 });
    }),

    // ===== readCompactType tests =====
    it("Thrift: readCompactType - I8", () => {
        const bytes = new Uint8Array([42]);
        const data = new DataView(bytes.buffer);
        const result = readCompactType(data, 0, 3);
        assert.strictEqual(result.value, 42);
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readCompactType - I16 zigzag", () => {
        // ZigZag of -1 is 1
        const bytes = new Uint8Array([1]);
        const data = new DataView(bytes.buffer);
        const result = readCompactType(data, 0, 4);
        assert.strictEqual(result.value, -1n);
    }),

    it("Thrift: readCompactType - I32 zigzag", () => {
        // ZigZag of 100 is 200
        const bytes = new Uint8Array([200]);
        const data = new DataView(bytes.buffer);
        const result = readCompactType(data, 0, 5);
        assert.strictEqual(result.value, 100n);
    }),

    it("Thrift: readCompactType - DOUBLE", () => {
        const bytes = new Uint8Array(8);
        const view = new DataView(bytes.buffer);
        view.setFloat64(0, 2.71828, true);
        const result = readCompactType(view, 0, 7);
        assert.ok(Math.abs(result.value - 2.71828) < 0.00001);
        assert.strictEqual(result.offset, 8);
    }),

    it("Thrift: readCompactType - BINARY empty", () => {
        const bytes = new Uint8Array([0]);
        const data = new DataView(bytes.buffer);
        const result = readCompactType(data, 0, 8);
        assert.strictEqual(result.value, "");
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: readCompactType - BINARY with data", () => {
        const str = "test";
        const encoded = new TextEncoder().encode(str);
        const bytes = new Uint8Array([4, ...encoded]);
        const data = new DataView(bytes.buffer);
        const result = readCompactType(data, 0, 8);
        assert.strictEqual(result.value, str);
        assert.strictEqual(result.offset, 5);
    }),

    // ===== parseCompactProtocol tests =====
    it("Thrift: parseCompactProtocol - empty struct", () => {
        const bytes = new Uint8Array([0]); // Just STOP
        const data = new DataView(bytes.buffer);
        const result = parseCompactProtocol(data, 0);
        assert.deepStrictEqual(result.result, {});
        assert.strictEqual(result.offset, 1);
    }),

    it("Thrift: parseCompactProtocol - boolean true field", () => {
        const bytes = new Uint8Array([
            0x11, // field modifier=1 (delta=1), type=1 (BOOL_TRUE)
            0 // STOP
        ]);
        const data = new DataView(bytes.buffer);
        const result = parseCompactProtocol(data, 0);
        assert.strictEqual(result.result.field_1.type, "BOOLEAN_TRUE");
        assert.strictEqual(result.result.field_1.value, true);
    }),

    it("Thrift: parseCompactProtocol - boolean false field", () => {
        const bytes = new Uint8Array([
            0x12, // field modifier=1 (delta=1), type=2 (BOOL_FALSE)
            0 // STOP
        ]);
        const data = new DataView(bytes.buffer);
        const result = parseCompactProtocol(data, 0);
        assert.strictEqual(result.result.field_1.type, "BOOLEAN_FALSE");
        assert.strictEqual(result.result.field_1.value, false);
    }),

]);
