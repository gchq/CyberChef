/**
 * Swap endianness tests.
 *
 * @author marko1olo
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Swap endianness: Hex data",
        input: "0123456789abcdef",
        expectedOutput: "67 45 23 01 ef cd ab 89",
        recipeConfig: [
            {
                op: "Swap endianness",
                args: ["Hex", 4, true],
            },
        ],
    },
    {
        name: "Swap endianness: empty data format",
        input: "hello",
        expectedOutput: "Data format must be Hex or Raw",
        recipeConfig: [
            {
                op: "Swap endianness",
                args: ["", 2, true],
            },
        ],
    },
]);
