/**
 * Gzip tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Gzip: No comment, no checksum and no filename",
        input: "The quick brown fox jumped over the slow dog",
        expectedOutput: "0dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        recipeConfig: [
            {
                op: "Gzip",
                args: ["Dynamic Huffman Coding", "", "", false]
            },
            {
                op: "Drop bytes",
                args: [0, 10, false]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "Gzip: No comment, no checksum and has a filename",
        input: "The quick brown fox jumped over the slow dog",
        expectedOutput: "636f6d6d656e74000dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        recipeConfig: [
            {
                op: "Gzip",
                args: ["Dynamic Huffman Coding", "comment", "", false]
            },
            {
                op: "Drop bytes",
                args: [0, 10, false]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "Gzip: Has a comment, no checksum and no filename",
        input: "The quick brown fox jumped over the slow dog",
        expectedOutput: "636f6d6d656e74000dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        recipeConfig: [
            {
                op: "Gzip",
                args: ["Dynamic Huffman Coding", "", "comment", false]
            },
            {
                op: "Drop bytes",
                args: [0, 10, false]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
    {
        name: "Gzip: Has a comment, no checksum and has a filename",
        input: "The quick brown fox jumped over the slow dog",
        expectedOutput: "66696c656e616d6500636f6d6d656e74000dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        recipeConfig: [
            {
                op: "Gzip",
                args: ["Dynamic Huffman Coding", "filename", "comment", false]
            },
            {
                op: "Drop bytes",
                args: [0, 10, false]
            },
            {
                op: "To Hex",
                args: ["None"]
            }
        ]
    },
]);
