/**
 * Media operation tests.
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Append empty",
        input: "test",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Append", args: ["", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Append empty input",
        input: "",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Append", args: ["test", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Append with input and text",
        input: "hello ",
        expectedOutput: "hello world",
        recipeConfig: [
            { op: "Append", args: ["world", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Append with space delim",
        input: "hello world",
        expectedOutput: "hello: world:",
        recipeConfig: [
            { op: "Append", args: [":", "Space"] } // [text, delimiter]
        ]
    }
]);
