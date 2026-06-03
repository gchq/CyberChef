/**
 * MOD tests
 *
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "MOD: Basic modulo operation",
        input: "15 4 7",
        expectedOutput: "0 1 1",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Single number",
        input: "10",
        expectedOutput: "1",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Comma-separated numbers",
        input: "15,8,23,16,5",
        expectedOutput: "1 1 2 2 5",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [7, "Comma"]
            }
        ],
    },
    {
        name: "MOD: Line feed separated numbers",
        input: "25\n13\n44\n7",
        expectedOutput: "0 3 4 2",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [5, "Line feed"]
            }
        ],
    },
    {
        name: "MOD: Tab-separated numbers",
        input: "20\t14\t8\t35",
        expectedOutput: "2 2 2 5",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [6, "Tab"]
            }
        ],
    },
    {
        name: "MOD: Large numbers",
        input: "123456789012345 987654321098765",
        expectedOutput: "123456789012345 987654321098765",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [1234567890123456, "Space"]
            }
        ],
    },
    {
        name: "MOD: Mixed with non-numeric values",
        input: "15 abc 4 def 7 xyz 23",
        expectedOutput: "0 1 1 2",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Decimal numbers",
        input: "10.5 15.7 8.2",
        expectedOutput: "1.5 0.7 2.2",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Negative numbers",
        input: "-15 -8 25 -10",
        expectedOutput: "0 -2 1 -1",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Zero in input",
        input: "0 5 10 15 20",
        expectedOutput: "0 2 1 0 2",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Modulus of 2 (even/odd check)",
        input: "1 2 3 4 5 6 7 8 9 10",
        expectedOutput: "1 0 1 0 1 0 1 0 1 0",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [2, "Space"]
            }
        ],
    },
    {
        name: "MOD: Numbers with extra whitespace",
        input: "  15   4   7  ",
        expectedOutput: "0 1 1",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Scientific notation",
        input: "1e3 2e2 5e1",
        expectedOutput: "1 2 2",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Floating point precision",
        input: "10.123456789 20.987654321",
        expectedOutput: "1.123456789 2.987654321",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [3, "Space"]
            }
        ],
    },
    {
        name: "MOD: Zero modulus error",
        input: "15 4 7",
        expectedError: true,
        expectedOutput: "MOD - Modulus cannot be zero",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [0, "Space"]
            }
        ],
    },
    {
        name: "MOD: Semi-colon separated numbers",
        input: "17;5;8;13",
        expectedOutput: "2 0 3 3",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [5, "Semi-colon"]
            }
        ],
    },
    {
        name: "MOD: Colon separated numbers",
        input: "25:9:14:7",
        expectedOutput: "1 1 2 3",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [4, "Colon"]
            }
        ],
    },
    {
        name: "MOD: CRLF separated numbers",
        input: "30\r\n18\r\n22\r\n11",
        expectedOutput: "0 0 4 5",
        recipeConfig: [
            {
                "op": "MOD",
                "args": [6, "CRLF"]
            }
        ],
    },
]);
