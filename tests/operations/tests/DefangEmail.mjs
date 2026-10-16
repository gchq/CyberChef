/**
 * Defang email address tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Defang email addresses: valid email address",
        input: "Contact security@example.com for details.",
        expectedOutput: "Contact security[@]example[.]com for details.",
        recipeConfig: [
            {
                op: "Defang email addresses",
                args: [true, true, "Valid email addresses"],
            },
        ],
    },
    {
        name: "Defang email addresses: multiple addresses",
        input: "one@example.com firstname.lastname@example.co.uk",
        expectedOutput: "one[@]example[.]com firstname[.]lastname[@]example[.]co[.]uk",
        recipeConfig: [
            {
                op: "Defang email addresses",
                args: [true, true, "Valid email addresses"],
            },
        ],
    },
    {
        name: "Defang email addresses: everything",
        input: "Use @ and . anywhere",
        expectedOutput: "Use [@] and [.] anywhere",
        recipeConfig: [
            {
                op: "Defang email addresses",
                args: [true, true, "Everything"],
            },
        ],
    },
]);
