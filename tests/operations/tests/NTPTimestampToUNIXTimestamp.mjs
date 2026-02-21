/**
 * Set NTP timestamp to UNIX timestamp tests.
 *
 * @author kossithedon
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Fixed-point decimal NTP Timestamp to Seconds UNIX Timestamp",
        input: "3923215437.1842400034",
        expectedOutput: "1714226637.4289672",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Seconds (s)"],
            },
        ],
    },
    {
        name: "Fixed-point decimal NTP Timestamp to Milliseconds UNIX Timestamp",
        input: "3923215437.1842400034",
        expectedOutput: "1714226637428.9673",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Milliseconds (ms)"],
            },
        ],
    },
    {
        name: "Fixed-point decimal NTP Timestamp to Microseconds UNIX Timestamp",
        input: "3923215437.1842400034",
        expectedOutput: "1714226637428967.2",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Microseconds (μs)"],
            },
        ],
    },
    {
        name: "Fixed-point decimal NTP Timestamp to Nanoseconds UNIX Timestamp",
        input: "3923215437.1842400034",
        expectedOutput: "1714226637428967200",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Nanoseconds (ns)"],
            },
        ],
    },
    {
        name: "Big-endian hexadecimal NTP Timestamp to Seconds UNIX Timestamp",
        input: "e9d784613df8dd8b",
        expectedOutput: "1714226657.2420785",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (big-endian)", "Seconds (s)"],
            },
        ],
    },
    {
        name: "Big-endian hexadecimal NTP Timestamp to Milliseconds UNIX Timestamp",
        input: "e9d784613df8dd8b",
        expectedOutput: "1714226657242.0786",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (big-endian)", "Milliseconds (ms)"],
            },
        ],
    },
    {
        name: "Big-endian hexadecimal NTP Timestamp to Microseconds UNIX Timestamp",
        input: "e9d784613df8dd8b",
        expectedOutput: "1714226657242078.5",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (big-endian)", "Microseconds (μs)"],
            },
        ],
    },
    {
        name: "Big-endian hexadecimal NTP Timestamp to Nanoseconds UNIX Timestamp",
        input: "e9d784613df8dd8b",
        expectedOutput: "1714226657242078500",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (big-endian)", "Nanoseconds (ns)"],
            },
        ],
    },
    {
        name: "Little-endian hexadecimal NTP Timestamp to Seconds UNIX Timestamp",
        input: "b8dd8fd316487d9e",
        expectedOutput: "1714226657.2420785",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (little-endian)", "Seconds (s)"],
            },
        ],
    },
    {
        name: "Little-endian hexadecimal NTP Timestamp to Milliseconds UNIX Timestamp",
        input: "b8dd8fd316487d9e",
        expectedOutput: "1714226657242.0786",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (little-endian)", "Milliseconds (ms)"],
            },
        ],
    },
    {
        name: "Little-endian hexadecimal NTP Timestamp to Microseconds UNIX Timestamp",
        input: "b8dd8fd316487d9e",
        expectedOutput: "1714226657242078.5",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (little-endian)", "Microseconds (μs)"],
            },
        ],
    },
    {
        name: "Little-endian hexadecimal NTP Timestamp to Nanoseconds UNIX Timestamp",
        input: "b8dd8fd316487d9e",
        expectedOutput: "1714226657242078500",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (little-endian)", "Nanoseconds (ns)"],
            },
        ],
    },
    {
        name: "Hexadecimal NTP Timestamp to UNIX Timestamp : too long hexadecimal NTP timestamp input",
        input: "e9d784613df8dd8bf",
        expectedOutput: "Error: NTP Timestamp should be 64 bits long",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (big-endian)", "Seconds (s)"],
            },
        ],
    },
    {
        name: "Hexadecimal NTP Timestamp to UNIX Timestamp : too short hexadecimal NTP timestamp input",
        input: "b8dd8fd316487d9",
        expectedOutput: "Error: NTP Timestamp should be 64 bits long",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Hex (little-endian)", "Seconds (s)"],
            },
        ],
    },
    {
        name: "NTP Timestamp to UNIX Timestamp : NTP Timestamp input unrecognised format",
        input: "60954b2d-7151-45c7-99cc-aca4ab664a8e",
        expectedOutput: "Unrecognised format",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["uuid", "Seconds (s)"],
            },
        ],
    },
    {
        name: "NTP Timestamp to UNIX Timestamp : UNIX Timestamp output unrecognised unit",
        input: "3923215437.1842400034",
        expectedOutput: "Unrecognised unit",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Hours"],
            },
        ],
    },
    {
        name: "NTP Timestamp to UNIX Timestamp : NTP timestamp seconds part is greater than the greatest 32 bits value 4294967296",
        input: "4294967297.1842400034",
        expectedOutput: "Error: Timestamp seconds part should be 32 bits long. The seconds part '4294967297' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '4294967296'",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Seconds (s)"],
            },
        ],
    },
    {
        name: "NTP Timestamp to UNIX Timestamp : NTP timestamp seconds fractions part is greater than the greatest 32 bits value 4294967296",
        input: "3923215437.4294967297",
        expectedOutput: "Error: Timestamp fractions seconds part should be 32 bits long. The fractions seconds part '4294967297' of the provided NTP timestamp exceeds the maximum positive integer representable in 32 bits '4294967296'",
        recipeConfig: [
            {
                op: "NTP Timestamp to UNIX Timestamp",
                args: ["Fixed-point decimal", "Seconds (s)"],
            },
        ],
    }

]);
