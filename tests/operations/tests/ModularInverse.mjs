/**
 * Modular Inverse tests.
 *
 * @author p-leriche [philip.leriche@cantab.net]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Modular Inverse: basic example (3 mod 11)",
        input: "",
        expectedOutput: "4",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["3", "11"],
            },
        ],
    },
    {
        name: "Modular Inverse: another coprime pair (7 mod 26)",
        input: "",
        expectedOutput: "15",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["7", "26"],
            },
        ],
    },
    {
        name: "Modular Inverse: hexadecimal input (0x10 mod 0x11)",
        input: "",
        expectedOutput: "16",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["0x10", "0x11"],
            },
        ],
    },
    {
        name: "Modular Inverse: using input field for value",
        input: "5",
        expectedOutput: "21",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["", "26"],
            },
        ],
    },
    {
        name: "Modular Inverse: using input field for modulus",
        input: "17",
        expectedOutput: "7",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["5", ""],
            },
        ],
    },
    {
        name: "Modular Inverse: large number (RSA-like)",
        input: "",
        expectedOutput: "934281398294",
        recipeConfig: [
            {
                op: "Modular Inverse",
                args: ["65537", "9999999999999"],
            },
        ],
    },
]);
