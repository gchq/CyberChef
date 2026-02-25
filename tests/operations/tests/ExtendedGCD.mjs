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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 1\n\n" +
            "Béut coefficients:\n" +
            "  x = 4\n" +
            "  y = -1\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (3) ×(4) + (11) ×(-1) = 1",
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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 2\n\n" +
            "Béut coefficients:\n" +
            "  x = -9\n" +
            "  y = 47\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (240) ×(-9) + (46) ×(47) = 2",
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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 17\n\n" +
            "Béut coefficients:\n" +
            "  x = 1\n" +
            "  y = 0\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (17) ×(1) + (0) ×(0) = 17",
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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 17\n\n" +
            "Béut coefficients:\n" +
            "  x = 1\n" +
            "  y = -15\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (255) ×(1) + (17) ×(-15) = 17",
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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 7\n\n" +
            "Béut coefficients:\n" +
            "  x = -2\n" +
            "  y = 3\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (42) ×(-2) + (35) ×(3) = 7",
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
        expectedOutput: "Extended Euclidean Algorithm Results:\n" +
            "=====================================\n\n" +
            "gcd(a, b) = 1\n\n" +
            "Béut coefficients:\n" +
            "  x = -80538738812075595\n" +
            "  y = 10000000000000000\n\n" +
            "Verification:\n" +
            "  a·x + b·y = gcd(a, b)\n" +
            "  (123456789012345678901234567890) ×(-80538738812075595) + (994064509324197316) ×(10000000000000000) = 1",
        recipeConfig: [
            {
                op: "Extended GCD",
                args: ["123456789012345678901234567890", "994064509324197316"],
            },
        ],
    },
]);
