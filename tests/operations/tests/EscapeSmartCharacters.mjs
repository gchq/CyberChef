/**
 * @author john19696 [john19696@protonmail.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Escape Smart Characters",
        input: "“”—‘’ →©…",
        expectedOutput: "\"\"--'' -->(C)...",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Escape"],
            },
        ],
    },
    {
        name: "Escape Smart Characters - Remove",
        input: "“”—‘’ →©…",
        expectedOutput: " ",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Remove"],
            },
        ],
    },
    {
        name: "Escape Smart Characters - Replace",
        input: "“”—‘’ →©…",
        expectedOutput: "..... ...",
        recipeConfig: [
            {
                op: "Escape Smart Characters",
                args: ["Replace with '.'"],
            },
        ],
    },
]);
