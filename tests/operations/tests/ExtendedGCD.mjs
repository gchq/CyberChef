/**
 * Extended GCD tests.
 *
 * @author p-leriche [philip.leriche@cantab.net]
 *
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extended GCD: coprime numbers (3, 11)",
        input: "",
        expectedOutput: "gcd: 1\n\nBezout coefficients:\nx = 4\ny = -1\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["3", "11"],
            },
        ],
    },
    {
        name: "Extended GCD: non-coprime numbers (240, 46)",
        input: "",
        expectedOutput: "gcd: 2\n\nBezout coefficients:\nx = -9\ny = 47\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["240", "46"],
            },
        ],
    },
    {
        name: "Extended GCD: with zero (17, 0)",
        input: "",
        expectedOutput: "gcd: 17\n\nBezout coefficients:\nx = 1\ny = 0\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["17", "0"],
            },
        ],
    },
    {
        name: "Extended GCD: hexadecimal input (0xFF, 0x11)",
        input: "",
        expectedOutput: "gcd: 17\n\nBezout coefficients:\nx = 0\ny = 1\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["0xFF", "0x11"],
            },
        ],
    },
    {
        name: "Extended GCD: using input field for value a",
        input: "42",
        expectedOutput: "gcd: 7\n\nBezout coefficients:\nx = 1\ny = -1\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["", "35"],
            },
        ],
    },
    {
        name: "Extended GCD: large numbers",
        input: "",
        expectedOutput: "gcd: 2\n\nBezout coefficients:\nx = 12703973750415151\ny = -1577756566311408967124629843\n\n",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["123456789012345678901234567890", "994064509324197316"],
            },
        ],
    },
]);
