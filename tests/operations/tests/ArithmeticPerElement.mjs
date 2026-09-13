/**
 * Arithmetic per Element tests
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Arithmetic per Element: add to each value",
        input: "59 47 62 65 89 23 10",
        expectedOutput: "69 57 72 75 99 33 20",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Space", "Add", "10"] }],
    },
    {
        name: "Arithmetic per Element: repeated whitespace delimiter",
        input: "1   2\t3",
        expectedOutput: "2 3 4",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Space", "Add", "1"] }],
    },
    {
        name: "Arithmetic per Element: values are not limited to bytes",
        input: "250 300 1000",
        expectedOutput: "500 600 2000",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Space", "Multiply", "2"] }],
    },
    {
        name: "Arithmetic per Element: decimal division with comma delimiter",
        input: "3,4.5,-6",
        expectedOutput: "1.5,2.25,-3",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Comma", "Divide", "2"] }],
    },
    {
        name: "Arithmetic per Element: invalid list item",
        input: "1 two 3",
        expectedOutput: "Item 2 is not a valid finite number: two",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Space", "Add", "1"] }],
    },
    {
        name: "Arithmetic per Element: reject division by zero",
        input: "1 2 3",
        expectedOutput: "Cannot divide by zero.",
        recipeConfig: [{ op: "Arithmetic per Element", args: ["Space", "Divide", "0"] }],
    },
]);
