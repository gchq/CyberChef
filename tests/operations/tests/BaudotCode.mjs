/**
 * Baudot code tests.
 *
 * @author piggymoe [me@piggy.moe]
 *
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Baudot Code (BE)",
        input: "1+1 EQUALS 2",
        expectedOutput: "11011 10111 10001 10111 00100 11111 00001 10111 00111 00011 10010 00101 00100 11011 10011",
        recipeConfig: [
            {
                op: "To Baudot Code",
                args: ["Big-endian"],
            },
        ],
    },
    {
        name: "To Baudot Code (LE)",
        input: "1+1 EQUALS 2",
        expectedOutput: "11011 11101 10001 11101 00100 11111 10000 11101 11100 11000 01001 10100 00100 11011 11001",
        recipeConfig: [
            {
                op: "To Baudot Code",
                args: ["Little-endian"],
            },
        ],
    },
    {
        name: "From Baudot Code (BE)",
        input: "11011 10111 10001 10111 00100 11111 00001 10111 00111 00011 10010 00101 00100 11011 10011",
        expectedOutput: "1+1 EQUALS 2",
        recipeConfig: [
            {
                op: "From Baudot Code",
                args: ["Big-endian"],
            },
        ],
    },
    {
        name: "From Baudot Code (LE)",
        input: "11011 11101 10001 11101 00100 11111 10000 11101 11100 11000 01001 10100 00100 11011 11001",
        expectedOutput: "1+1 EQUALS 2",
        recipeConfig: [
            {
                op: "From Baudot Code",
                args: ["Little-endian"],
            },
        ],
    },
]);
