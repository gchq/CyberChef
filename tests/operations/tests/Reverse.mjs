/**
 * Reverse operation tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Reverse: Character mode preserves combining marks",
        input: "A e\u0301 B",
        expectedOutput: "B e\u0301 A",
        recipeConfig: [
            {
                op: "Reverse",
                args: ["Character"],
            },
        ],
    },
    {
        name: "Reverse: Character mode preserves joined emoji",
        input: "A 👩‍💻 B",
        expectedOutput: "B 👩‍💻 A",
        recipeConfig: [
            {
                op: "Reverse",
                args: ["Character"],
            },
        ],
    },
    {
        name: "Reverse: Character mode preserves Hangul Jamo",
        input: "A가B",
        expectedOutput: "B가A",
        recipeConfig: [
            {
                op: "Reverse",
                args: ["Character"],
            },
        ],
    },
]);
