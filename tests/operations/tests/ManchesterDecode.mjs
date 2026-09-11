/**
 * @author JasonYuan869 [github.com/JasonYuan869]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Manchester Decode: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: whitespace only",
        "input": " \t\r\n ",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: IEEE convention",
        "input": "1001011001",
        "expectedOutput": "01101",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: single zero",
        "input": "10",
        "expectedOutput": "0",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: single one",
        "input": "01",
        "expectedOutput": "1",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: leading zeroes and non-byte-aligned output",
        "input": "1010101001",
        "expectedOutput": "00001",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: whitespace within pairs",
        "input": "1 0\t0 1\r\n01 10 01",
        "expectedOutput": "01101",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: repeated bits",
        "input": "101010010101",
        "expectedOutput": "000111",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: Thomas convention",
        "input": "0110100110",
        "expectedOutput": "01101",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: Thomas zero",
        "input": "01",
        "expectedOutput": "0",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: Thomas one",
        "input": "10",
        "expectedOutput": "1",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject 00 (IEEE 802.3 (0 = 10, 1 = 01))",
        "input": "01 00",
        "expectedOutput": "Invalid Manchester pair '00' at bit offset 2 (whitespace excluded).",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject 11 (IEEE 802.3 (0 = 10, 1 = 01))",
        "input": "01 11",
        "expectedOutput": "Invalid Manchester pair '11' at bit offset 2 (whitespace excluded).",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: odd length (IEEE 802.3 (0 = 10, 1 = 01))",
        "input": "01 1",
        "expectedOutput": "Manchester input must contain an even number of signal levels.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject 00 (G. E. Thomas (0 = 01, 1 = 10))",
        "input": "01 00",
        "expectedOutput": "Invalid Manchester pair '00' at bit offset 2 (whitespace excluded).",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject 11 (G. E. Thomas (0 = 01, 1 = 10))",
        "input": "01 11",
        "expectedOutput": "Invalid Manchester pair '11' at bit offset 2 (whitespace excluded).",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: odd length (G. E. Thomas (0 = 01, 1 = 10))",
        "input": "01 1",
        "expectedOutput": "Manchester input must contain an even number of signal levels.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: single signal level",
        "input": "0",
        "expectedOutput": "Manchester input must contain an even number of signal levels.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: round trip (IEEE 802.3 (0 = 10, 1 = 01))",
        "input": "00010111001",
        "expectedOutput": "00010111001",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            },
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: round trip (G. E. Thomas (0 = 01, 1 = 10))",
        "input": "00010111001",
        "expectedOutput": "00010111001",
        "recipeConfig": [
            {
                "op": "Manchester Encode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            },
            {
                "op": "Manchester Decode",
                "args": [
                    "G. E. Thomas (0 = 01, 1 = 10)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject non-binary input 012",
        "input": "012",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject non-binary input 0x01",
        "input": "0x01",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject non-binary input 01,10",
        "input": "01,10",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: reject non-binary input hello",
        "input": "hello",
        "expectedOutput": "Input must contain only binary digits (0 and 1) and whitespace.",
        "recipeConfig": [
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            }
        ]
    },
    {
        "name": "Manchester Decode: text round trip through binary operations",
        "input": "Hello, 世界!\u0000",
        "expectedOutput": "Hello, 世界!\u0000",
        "recipeConfig": [
            {
                "op": "To Binary",
                "args": [
                    "Space",
                    8
                ]
            },
            {
                "op": "Manchester Encode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            },
            {
                "op": "Manchester Decode",
                "args": [
                    "IEEE 802.3 (0 = 10, 1 = 01)"
                ]
            },
            {
                "op": "From Binary",
                "args": [
                    "None",
                    8
                ]
            }
        ]
    }
]);
