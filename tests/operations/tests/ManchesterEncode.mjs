/**
 * @author JasonYuan869 [github.com/JasonYuan869]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Manchester Encode: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: whitespace only",
        "input": " \t\r\n ",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: IEEE convention",
        "input": "01101",
        "expectedOutput": "1001011001",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: single zero",
        "input": "0",
        "expectedOutput": "10",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: single one",
        "input": "1",
        "expectedOutput": "01",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: leading zeroes and non-byte-aligned input",
        "input": "00001",
        "expectedOutput": "1010101001",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: whitespace",
        "input": "0 1\t1\r\n0 1",
        "expectedOutput": "1001011001",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: repeated bits",
        "input": "000111",
        "expectedOutput": "101010010101",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: Thomas convention",
        "input": "01101",
        "expectedOutput": "0110100110",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: Thomas zero",
        "input": "0",
        "expectedOutput": "01",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: Thomas one",
        "input": "1",
        "expectedOutput": "10",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: reject non-binary input 012",
        "input": "012",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: reject non-binary input 0x01",
        "input": "0x01",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: reject non-binary input 01,10",
        "input": "01,10",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Encode: reject non-binary input hello",
        "input": "hello",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    }
]);
