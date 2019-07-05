/**
 * JSON to CSV tests.
 *
 * @author mshwed [m@ttshwed.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister";

const EXPECTED_CSV_SINGLE = "a,b,c\r\n1,2,3\r\n";
const EXPECTED_CSV_MULTIPLE = "a,b,c\r\n1,2,3\r\n1,2,3\r\n";
const EXPECTED_CSV_EMPTY = "\r\n\r\n";

TestRegister.addTests([
    {
        name: "JSON to CSV: strings as values",
        input: JSON.stringify({a: "1", b: "2", c: "3"}),
        expectedOutput: EXPECTED_CSV_SINGLE,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: numbers as values",
        input: JSON.stringify({a: 1, b: 2, c: 3}),
        expectedOutput: EXPECTED_CSV_SINGLE,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: numbers and strings as values",
        input: JSON.stringify({a: 1, b: "2", c: 3}),
        expectedOutput: EXPECTED_CSV_SINGLE,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: JSON as an array",
        input: JSON.stringify([{a: 1, b: "2", c: 3}]),
        expectedOutput: EXPECTED_CSV_SINGLE,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: multiple JSON values in an array",
        input: JSON.stringify([{a: 1, b: "2", c: 3}, {a: 1, b: "2", c: 3}]),
        expectedOutput: EXPECTED_CSV_MULTIPLE,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: empty JSON",
        input: JSON.stringify({}),
        expectedOutput: EXPECTED_CSV_EMPTY,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: empty JSON in array",
        input: JSON.stringify([{}]),
        expectedOutput: EXPECTED_CSV_EMPTY,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    }
]);
