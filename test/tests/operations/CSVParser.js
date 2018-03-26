/**
 * CSVParser tests.
 *
 * @author Vimal Raghubir
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "Testing hello parsed to CSV",
        input: "hello",
        expectedOutput: "hello",
        recipeConfig: [
            {
                op: "String to CSV",
                args: [","],
            },
        ],
    },
    {
        name: "Testing hello world parsed to CSV",
        input: "['hello', 'world']",
        expectedOutput: "hello;world",
        recipeConfig: [
            {
                op: "String to CSV",
                args: [";"],
            },
        ],
    },
    {
        name: "Testing false parsed to CSV",
        input: false,
        expectedOutput: "The passed in data is not a string that can be converted to a CSV.",
        recipeConfig: [
            {
                op: "String to CSV",
                args: [","],
            },
        ],
    },
    {
        name: "Testing ||| parsed to CSV",
        input: "|||",
        expectedOutput: "|||||",
        recipeConfig: [
            {
                op: "String to CSV",
                args: ["|"],
            },
        ],
    },
    {
        name: "Testing 0 parsed to CSV",
        input: 0,
        expectedOutput: "The passed in data is not a string that can be converted to a CSV.",
        recipeConfig: [
            {
                op: "String to CSV",
                args: [","],
            },
        ],
    },
    {
        name: "Testing 1,2,3,\n1,2, parsed to String",
        input: "1,2,3,\n,1,2,",
        expectedOutput: "[[1,2,3],[1,2]]",
        recipeConfig: [
            {
                op: "CSV to String",
                args: [","],
            },
        ],
    },
    {
        name: "Testing \n\n\n parsed to String",
        input: "\n\n\n",
        expectedOutput: "[[],[],[]]",
        recipeConfig: [
            {
                op: "CSV to String",
                args: [","],
            },
        ],
    },
    {
        name: "Testing 1,2,3,4,5 parsed to String",
        input: "1,2,3,4,5",
        expectedOutput: "[[1,2,3,4,5]]",
        recipeConfig: [
            {
                op: "CSV to String",
                args: ["|"],
            },
        ],
    },
    {
        name: "Testing 0 parsed to CSV",
        input: 0,
        expectedOutput: "The passed in data is not a string that can be converted to a CSV.",
        recipeConfig: [
            {
                op: "CSV to String",
                args: [","],
            },
        ],
    },
    {
        name: "Testing false parsed to CSV",
        input: false,
        expectedOutput: "The passed in data is not a string that can be converted to a CSV.",
        recipeConfig: [
            {
                op: "CSV to String",
                args: [","],
            },
        ],
    },
]);
