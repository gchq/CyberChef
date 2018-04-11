/**
 * Power Set tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Power set: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Power Set",
                args: [","],
            },
        ],
    },
    {
        name: "Power set",
        input: "1 2 4",
        expectedOutput: "\n4\n2\n1\n2 4\n1 4\n1 2\n1 2 4\n",
        recipeConfig: [
            {
                op: "Power Set",
                args: [" "],
            },
        ],
    },
]);
