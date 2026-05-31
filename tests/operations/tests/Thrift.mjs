/**
 * @author Engin Kaya
 * @author engin0223 [engineda2014@hotmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

// Helper to generate the exact 4-space indented JSON strings produced by the operation
const formatJson = (obj) => JSON.stringify(obj, null, 4);

TestRegister.addTests([
    // ==========================================
    // TBinaryProtocol Serialization Tests
    // ==========================================
    {
        name: "Thrift Serialize: TBinaryProtocol (Basic Types: I32, BINARY, BOOL)",
        input: JSON.stringify({
            "field_1": { "type": "I32", "value": 1337 },
            "field_2": { "type": "BINARY", "value": "Test" },
            "field_3": { "type": "BOOL", "value": true }
        }),
        // Hex breakdown:
        // Field 1 (I32): 08 00 01 00 00 05 39
        // Field 2 (STR): 0b 00 02 00 00 00 04 54 65 73 74
        // Field 3 (BOOL): 02 00 03 01
        // STOP: 00
        expectedOutput: "08 00 01 00 00 05 39 0b 00 02 00 00 00 04 54 65 73 74 02 00 03 01 00",
        recipeConfig: [
            { op: "Thrift Serialize", args: ["TBinaryProtocol"] },
            { op: "To Hex", args: ["Space", 0] }
        ]
    },
    {
        name: "Thrift Serialize: TBinaryProtocol (List of I32)",
        input: JSON.stringify({
            "field_1": {
                "type": "LIST",
                "value": {
                    "elementType": "I32",
                    "elements": [10, 20]
                }
            }
        }),
        // Hex breakdown:
        // Field 1 (LIST): 0f 00 01
        // Element Type (I32 = 08), Size (2 = 00 00 00 02)
        // Values: 00 00 00 0a, 00 00 00 14
        // STOP: 00
        expectedOutput: "0f 00 01 08 00 00 00 02 00 00 00 0a 00 00 00 14 00",
        recipeConfig: [
            { op: "Thrift Serialize", args: ["TBinaryProtocol"] },
            { op: "To Hex", args: ["Space", 0] }
        ]
    },

    // ==========================================
    // TBinaryProtocol Deserialization Tests
    // ==========================================
    {
        name: "Thrift Deserialize: TBinaryProtocol (Basic Types)",
        input: "08 00 01 00 00 05 39 0b 00 02 00 00 00 04 54 65 73 74 02 00 03 01 00",
        expectedOutput: formatJson({
            "field_1": { "type": "I32", "value": 1337 },
            "field_2": { "type": "BINARY", "value": "Test" },
            "field_3": { "type": "BOOL", "value": true }
        }),
        recipeConfig: [
            { op: "From Hex", args: ["Auto"] },
            { op: "Thrift Deserialize", args: ["TBinaryProtocol"] }
        ]
    },
    {
        name: "Thrift Deserialize: TBinaryProtocol (List of I32)",
        input: "0f 00 01 08 00 00 00 02 00 00 00 0a 00 00 00 14 00",
        expectedOutput: formatJson({
            "field_1": {
                "type": "LIST",
                "value": [10, 20]
            }
        }),
        recipeConfig: [
            { op: "From Hex", args: ["Auto"] },
            { op: "Thrift Deserialize", args: ["TBinaryProtocol"] }
        ]
    },

    // ==========================================
    // TCompactProtocol Deserialization Tests
    // ==========================================
    {
        name: "Thrift Deserialize: TCompactProtocol (Basic Types: I32, BINARY, BOOL)",
        // Hex breakdown for Compact Protocol:
        // Field 1 (I32, ID 1): Delta 1, Type 5 -> 15 | ZigZag(1337) = 2674 -> Varint = f2 14
        // Field 2 (STR, ID 2): Delta 1, Type 8 -> 18 | Len 4 -> 04 | "Test" -> 54 65 73 74
        // Field 3 (BOOL TRUE, ID 3): Delta 1, Type 1 -> 11
        // STOP: 00
        input: "15 f2 14 18 04 54 65 73 74 11 00",
        expectedOutput: formatJson({
            "field_1": { "type": "I32", "value": 1337 },
            "field_2": { "type": "BINARY", "value": "Test" },
            "field_3": { "type": "BOOL", "value": true }
        }),
        recipeConfig: [
            { op: "From Hex", args: ["Auto"] },
            { op: "Thrift Deserialize", args: ["TCompactProtocol"] }
        ]
    },
    {
        name: "Thrift Deserialize: TCompactProtocol (Negative Integers / ZigZag Verification)",
        // Validates that negative numbers correctly decode from ZigZag to normal integers
        // Field 1 (I32, ID 1): Delta 1, Type 5 -> 15 | ZigZag(-1337) = 2673 -> Varint = f1 14
        input: "15 f1 14 00",
        expectedOutput: formatJson({
            "field_1": { "type": "I32", "value": -1337 }
        }),
        recipeConfig: [
            { op: "From Hex", args: ["Auto"] },
            { op: "Thrift Deserialize", args: ["TCompactProtocol"] }
        ]
    }
]);
