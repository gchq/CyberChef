/**
 * Brace Matching tests.
 *
 * @author DBHeise [david@heiseink.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Brace Matching Simple",
        input: "(test)",
        expectedOutput: "test",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["(", ")", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Simple with extra text",
        input: "this is a simple (test) of this function",
        expectedOutput: "test",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["(", ")", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Simple with strings",
        input: "{test \"}\"}",
        expectedOutput: "test \"}\"",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["{", "}", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Simple with strings 2",
        input: "{test '}'}",
        expectedOutput: "test '}'",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["{", "}", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Simple nested",
        input: "[this [test] good]",
        expectedOutput: "this [test] good",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["[", "]", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Simple escaped",
        input: "<test \\> foo bar>",
        expectedOutput: "test \\> foo bar",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["<", ">", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Complex multi nesting 1",
        input: "(((((test)))))(((((test)))))",
        expectedOutput: "((((test))))",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["(", ")", "\"'", "\\"]
            }
        ]
    },
    {
        name: "Brace Matching Complex multi nesting 2",
        input: "(((((test))))(((((test))))))",
        expectedOutput: "((((test))))(((((test)))))",
        recipeConfig: [
            {
                "op": "Brace Matching",
                "args": ["(", ")", "\"'", "\\"]
            }
        ]
    }
]);

