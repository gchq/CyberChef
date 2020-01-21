/**
 * Levenshtein distance tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Levenshtein Distance",
        input: "the quick brown fox\n\nthequick br0wn g0x",
        expectedOutput: "Levenshtein Distance: 4",
        recipeConfig: [
            {
                "op": "Levenshtein Distance",
                "args": []
            }
        ],
    },
    {
        name: "Levenshtein Distance",
        input: "the quick brown fox\nthequick br0wn g0x",
        expectedOutput: "Error: double newline not present.",
        recipeConfig: [
            {
                "op": "Levenshtein Distance",
                "args": []
            }
        ],
    },
    {
        name: "Levenshtein Distance",
        input: "the quick brown fox\n\n",
        expectedOutput: "Levenshtein Distance: 19",
        recipeConfig: [
            {
                "op": "Levenshtein Distance",
                "args": []
            }
        ],
    }
]);
