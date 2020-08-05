/**
 * Base64 tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "From Base91: First",
        input: "lM_1Z<jNG",
        expectedOutput: "idevlab",
        recipeConfig: [
            {
                op: "From Base64"
            },
        ],
    },
]);
