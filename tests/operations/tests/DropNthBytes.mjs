/**
 * @author Oshawk [oshawk@protonmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

/**
 * Drop nth bytes tests
 */
TestRegister.addTests([
    {
        name: "Drop nth bytes: Nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Drop nth bytes: Nothing (apply to each line)",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Drop nth bytes: Basic single line",
        input: "0123456789",
        expectedOutput: "1235679",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Drop nth bytes: Basic single line (apply to each line)",
        input: "0123456789",
        expectedOutput: "1235679",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Drop nth bytes: Complex single line",
        input: "0123456789",
        expectedOutput: "01234678",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 5, false],
            },
        ],
    },
    {
        name: "Drop nth bytes: Complex single line (apply to each line)",
        input: "0123456789",
        expectedOutput: "01234678",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 5, true],
            },
        ],
    },
    {
        name: "Drop nth bytes: Basic multi line",
        input: "01234\n56789",
        expectedOutput: "123\n5689",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, false],
            },
        ],
    },
    {
        name: "Drop nth bytes: Basic multi line (apply to each line)",
        input: "01234\n56789",
        expectedOutput: "123\n678",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 0, true],
            },
        ],
    },
    {
        name: "Drop nth bytes: Complex multi line",
        input: "01234\n56789",
        expectedOutput: "012345679",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 5, false],
            },
        ],
    },
    {
        name: "Drop nth bytes: Complex multi line (apply to each line)",
        input: "012345\n6789ab",
        expectedOutput: "01234\n6789a",
        recipeConfig: [
            {
                op: "Drop nth bytes",
                args: [4, 5, true],
            },
        ],
    }
]);
