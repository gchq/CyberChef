/**
 * Change IP format tests.
 *
 * @author Chris Smith
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Change IP format: Dotted Decimal to Hex",
        input: "192.168.1.1",
        expectedOutput: "c0a80101",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Dotted Decimal", "Hex"],
            },
        ],
    }, {
        name: "Change IP format: Decimal to Dotted Decimal",
        input: "3232235777",
        expectedOutput: "192.168.1.1",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Decimal", "Dotted Decimal"],
            },
        ],
    }, {
        name: "Change IP format: Hex to Octal",
        input: "c0a80101",
        expectedOutput: "030052000401",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Hex", "Octal"],
            },
        ],
    }, {
        name: "Change IP format: Octal to Decimal",
        input: "030052000401",
        expectedOutput: "3232235777",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Octal", "Decimal"],
            },
        ],
    }, {
        name: "Change IP format: Decimal (Little Endian) to Dotted Decimal",
        input: "16885952",
        expectedOutput: "192.168.1.1",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Decimal (Little Endian)", "Dotted Decimal"],
            },
        ],
    }, {
        name: "Change IP format: Dotted Decimal to Decimal (Little Endian)",
        input: "192.168.1.1",
        expectedOutput: "16885952",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Dotted Decimal", "Decimal (Little Endian)"],
            },
        ],
    }, {
        name: "Change IP format: Octal (Little Endian) to Dotted Decimal",
        input: "0100324300",
        expectedOutput: "192.168.1.1",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Octal (Little Endian)", "Dotted Decimal"],
            },
        ],
    }, {
        name: "Change IP format: Dotted Decimal to Octal (Little Endian)",
        input: "192.168.1.1",
        expectedOutput: "0100324300",
        recipeConfig: [
            {
                op: "Change IP format",
                args: ["Dotted Decimal", "Octal (Little Endian)"],
            },
        ],
    },
]);
