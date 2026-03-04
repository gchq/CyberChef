/**
 * Modular Exponentiation tests.
 *
 * @author p-leriche [philip.leriche@cantab.net]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Modular Exponentiation: basic example (2^10 mod 1000)",
        input: "",
        expectedOutput: "24",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["2", "1000", "10"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: small values (3^5 mod 7)",
        input: "",
        expectedOutput: "5",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["3", "7", "5"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: exponent zero",
        input: "",
        expectedOutput: "1",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["999", "100", "0"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: base one",
        input: "",
        expectedOutput: "1",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["1", "1000", "999"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: hexadecimal input",
        input: "",
        expectedOutput: "256",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["0x10", "1000", "0x2"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: using input field for base",
        input: "5",
        expectedOutput: "6",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["", "7", "3"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: using input field for exponent",
        input: "4",
        expectedOutput: "5",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["2", "11", ""],
            },
        ],
    },
    {
        name: "Modular Exponentiation: RSA-like example (small)",
        input: "",
        expectedOutput: "561",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["123", "1000", "456"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: large base and exponent",
        input: "",
        expectedOutput: "560583526",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["123456789", "1000000007", "65537"],
            },
        ],
    },
    {
        name: "Modular Exponentiation: crypto-sized numbers (RSA-2048 simulation)",
        input: "",
        expectedOutput: "1",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: [
                    "12345678901234567890123456789012345678901234567890",
                    "99999999999999999999999999999999999999999999999999",
                    "0"
                ],
            },
        ],
    },
    {
        name: "Modular Exponentiation: Fermat's Little Theorem (a^(p-1) mod p = 1)",
        input: "",
        expectedOutput: "1",
        recipeConfig: [
            {
                op: "Modular Exponentiation",
                args: ["3", "11", "10"],
            },
        ],
    },
]);
