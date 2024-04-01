/**
 * DateTime tests.
 *
 * @author bwhitn [brian.m.whitney@outlook.com]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Filetime to Unix",
        input: "129207366395297693",
        expectedOutput: "1276263039529769300",
        recipeConfig: [
            {
                op: "Windows Filetime to UNIX Timestamp",
                args: ["Nanoseconds (ns)", "Decimal"],
            },
        ],
    },
    {
        name: "Unix to Filetime",
        input: "1276263039529769300",
        expectedOutput: "129207366395297693",
        recipeConfig: [
            {
                op: "UNIX Timestamp to Windows Filetime",
                args: ["Nanoseconds (ns)", "Decimal"],
            },
        ],
    },
    {
        name: "DateTime Delta Positive",
        input: "20/02/2024 13:36:00",
        expectedOutput: "20/02/2024 13:37:00",
        recipeConfig: [
            {
                op: "DateTime Delta",
                args: ["Standard date and time", "DD/MM/YYYY HH:mm:ss", "Add", 0, 0, 1, 0],
            },
        ],
    },
    {
        name: "DateTime Delta Negative",
        input: "20/02/2024 14:37:00",
        expectedOutput: "20/02/2024 13:37:00",
        recipeConfig: [
            {
                op: "DateTime Delta",
                args: ["Standard date and time", "DD/MM/YYYY HH:mm:ss", "Subtract", 0, 1, 0, 0],
            },
        ],
    },
]);
