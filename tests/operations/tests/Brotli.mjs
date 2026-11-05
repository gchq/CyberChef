/**
 * Brotli tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Brotli Decompress: known stream",
        input: "0b0b805468652063617420736174206f6e20746865206d61742e03",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {op: "From Hex", args: ["None"]},
            {op: "Brotli Decompress", args: []}
        ]
    },
    {
        name: "Brotli: quality 0 round trip",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {op: "Brotli Compress", args: [0]},
            {op: "Brotli Decompress", args: []}
        ]
    },
    {
        name: "Brotli: quality 11 round trip",
        input: "The quick brown fox jumps over the lazy dog.",
        expectedOutput: "The quick brown fox jumps over the lazy dog.",
        recipeConfig: [
            {op: "Brotli Compress", args: [11]},
            {op: "Brotli Decompress", args: []}
        ]
    },
    {
        name: "Brotli: binary round trip",
        input: "00010203fcfdfeff",
        expectedOutput: "00010203fcfdfeff",
        recipeConfig: [
            {op: "From Hex", args: ["None"]},
            {op: "Brotli Compress", args: [6]},
            {op: "Brotli Decompress", args: []},
            {op: "To Hex", args: ["None", 0]}
        ]
    },
    {
        name: "Brotli Decompress: invalid data",
        input: "00010203",
        expectedOutput: "Unable to decompress Brotli data.",
        recipeConfig: [
            {op: "From Hex", args: ["None"]},
            {op: "Brotli Decompress", args: []}
        ]
    }
]);
