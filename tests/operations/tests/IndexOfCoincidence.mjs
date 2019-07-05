/**
 * Index of Coincidence tests.
 *
 * @author George O [georgeomnet+cyberchef@gmail.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Index of Coincidence",
        input: "Hello world, this is a test to determine the correct IC value.",
        expectedMatch: /^Index of Coincidence: 0\.07142857142857142\nNormalized: 1\.857142857142857/,
        recipeConfig: [
            {
                "op": "Index of Coincidence",
                "args": []
            },
        ],
    },
]);
