/**
 * XPRESS tests.
 *
 * @author MP Gowtham [gowthamrockerzzz@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([

    // MS-XCA section 3.1 worked example (plain LZ77, all literals).
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

    // MS-XCA section 3.1 worked example (plain LZ77): literals, then a
    // shared-nibble match with an LE16 raw length. The low nibble of
    // 0x0f selects the raw length and its high nibble feeds the next
    // match, which reads the trailing LE16 (0x0126).
    {
        name: "XPRESS Decompress: shared nibble and LE16 length",
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

    // Shared-nibble form without a raw length: nibble 13 + 10.
    {
        name: "XPRESS Decompress: nibble length",
        input: "ffffff7f6e07000d",
        expectedOutput: "n".repeat(24),
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

    // The shared-nibble half-byte survives literal runs: the low nibble
    // of 0x21 gives the first match its length, the literal 'B' does not
    // clear it, and the second match uses the high nibble.
    {
        name: "XPRESS Decompress: shared half-byte across a literal",
        input: "ffffff5f41070021420700",
        expectedOutput: "A".repeat(12) + "B".repeat(13),
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

    // One-byte raw length form: byte 0xd7 + 25 = 240.
    {
        name: "XPRESS Decompress: one-byte raw length",
        input: "ffff0000413142324333443445354636473748387f000fd7",
        expectedOutput: "A1B2C3D4E5F6G7H8".repeat(16),
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

    // LE16 raw lengths: 0xfffc + 3 = 65535, then a shared-nibble match
    // with LE16 0x116d + 3 = 4464, for 70000 bytes total.
    {
        name: "XPRESS Decompress: LE16 raw lengths",
        input: "ffffff7f570700fffffcffffffff6d11",
        expectedOutput: "W".repeat(70000),
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
