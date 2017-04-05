/**
 * ByteRepr tests.
 *
 * @author Matt C [matt@artemisbot.pw]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "To Octal: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "To Octal",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "From Octal: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "From Octal",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "To Octal: hello world",
        input: "hello world", // [104, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100],
        expectedOutput: "150 145 154 154 157 40 167 157 162 154 144",
        recipeConfig: [
            {
                "op": "To Octal",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "From Octal: hello world",
        input: "150 145 154 154 157 40 167 157 162 154 144",
        expectedOutput: "hello world",
        recipeConfig: [
            {
                "op": "From Octal",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "To Octal: Γειά σου",
        input: "Γειά σου", //[206,147,206,181,206,185,206,172,32,207,131,206,191,207,133],
        expectedOutput: "316 223 316 265 316 271 316 254 40 317 203 316 277 317 205",
        recipeConfig: [
            {
                "op": "To Octal",
                "args": ["Space"]
            }
        ]
    },
    {
        name: "From Octal: Γειά σου",
        input: "316 223 316 265 316 271 316 254 40 317 203 316 277 317 205",
        expectedOutput: "Γειά σου",
        recipeConfig: [
            {
                "op": "From Octal",
                "args": ["Space"]
            }
        ]
    },
]);