/**
 * Fang email address tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Fang email addresses: defanged email address",
        input: "Contact security[@]example[.]com for details.",
        expectedOutput: "Contact security@example.com for details.",
        recipeConfig: [
            {
                op: "Fang email addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang email addresses: defanged with [at]",
        input: "Contact security[at]example[.]com for details.",
        expectedOutput: "Contact security@example.com for details.",
        recipeConfig: [
            {
                op: "Fang email addresses",
                args: [true, true],
            },
        ],
    },
    {
        name: "Fang email addresses: restore at only",
        input: "firstname[.]lastname[@]example[.]com",
        expectedOutput: "firstname[.]lastname@example[.]com",
        recipeConfig: [
            {
                op: "Fang email addresses",
                args: [true, false],
            },
        ],
    },
]);
