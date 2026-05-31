/**
 * Pseudo-Random operation tests.
 *
 * @author paulolokaux-sudo
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Pseudo-Random Number Generator: negative byte count",
        input: "",
        expectedOutput: "Number of bytes must be a non-negative integer.",
        recipeConfig: [
            {
                op: "Pseudo-Random Number Generator",
                args: [-32, "Hex"]
            }
        ]
    },
    {
        name: "Pseudo-Random Integer Generator: negative integer count",
        input: "",
        expectedOutput: "Number of Integers must be a positive integer.",
        recipeConfig: [
            {
                op: "Pseudo-Random Integer Generator",
                args: [-1, -10, -9, "Space", "Raw"]
            }
        ]
    }
]);
