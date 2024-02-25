/**
 * CBOR Decode Tests
 *
 * @author Danh4 [dan.h4@ncsc.gov.uk]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "CBOR Decode: Can decode integer",
        input: "0f",
        expectedOutput: "15",
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
        ],
    },
    {
        name: "CBOR Decode: Can decode decimal",
        input: "f9 3e 00",
        expectedOutput: "1.5",
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can decode text",
        input: "64 54 65 78 74",
        expectedOutput: '"Text"',
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can decode boolean true",
        input: "f5",
        expectedOutput: "true",
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can decode boolean false",
        input: "f4",
        expectedOutput: "false",
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can decode map",
        input: "a3 61 61 01 61 62 02 61 63 03",
        expectedOutput: JSON.stringify({ a: 1, b: 2, c: 3 }),
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can decode list",
        input: "83 00 01 02",
        expectedOutput: "[0,1,2]",
        recipeConfig: [
            {
                op: "From Hex",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
    {
        name: "From Hex: Can round trip with encode",
        input: JSON.stringify({ a: 1, b: false, c: [1, 2, 3] }),
        expectedOutput: JSON.stringify({ a: 1, b: false, c: [1, 2, 3] }),
        recipeConfig: [
            {
                op: "CBOR Encode",
                args: [],
            },
            {
                op: "CBOR Decode",
                args: [],
            },
            {
                op: "JSON Minify",
                args: [],
            },
        ],
    },
]);
