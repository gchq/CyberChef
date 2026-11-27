/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "To ULID: zero",
        "input": "00000000000000000000000000000000",
        "expectedOutput": "00000000000000000000000000",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: maximum",
        "input": "ffffffffffffffffffffffffffffffff",
        "expectedOutput": "7ZZZZZZZZZZZZZZZZZZZZZZZZZ",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: canonical",
        "input": "01563e3ab5d3d6764c61efb99302bd5b",
        "expectedOutput": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: byte order",
        "input": "000102030405060708090a0b0c0d0e0f",
        "expectedOutput": "00041061050R3GG28A1C60T3GF",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: rejects 0 bytes",
        "input": "",
        "expectedOutput": "ULID encoding requires exactly 16 bytes.",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: rejects 1 bytes",
        "input": "00",
        "expectedOutput": "ULID encoding requires exactly 16 bytes.",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: rejects 15 bytes",
        "input": "000000000000000000000000000000",
        "expectedOutput": "ULID encoding requires exactly 16 bytes.",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: rejects 17 bytes",
        "input": "0000000000000000000000000000000000",
        "expectedOutput": "ULID encoding requires exactly 16 bytes.",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    },
    {
        "name": "To ULID: rejects 32 bytes",
        "input": "0000000000000000000000000000000000000000000000000000000000000000",
        "expectedOutput": "ULID encoding requires exactly 16 bytes.",
        "recipeConfig": [
            {
                "op": "From Hex",
                "args": [
                    "Auto"
                ]
            },
            {
                "op": "To ULID",
                "args": []
            }
        ]
    }
]);
