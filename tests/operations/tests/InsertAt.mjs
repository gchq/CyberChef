/**
 * Media operation tests.
 * @author oliver-mitchell [oliver@polymerlabs.dev]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Insert At empty",
        input: "test",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Insert At", args: ["", 0, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At empty input",
        input: "",
        expectedOutput: "test",
        recipeConfig: [
            { op: "Insert At", args: ["test", 0, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At with input and text",
        input: "hello ",
        expectedOutput: "hello world",
        recipeConfig: [
            { op: "Insert At", args: ["world", 6, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At negative",
        input: " world",
        expectedOutput: "hello world",
        recipeConfig: [
            { op: "Insert At", args: ["hello", -5, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At beyond string length",
        input: "hello ",
        expectedOutput: "hello world",
        recipeConfig: [
            { op: "Insert At", args: ["world", 100, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At inside",
        input: "heo",
        expectedOutput: "hello",
        recipeConfig: [
            { op: "Insert At", args: ["ll", 2, "None"] } // [text, index, delimiter]
        ]
    },
    {
        name: "Insert At with space delim",
        input: "hello world",
        expectedOutput: "he:llo wo:rld",
        recipeConfig: [
            { op: "Insert At", args: [":", 2, "Space"] } // [text, index, delimiter]
        ]
    }
]);
