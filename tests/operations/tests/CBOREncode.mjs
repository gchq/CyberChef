/**
 * CBOR Encode Tests.
 *
 * @author Danh4 [dan.h4@ncsc.gov.uk]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "CBOR Encode: Can encode integer",
        input: "15",
        expectedOutput: "0f",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Decode: Can encode decimal",
        input: "1.5",
        expectedOutput: "f9 3e 00",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Encode: Can encode text",
        input: '"Text"',
        expectedOutput: "64 54 65 78 74",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Encode: Can encode boolean true",
        input: "true",
        expectedOutput: "f5",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Encode: Can encode boolean false",
        input: "false",
        expectedOutput: "f4",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Encode: Can encode map",
        input: JSON.stringify({ a: 1, b: 2, c: 3 }),
        expectedOutput: "a3 61 61 01 61 62 02 61 63 03",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    },
    {
        name: "CBOR Encode: Can encode list",
        input: "[0,1,2]",
        expectedOutput: "83 00 01 02",
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: []
            },
            {
                op: "To Hex",
                args: []
            }
        ]
    }
]);
