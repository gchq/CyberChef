/**
 * From Decimal tests
 *
 * @author qistoph
 * @copyright Crown Copyright 2018
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From Decimal",
        input: "83 97 109 112 108 101 32 84 101 120 116",
        expectedOutput: "Sample Text",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Space", false]
            },
        ],
    },
    {
        name: "From Decimal with negatives",
        input: "-130,-140,-152,-151,115,33,0,-1",
        expectedOutput: "~this!\u0000\u00ff",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Comma", true]
            },
        ],
    },
    {
        name: "From Decimal with Auto delimiter (space)",
        input: "72 101 108 108 111",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Auto", false]
            },
        ],
    },
    {
        name: "From Decimal with Auto delimiter (comma)",
        input: "72,101,108,108,111",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Auto", false]
            },
        ],
    },
    {
        name: "From Decimal with Auto delimiter (mixed)",
        input: "72, 101 : 108; 108\t111",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Auto", false]
            },
        ],
    },
    {
        name: "From Decimal with Auto delimiter (newline)",
        input: "72\n101\n108\n108\n111",
        expectedOutput: "Hello",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Auto", false]
            },
        ],
    },
    {
        name: "From Decimal with Auto delimiter and signed values",
        input: "-130 -140 -152 -151 115 33 0 -1",
        expectedOutput: "~this!\u0000\u00ff",
        recipeConfig: [
            {
                op: "From Decimal",
                args: ["Auto", true]
            },
        ],
    },
]);
