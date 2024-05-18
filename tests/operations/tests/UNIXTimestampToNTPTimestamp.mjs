/**
 * Set UNIX Timestamp to NTP Timestamp tests.
 *
 * @author kossithedon
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Seconds UNIX Timestamp to Fixed-point decimal NTP Timestamp",
        input: "1714226657.2420785",
        expectedOutput: "3923215457.1039719424",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Seconds (s)", "Fixed-point decimal"],
            },
        ],
    },
    {
        name: "Milliseconds UNIX Timestamp to Fixed-point decimal NTP Timestamp ",
        input: "1714226657242.0786",
        expectedOutput: "3923215457.1039719424",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Milliseconds (ms)", "Fixed-point decimal"],
            },
        ],
    },
    {
        name: "Microseconds UNIX Timestamp to Fixed-point decimal NTP Timestamp ",
        input: "1714226657242078.5",
        expectedOutput: "3923215457.1039719424",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Microseconds (μs)", "Fixed-point decimal"],
            },
        ],
    },
    {
        name: "Nanoseconds UNIX Timestamp to Fixed-point decimal NTP Timestamp",
        input: "1714226657242078500",
        expectedOutput: "3923215457.1039719424",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Nanoseconds (ns)", "Fixed-point decimal"],
            },
        ],
    },
    {
        name: "Seconds UNIX Timestamp to Big-endian hexadecimal NTP Timestamp",
        input: "1714226657.2420785",
        expectedOutput: "e9d784613df8dc00",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Seconds (s)", "Hex (big-endian)"],
            },
        ],
    },
    {
        name: "Milliseconds UNIX Timestamp to Big-endian hexadecimal NTP Timestamp",
        input: "1714226657242.0786",
        expectedOutput: "e9d784613df8dc00",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Milliseconds (ms)", "Hex (big-endian)"],
            },
        ],
    },
    {
        name: "Microseconds UNIX Timestamp to Big-endian hexadecimal NTP Timestamp",
        input: "1714226657242078.5",
        expectedOutput: "e9d784613df8dc00",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Microseconds (μs)", "Hex (big-endian)"],
            },
        ],
    },
    {
        name: "Nanoseconds UNIX Timestamp to Big-endian hexadecimal NTP Timestamp",
        input: "1714226657242078500",
        expectedOutput: "e9d784613df8dc00",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Nanoseconds (ns)", "Hex (big-endian)"],
            },
        ],
    },
    {
        name: "Seconds UNIX Timestamp to Little-endian hexadecimal NTP Timestamp",
        input: "1714226657.2420785",
        expectedOutput: "00cd8fd316487d9e",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Seconds (s)", "Hex (little-endian)"],
            },
        ],
    },
    {
        name: "Milliseconds UNIX Timestamp to Little-endian hexadecimal NTP Timestamp",
        input: "1714226657242.0786",
        expectedOutput: "00cd8fd316487d9e",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Milliseconds (ms)", "Hex (little-endian)"],
            },
        ],
    },
    {
        name: "Microseconds UNIX Timestamp to Little-endian hexadecimal NTP Timestamp",
        input: "1714226657242078.5",
        expectedOutput: "00cd8fd316487d9e",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Microseconds (μs)", "Hex (little-endian)"],
            },
        ],
    },
    {
        name: "Nanoseconds UNIX Timestamp to Little-endian hexadecimal NTP Timestamp",
        input: "1714226657242078500",
        expectedOutput: "00cd8fd316487d9e",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Nanoseconds (ns)", "Hex (little-endian)"],
            },
        ],
    },
    {
        name: "UNIX Timestamp to NTP Timestamp : UNIX Timestamp input unrecognised format",
        input: "60954b2d-7151-45c7-99cc-aca4ab664a8e",
        expectedOutput: "Unrecognised unit",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["uuid", "Fixed-point decimal"],
            },
        ],
    },
    {
        name: "UNIX Timestamp to NTP Timestamp : UNIX Timestamp output unrecognised format",
        input: "1714226657.2420785",
        expectedOutput: "Unrecognised format",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Seconds (s)", "Floating-point", ],
            },
        ],
    },
    {
        name: "UNIX Timestamp to NTP Timestamp : NTP timestamp seconds part is greater than the greatest authorized value 2085978496",
        input: "2085978497",
        expectedOutput: "Error: The UNIX Timestamp seconds part '2085978497' exceeds the greatest authorized seconds value '2085978496' due to an incorrect provided UNIX timestamp",
        recipeConfig: [
            {
                op: "UNIX Timestamp to NTP Timestamp",
                args: ["Seconds (s)", "Fixed-point decimal"],
            },
        ],
    }

]);
