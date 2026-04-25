/**
 * JSON to CSV tests.
 *
 * @author mshwed [m@ttshwed.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

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
        name: "JSON to CSV: boolean and null as values",
        input: JSON.stringify({a: false, b: null, c: 3}),
        expectedOutput: "a,b,c\r\nfalse,null,3\r\n",
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
    },
    {
        name: "JSON to CSV: nested JSON",
        input: JSON.stringify({a: 1, b: {c: 2, d: 3}}),
        expectedOutput: "a,b.c,b.d\r\n1,2,3\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: nested array",
        input: JSON.stringify({a: 1, b: [2, 3]}),
        expectedOutput: "a,b.0,b.1\r\n1,2,3\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: nested JSON, nested array",
        input: JSON.stringify({a: 1, b: {c: [2, 3], d: 4}}),
        expectedOutput: "a,b.c.0,b.c.1,b.d\r\n1,2,3,4\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: nested array, nested JSON",
        input: JSON.stringify({a: 1, b: [{c: 3, d: 4}]}),
        expectedOutput: "a,b.0.c,b.0.d\r\n1,3,4\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: nested array, nested array",
        input: JSON.stringify({a: 1, b: [[2, 3]]}),
        expectedOutput: "a,b.0.0,b.0.1\r\n1,2,3\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    },
    {
        name: "JSON to CSV: nested JSON, nested JSON",
        input: JSON.stringify({a: 1, b: { c: { d: 2, e: 3}}}),
        expectedOutput: "a,b.c.d,b.c.e\r\n1,2,3\r\n",
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\\r\\n"]
            },
        ],
    }
]);
