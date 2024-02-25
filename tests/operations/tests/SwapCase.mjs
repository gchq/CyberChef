/**
 * @author mikecat
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Swap Case: basic example",
        input: "Hello, World!",
        expectedOutput: "hELLO, wORLD!",
        recipeConfig: [
            {
                op: "Swap case",
                args: [],
            },
        ],
    },
    {
        name: "Swap Case: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Swap case",
                args: [],
            },
        ],
    },
]);
