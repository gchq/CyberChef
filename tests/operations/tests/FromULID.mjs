/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "From ULID: zero",
        "input": "00000000000000000000000000",
        "expectedOutput": "00000000000000000000000000000000",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: maximum",
        "input": "7ZZZZZZZZZZZZZZZZZZZZZZZZZ",
        "expectedOutput": "ffffffffffffffffffffffffffffffff",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: canonical",
        "input": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
        "expectedOutput": "01563e3ab5d3d6764c61efb99302bd5b",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: byte order",
        "input": "00041061050R3GG28A1C60T3GF",
        "expectedOutput": "000102030405060708090a0b0c0d0e0f",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: lowercase",
        "input": "01arz3ndektsv4rrffq69g5fav",
        "expectedOutput": "01563e3ab5d3d6764c61efb99302bd5b",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: surrounding whitespace",
        "input": " \n01ARZ3NDEKTSV4RRFFQ69G5FAV\t",
        "expectedOutput": "01563e3ab5d3d6764c61efb99302bd5b",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            },
            {
                "op": "To Hex",
                "args": [
                    "None",
                    0
                ]
            }
        ]
    },
    {
        "name": "From ULID: empty",
        "input": "",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: too short",
        "input": "0000000000000000000000000",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: too long",
        "input": "000000000000000000000000000",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: overflow",
        "input": "80000000000000000000000000",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: letter overflow",
        "input": "ZZZZZZZZZZZZZZZZZZZZZZZZZZ",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: internal space",
        "input": "000000000000 0000000000000",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: excluded I",
        "input": "0000000000000000000000000I",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: excluded L",
        "input": "0000000000000000000000000L",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: excluded O",
        "input": "0000000000000000000000000O",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    },
    {
        "name": "From ULID: excluded U",
        "input": "0000000000000000000000000U",
        "expectedOutput": "Enter a valid 26-character ULID (maximum 7ZZZZZZZZZZZZZZZZZZZZZZZZZ).",
        "recipeConfig": [
            {
                "op": "From ULID",
                "args": []
            }
        ]
    }
]);
