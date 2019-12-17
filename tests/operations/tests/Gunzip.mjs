/**
 * Gunzip Tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Gunzip: No comment, no checksum and no filename",
        input: "1f8b0800f7c8f85d00ff0dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        expectedOutput: "The quick brown fox jumped over the slow dog",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Gunzip",
                args: []
            }
        ]
    },
    {
        name: "Gunzip: No comment, no checksum and filename",
        input: "1f8b080843c9f85d00ff66696c656e616d65000dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        expectedOutput: "The quick brown fox jumped over the slow dog",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Gunzip",
                args: []
            }
        ]
    },
    {
        name: "Gunzip: Has a comment, no checksum and has a filename",
        input: "1f8b08186fc9f85d00ff66696c656e616d6500636f6d6d656e74000dc9dd0180200804e0556ea8262848fb3dc588c6a7e76faa8aeedb726036c68d951f76bf9a0af8aae1f97d9c0c084b02509cbf8c2c000000",
        expectedOutput: "The quick brown fox jumped over the slow dog",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Gunzip",
                args: []
            }
        ]
    }
]);