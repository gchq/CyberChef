/**
 * Parse TLV tests.
 *
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse TLV: LengthValue",
        input: "\x05\x48\x6f\x75\x73\x65\x04\x72\x6f\x6f\x6d\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"length": 5, "value": [72, 111, 117, 115, 101]}, {"length": 4, "value": [114, 111, 111, 109]}, {"length": 4, "value": [100, 111, 111, 114]}], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [0, 1, false]
            }
        ]
    },
    {
        name: "Parse TLV: LengthValue with BER",
        input: "\x05\x48\x6f\x75\x73\x65\x04\x72\x6f\x6f\x6d\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"length": 5, "value": [72, 111, 117, 115, 101]}, {"length": 4, "value": [114, 111, 111, 109]}, {"length": 4, "value": [100, 111, 111, 114]}], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [0, 4, true] // length value is patently wrong, should be ignored by BER.
            }
        ]
    },
    {
        name: "Parse TLV: KeyLengthValue",
        input: "\x04\x05\x48\x6f\x75\x73\x65\x05\x04\x72\x6f\x6f\x6d\x42\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"key": [4], "length": 5, "value": [72, 111, 117, 115, 101]}, {"key": [5], "length": 4, "value": [114, 111, 111, 109]}, {"key": [66], "length": 4, "value": [100, 111, 111, 114]}], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [1, 1, false]
            }
        ]
    },
    {
        name: "Parse TLV: KeyLengthValue with BER",
        input: "\x04\x05\x48\x6f\x75\x73\x65\x05\x04\x72\x6f\x6f\x6d\x42\x04\x64\x6f\x6f\x72",
        expectedOutput: JSON.stringify([{"key": [4], "length": 5, "value": [72, 111, 117, 115, 101]}, {"key": [5], "length": 4, "value": [114, 111, 111, 109]}, {"key": [66], "length": 4, "value": [100, 111, 111, 114]}], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [1, 4, true] // length value is patently wrong, should be ignored by BER.
            }
        ]
    },
    {
        name: "Parse TLV: BER long-form length (two-byte length encoding)",
        input: "\x01\x82\x01\x00" + "A".repeat(256) + "\x02\x03\x41\x42\x43",
        expectedOutput: JSON.stringify([
            {"key": [1], "length": 256, "value": Array(256).fill(65)},
            {"key": [2], "length": 3, "value": [65, 66, 67]}
        ], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [1, 1, true]
            }
        ]
    },
    {
        name: "Parse TLV: BER long-form length (one-byte length encoding)",
        input: "\x01\x81\x80" + "B".repeat(128),
        expectedOutput: JSON.stringify([
            {"key": [1], "length": 128, "value": Array(128).fill(66)}
        ], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [1, 1, true]
            }
        ]
    },
    {
        name: "Parse TLV: BER multiple entries with mixed short and long-form lengths",
        input: "\x01\x05\x48\x65\x6c\x6c\x6f\x02\x81\x05\x57\x6f\x72\x6c\x64",
        expectedOutput: JSON.stringify([
            {"key": [1], "length": 5, "value": [72, 101, 108, 108, 111]},
            {"key": [2], "length": 5, "value": [87, 111, 114, 108, 100]}
        ], null, 4),
        recipeConfig: [
            {
                "op": "Parse TLV",
                "args": [1, 1, true]
            }
        ]
    }
]);
