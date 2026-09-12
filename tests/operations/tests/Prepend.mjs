/**
 * Media operation tests.
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Prepend empty",
        input: "test",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Prepend", args: ["", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Prepend empty input",
        input: "",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Prepend", args: ["test", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Prepend with input and text",
        input: " world",
        expectedOutput: "hello world",
        recipeConfig: [
            { op: "Prepend", args: ["hello", "None"] } // [text, delimiter]
        ]
    },
    {
        name: "Prepend with space delim",
        input: "hello world",
        expectedOutput: ":hello :world",
        recipeConfig: [
            { op: "Prepend", args: [":", "Space"] } // [text, delimiter]
        ]
    }
]);
