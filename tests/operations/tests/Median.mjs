/**
 * Median operation tests.
 *
 * @author copilot-swe-agent[bot]
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Median: odd-length input",
        input: "10 1 2",
        expectedOutput: "2",
        recipeConfig: [
            {
                op: "Median",
                args: ["Space"],
            },
        ],
    },
    {
        name: "Median: even-length input",
        input: "10 1 2 5",
        expectedOutput: "3.5",
        recipeConfig: [
            {
                op: "Median",
                args: ["Space"],
            },
        ],
    },
]);
