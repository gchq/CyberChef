/**
 * String index lookup tests.
 *
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "String index lookup: zero-based semicolon list",
        input: "0;1;2;3;4;5;6;7;8;9",
        expectedOutput: "powershell",
        recipeConfig: [
            {
                op: "String index lookup",
                args: ["powershell", "Semi-colon", "Zero-based", false]
            }
        ]
    },
    {
        name: "String index lookup: one-based comma list",
        input: "1, 2, 3, 4, 5",
        expectedOutput: "abcde",
        recipeConfig: [
            {
                op: "String index lookup",
                args: ["abcde", "Comma", "One-based", false]
            }
        ]
    },
    {
        name: "String index lookup: skip invalid indexes",
        input: "0;99;1;-1;2",
        expectedOutput: "abc",
        recipeConfig: [
            {
                op: "String index lookup",
                args: ["abc", "Semi-colon", "Zero-based", true]
            }
        ]
    },
    {
        name: "String index lookup: default skips invalid tokens",
        input: "0;foo;1;99;2",
        expectedOutput: "abc",
        recipeConfig: [
            {
                op: "String index lookup",
                args: ["abc", "Semi-colon", "Zero-based"]
            }
        ]
    },
    {
        name: "String index lookup: strict out of range",
        input: "3",
        expectedOutput: "Index out of range: 3",
        recipeConfig: [
            {
                op: "String index lookup",
                args: ["abc", "Semi-colon", "Zero-based", false]
            }
        ]
    }
]);
