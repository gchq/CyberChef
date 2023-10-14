/**
 * FNV tests
 *
 * @author TheIndra55 [theindra@protonmail.com]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "FNV-1: 32-bit",
        input: "Hello, World",
        expectedOutput: "57c1791d",
        recipeConfig: [
            {
                op: "FNV-1",
                args: ["32"]
            }
        ]
    },
    {
        name: "FNV-1: 64-bit",
        input: "Hello, World",
        expectedOutput: "7b7fdc56f6a11b3d",
        recipeConfig: [
            {
                op: "FNV-1",
                args: ["64"]
            }
        ]
    },
    {
        name: "FNV-1: 128-bit",
        input: "Hello, World",
        expectedOutput: "19922cf5ab67a18bcfb7e8f3c7ccd435",
        recipeConfig: [
            {
                op: "FNV-1",
                args: ["128"]
            }
        ]
    },
    {
        name: "FNV-1: 256-bit",
        input: "Hello, World",
        expectedOutput: "3e3bfd5f1d1c0be4887134fce95e52c0f33f2931081c26330bdd7780eeb2ead",
        recipeConfig: [
            {
                op: "FNV-1",
                args: ["256"]
            }
        ]
    },
    {
        name: "FNV-1a: 32-bit",
        input: "Hello, World",
        expectedOutput: "66d37c5d",
        recipeConfig: [
            {
                op: "FNV-1a",
                args: ["32"]
            }
        ]
    },
    {
        name: "FNV-1a: 64-bit",
        input: "Hello, World",
        expectedOutput: "a28e0387da37a07d",
        recipeConfig: [
            {
                op: "FNV-1a",
                args: ["64"]
            }
        ]
    },
    {
        name: "FNV-1a: 128-bit",
        input: "Hello, World",
        expectedOutput: "5c9ecbd668e872034facb07b72b3a0c5",
        recipeConfig: [
            {
                op: "FNV-1a",
                args: ["128"]
            }
        ]
    },
    {
        name: "FNV-1a: 256-bit",
        input: "Hello, World",
        expectedOutput: "f7ce17afba5b7d52d482b4fce95e52c0f3400d0d29ad18dce0651d6d1cd936d",
        recipeConfig: [
            {
                op: "FNV-1a",
                args: ["256"]
            }
        ]
    }
]);
