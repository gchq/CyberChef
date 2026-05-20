/**
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Insert space every 8 characters",
        input: "010010000110010101101100011011000110111100100000010101110110111101110010011011000110010000100001",
        expectedOutput: "01001000 01100101 01101100 01101100 01101111 00100000 01010111 01101111 01110010 01101100 01100100 00100001",
        recipeConfig: [
            {
                "op": "Insert Delimiter",
                "args": [8, " "]
            },
        ],
    },
    {
        name: "Insert newline every 4 characters",
        input: "ABCDEFGHIJKL",
        expectedOutput: "ABCD\nEFGH\nIJKL",
        recipeConfig: [
            {
                "op": "Insert Delimiter",
                "args": [4, "\n"]
            },
        ],
    },
    {
        name: "Insert hyphen every 3 characters",
        input: "1234567890",
        expectedOutput: "123-456-789-0",
        recipeConfig: [
            {
                "op": "Insert Delimiter",
                "args": [3, "-"]
            },
        ],
    },
    {
        name: "Use a float as delimiter",
        input: "1234567890",
        expectedOutput: "123-456-789-0",
        recipeConfig: [
            {
                "op": "Insert Delimiter",
                "args": [3.4, "-"]
            },
        ],
    },
    {
        name: "Handle empty input gracefully",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Insert Delimiter",
                "args": [8, " "]
            },
        ],
    }
]);
