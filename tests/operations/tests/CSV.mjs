/**
 * CSV tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXAMPLE_CSV = `A,B,C,D,E,F\r
1,2,3,4,5,6\r
",",;,',"""",,\r
"""hello""","a""1","multi\r
line",,,end\r
`;

TestRegister.addTests([
    {
        name: "CSV to JSON: Array of dictionaries",
        input: EXAMPLE_CSV,
        expectedOutput: JSON.stringify(
            [
                {
                    A: "1",
                    B: "2",
                    C: "3",
                    D: "4",
                    E: "5",
                    F: "6",
                },
                {
                    A: ",",
                    B: ";",
                    C: "'",
                    D: '"',
                    E: "",
                    F: "",
                },
                {
                    A: '"hello"',
                    B: 'a"1',
                    C: "multi\r\nline",
                    D: "",
                    E: "",
                    F: "end",
                },
            ],
            null,
            4,
        ),
        recipeConfig: [
            {
                op: "CSV to JSON",
                args: [",", "\r\n", "Array of dictionaries"],
            },
        ],
    },
    {
        name: "CSV to JSON: Array of arrays",
        input: EXAMPLE_CSV,
        expectedOutput: JSON.stringify(
            [
                ["A", "B", "C", "D", "E", "F"],
                ["1", "2", "3", "4", "5", "6"],
                [",", ";", "'", '"', "", ""],
                ['"hello"', 'a"1', "multi\r\nline", "", "", "end"],
            ],
            null,
            4,
        ),
        recipeConfig: [
            {
                op: "CSV to JSON",
                args: [",", "\r\n", "Array of arrays"],
            },
        ],
    },
    {
        name: "JSON to CSV: Array of dictionaries",
        input: JSON.stringify([
            {
                A: "1",
                B: "2",
                C: "3",
                D: "4",
                E: "5",
                F: "6",
            },
            {
                A: ",",
                B: ";",
                C: "'",
                D: '"',
                E: "",
                F: "",
            },
            {
                A: '"hello"',
                B: 'a"1',
                C: "multi\r\nline",
                D: "",
                E: "",
                F: "end",
            },
        ]),
        expectedOutput: EXAMPLE_CSV,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\r\n"],
            },
        ],
    },
    {
        name: "JSON to CSV: Array of arrays",
        input: JSON.stringify([
            ["A", "B", "C", "D", "E", "F"],
            ["1", "2", "3", "4", "5", "6"],
            [",", ";", "'", '"', "", ""],
            ['"hello"', 'a"1', "multi\r\nline", "", "", "end"],
        ]),
        expectedOutput: EXAMPLE_CSV,
        recipeConfig: [
            {
                op: "JSON to CSV",
                args: [",", "\r\n"],
            },
        ],
    },
]);
