/**
 * BLAKE3 tests.
 * @author xumptex [xumptex@outlook.fr]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "BLAKE3: 8 - Hello world",
        input: "Hello world",
        expectedOutput: "e7e6fb7d2869d109",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, ""] }
        ]
    },
    {
        name: "BLAKE3: 16 - Hello world 2",
        input: "Hello world 2",
        expectedOutput: "2a3df5fe5f0d3fcdd995fc203c7f7c52",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [16, ""] }
        ]
    },
    {
        name: "BLAKE3: 32 - Hello world",
        input: "Hello world",
        expectedOutput: "e7e6fb7d2869d109b62cdb1227208d4016cdaa0af6603d95223c6a698137d945",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [32, ""] }
        ]
    },
    {
        name: "BLAKE3: Key Test",
        input: "Hello world",
        expectedOutput: "59dd23ac9d025690",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, "ThiskeyisexactlythirtytwoBytesLo"] }
        ]
    },
    {
        name: "BLAKE3: Key Test 2",
        input: "Hello world",
        expectedOutput: "c8302c9634c1da42",
        recipeConfig: [
            { "op": "BLAKE3",
                "args": [8, "ThiskeyisexactlythirtytwoByteslo"] }
        ]
    }
]);
