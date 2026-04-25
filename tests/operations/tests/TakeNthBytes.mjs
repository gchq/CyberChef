/**
 * @author Oshawk [oshawk@protonmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

/**
 * Take nth bytes tests
 */
TestRegister.addTests([
    {
        name: "Take nth bytes: Nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Take nth bytes: Nothing (apply to each line)",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Take nth bytes: Basic single line",
        input: "0123456789",
        expectedOutput: "048",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Take nth bytes: Basic single line (apply to each line)",
        input: "0123456789",
        expectedOutput: "048",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Take nth bytes: Complex single line",
        input: "0123456789",
        expectedOutput: "59",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 5, false],
            },
        ],
    },
    {
        name: "Take nth bytes: Complex single line (apply to each line)",
        input: "0123456789",
        expectedOutput: "59",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 5, true],
            },
        ],
    },
    {
        name: "Take nth bytes: Basic multi line",
        input: "01234\n56789",
        expectedOutput: "047",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Take nth bytes: Basic multi line (apply to each line)",
        input: "01234\n56789",
        expectedOutput: "04\n59",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Take nth bytes: Complex multi line",
        input: "01234\n56789",
        expectedOutput: "\n8",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 5, false],
            },
        ],
    },
    {
        name: "Take nth bytes: Complex multi line (apply to each line)",
        input: "012345\n6789ab",
        expectedOutput: "5\nb",
        recipeConfig: [
            {
                op: "Take nth bytes",
                args: [4, 5, true],
            },
        ],
    }
]);
