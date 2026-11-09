/**
 * FromUNIXTimestamp tests
 *
 * @author theoma59
 * @copyright Crown Copyright 2026
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From seconds UTC",
        input: "0",
        expectedOutput: "Thu 1 January 1970 00:00:00 UTC",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Seconds (s)", "UTC"]
            },
        ],
    },
    {
        name: "From milliseconds UTC",
        input: "1000",
        expectedOutput: "Thu 1 January 1970 00:00:01.000 UTC",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Milliseconds (ms)", "UTC"]
            },
        ],
    },
    {
        name: "From microseconds UTC",
        input: "5000000",
        expectedOutput: "Thu 1 January 1970 00:00:05.000 UTC",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Microseconds (μs)", "UTC"]
            },
        ],
    },
    {
        name: "From nanoseconds UTC",
        input: "3.6e+12",
        expectedOutput: "Thu 1 January 1970 01:00:00.000 UTC",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Nanoseconds (ns)", "UTC"]
            },
        ],
    },
    {
        name: "From seconds CET",
        input: "626572800",
        expectedOutput: "Thu 9 November 1989 01:00:00 CET",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Seconds (s)", "CET"]
            },
        ],
    },
    {
        name: "From seconds Pacific/Auckland",
        input: "1343347200",
        expectedOutput: "Fri 27 July 2012 12:00:00 Pacific/Auckland",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Seconds (s)", "Pacific/Auckland"]
            },
        ],
    },
    {
        name: "From invalid seconds UTC",
        input: "bad",
        expectedOutput: "Invalid input. UNIX timestamps look like 1751583600",
        recipeConfig: [
            {
                op: "From UNIX Timestamp",
                args: ["Seconds (s)", "UTC"]
            },
        ],
    },
]);
