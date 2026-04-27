/**
 * Ngram tests.
 *
 * @author jg42526
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Ngram 3",
        input: "hello",
        expectedOutput: "hel,ell,llo",
        recipeConfig: [
            {
                op: "N-gram",
                args: ["3", ","],
            },
        ],
    },
    {
        name: "Ngram longer than input",
        input: "hello",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "N-gram",
                args: ["6", ","],
            },
        ],
    },
]);
