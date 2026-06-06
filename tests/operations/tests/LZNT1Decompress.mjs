/**
 * LZNT1 tests.
 *
 * @author 0xThiebaut [thiebaut.dev]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "LZNT1 Compress: repeated input",
        input: "compressedtestdatacompressedalot",
        expectedOutput: "1a b0 00 63 6f 6d 70 72 65 73 73 00 65 64 74 65 73 74 64 61 04 74 61 07 88 61 6c 6f 74",
        recipeConfig: [
            {
                op: "LZNT1 Compress",
                args: []
            },
            {
                op: "To Hex",
                args: ["Space", 0]
            }
        ],
    },
    {
        name: "LZNT1 Decompress",
        input: "\x1a\xb0\x00compress\x00edtestda\x04ta\x07\x88alot",
        expectedOutput: "compressedtestdatacompressedalot",
        recipeConfig: [
            {
                op: "LZNT1 Decompress",
                args: []
            }
        ],
    },
    {
        name: "LZNT1 Compress: incompressible input",
        input: "abcdefghijklmnopqrstuvwxyz",
        expectedOutput: "19 30 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a",
        recipeConfig: [
            {
                op: "LZNT1 Compress",
                args: []
            },
            {
                op: "To Hex",
                args: ["Space", 0]
            }
        ],
    },
    {
        name: "LZNT1 Compress/Decompress: binary",
        input: "00 01 02 03 00 01 02 03 00 01 02 03 ff ff ff ff 00",
        expectedOutput: "00 01 02 03 00 01 02 03 00 01 02 03 ff ff ff ff 00",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Space"]
            },
            {
                op: "LZNT1 Compress",
                args: []
            },
            {
                op: "LZNT1 Decompress",
                args: []
            },
            {
                op: "To Hex",
                args: ["Space", 0]
            }
        ],
    },
    {
        name: "LZNT1 Compress/Decompress: single byte",
        input: "41",
        expectedOutput: "41",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "LZNT1 Compress",
                args: []
            },
            {
                op: "LZNT1 Decompress",
                args: []
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ],
    }
]);
