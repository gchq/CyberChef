/**
 * Extract domains tests.
 *
 * @author mkilijanek
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Extract domains ignores email local parts",
        input: "name.lastname@domain.com support@sub.domain.example test.example",
        expectedOutput: "domain.com\nsub.domain.example\ntest.example",
        recipeConfig: [
            {
                op: "Extract domains",
                args: [false, false, false, false],
            },
        ],
    },
]);
