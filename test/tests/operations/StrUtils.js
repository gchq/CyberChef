/**
 * StrUtils tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "Regex, non-HTML op",
        input: "/<>",
        expectedOutput: "/<>",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "", true, true, false, "Highlight matches"]
            },
            {
                "op": "Remove whitespace",
                "args": [true, true, true, true, true, false]
            }
        ],
    },
    {
        name: "Diff, basic usage",
        input: "testing23\n\ntesting123",
        expectedOutput: "testing<span class='hlgreen'>1</span>23",
        recipeConfig: [
            {
                "op": "Diff",
                "args": ["\\n\\n", "Character", true, true, false]
            }
        ],
    },
]);
