/**
 * Base91 tests.
 *
 * @author idevlab [nidevlab@outlook.com]
 *
 * @copyright Crown Copyright 2020
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
                op: "From Base91",
                args: ["A-Za-z0-9!#$%&()*+,./:;<=>?@[]^_`{|}~\""],
            },
        ],
    },
    {
        name: "To Base91: First",
        input: "idevlab",
        expectedOutput: "lM_1Z<jNG",
        recipeConfig: [
            {
                op: "To Base91",
                args: ["A-Za-z0-9!#$%&()*+,./:;<=>?@[]^_`{|}~\""],
            },
        ],
    },
]);
