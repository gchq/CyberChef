/**
 * BitwiseOp tests
 *
 * @author h345983745
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "BLAKE2s: 256 - Hello World",
        input: "Hello World",
        expectedOutput: "7706af019148849e516f95ba630307a2018bb7bf03803eca5ed7ed2c3c013513",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["256", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2s: 160 - Hello World",
        input: "Hello World",
        expectedOutput: "0e4fcfc2ee0097ac1d72d70b595a39e09a3c7c7e",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["160", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2s: 128 - Hello World",
        input: "Hello World",
        expectedOutput: "9964ee6f36126626bf864363edfa96f6",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["128", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2s: Key Test",
        input: "Hello World",
        expectedOutput: "9964ee6f36126626bf864363edfa96f6",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["128", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2s: 224 - Hello World",
        input: "Hello World",
        expectedOutput: "8a74d9e5c5de9c8a0cb1c292f65808831717e422302f3d58853d58ed",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["224", "Hex", {string: "", option: "UTF8"}] }
        ]
    },
    {
        name: "BLAKE2s: 192 - Hello World",
        input: "Hello World",
        expectedOutput: "cc181c0f167a1727308d894c6182bbe6c4865698e7f7bfac",
        recipeConfig: [
            { "op": "BLAKE2s",
                "args": ["192", "Hex", {string: "", option: "UTF8"}] }
        ]
    }
]);
