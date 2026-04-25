/**
 * Caesar Box Cipher tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 *
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Caesar Box Cipher: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Caesar Box Cipher",
                args: ["1"],
            },
        ],
    },
    {
        name: "Caesar Box Cipher: Hello World!",
        input: "Hello World!",
        expectedOutput: "Hlodeor!lWl",
        recipeConfig: [
            {
                op: "Caesar Box Cipher",
                args: ["3"],
            },
        ],
    },
    {
        name: "Caesar Box Cipher: Hello World!",
        input: "Hlodeor!lWl",
        expectedOutput: "HelloWorld!",
        recipeConfig: [
            {
                op: "Caesar Box Cipher",
                args: ["4"],
            },
        ],
    }
]);
