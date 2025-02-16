/**
 * ExtractHashes tests.
 *
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract MD5 hash",
        input: "The quick brown fox jumps over the lazy dog\n\nMD5: 9e107d9d372bb6826bd81d3542a419d6",
        expectedOutput: "9e107d9d372bb6826bd81d3542a419d6",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [32, false, false]
            },
        ],
    },
    {
        name: "Extract SHA1 hash",
        input: "The quick brown fox jumps over the lazy dog\n\nSHA1: 2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
        expectedOutput: "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [40, false, false]
            },
        ],
    },
    {
        name: "Extract SHA256 hash",
        input: "The quick brown fox jumps over the lazy dog\n\nSHA256: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        expectedOutput: "d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [64, false, false]
            },
        ],
    },
    {
        name: "Extract SHA512 hash",
        input: "The quick brown fox jumps over the lazy dog\n\nSHA512: 07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6",
        expectedOutput: "07e547d9586f6a73f73fbac0435ed76951218fb7d0c8d788a309d785436bbb642e93a252a954f23912547d1e8a3b5ed6e1bfd7097821233fa0538f3db854fee6",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [128, false, false]
            },
        ],
    },
    {
        name: "Extract all hashes",
        input: "The quick brown fox jumps over the lazy dog\n\nMD5: 9e107d9d372bb6826bd81d3542a419d6\nSHA1: 2fd4e1c67a2d28fced849ee1bb76e7391b93eb12\nSHA256: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        expectedOutput: "9e107d9d372bb6826bd81d3542a419d6\n2fd4e1c67a2d28fced849ee1bb76e7391b93eb12\nd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [0, true, false]
            },
        ],
    },
    {
        name: "Extract hashes with total count",
        input: "The quick brown fox jumps over the lazy dog\n\nMD5: 9e107d9d372bb6826bd81d3542a419d6\nSHA1: 2fd4e1c67a2d28fced849ee1bb76e7391b93eb12\nSHA256: d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        expectedOutput: "Total Results: 3\n\n9e107d9d372bb6826bd81d3542a419d6\n2fd4e1c67a2d28fced849ee1bb76e7391b93eb12\nd7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592",
        recipeConfig: [
            {
                "op": "Extract hashes",
                "args": [0, true, true]
            },
        ],
    }
]);
