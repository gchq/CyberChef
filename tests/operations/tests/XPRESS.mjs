/**
 * XPRESS tests.
 *
 * @author MP Gowtham [mpgowtham@users.noreply.github.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([

    // MS-XCA section 3.1 worked example (plain LZ77).
    {
        name: "XPRESS Decompress: worked example",
        input: "0000000047484f53542f2f5245434f5645522064617461207265636f7665727920656e67ffffff07696e652e0a",
        expectedOutput: "GHOST//RECOVER data recovery engine.\n",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "XPRESS Decompress",
                "args": []
            }
        ]
    },

    // Matches with shared nibbles, raw lengths and 64 MiB of output.
    {
        name: "XPRESS Decompress: repeated string compression",
        input: "ffffff1f61626317000fff2601",
        expectedOutput: "abc".repeat(100),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "XPRESS Decompress",
                "args": []
            }
        ]
    },

    // Literals plus 65536-byte offset matches (anchor example).
    {
        name: "XPRESS Decompress: anchor example",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 30 23 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 02 00 00 00 00 00 00 00 00 00 00 00 00 00 00 20 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 a8 dc 00 00 ff 26 01",
        expectedOutput: "abc".repeat(100),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "XPRESS LZ77+Huffman Decompress",
                "args": [300]
            }
        ]
    },

    // MS-XCA section 3.1 worked example (LZ77+Huffman), ten repetitions.
    {
        name: "XPRESS LZ77+Huffman Decompress: worked example",
        input: "00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 03 00 00 00 00 00 00 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 06 00 00 00 00 00 50 66 55 55 66 65 55 45 65 55 55 65 55 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 50 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 b4 e3 a9 8f 5e e7 62 8e bc 5f ac 28 47 19 40 42 98 aa eb 89 7c da 20 5c 61 96 e4 b6 ff 38 01 00 00",
        expectedOutput: "The quick brown fox jumps over the lazy dog. ".repeat(8),
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "XPRESS LZ77+Huffman Decompress",
                "args": [360]
            }
        ]
    }
]);