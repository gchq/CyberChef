/**
 * StrUtils tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Regex: non-HTML op",
        input: "/<>",
        expectedOutput: "/<>",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "", true, true, false, false, false, false, "Highlight matches"]
            },
            {
                "op": "Remove whitespace",
                "args": [true, true, true, true, true, false]
            }
        ],
    },
    {
        name: "Regex: Dot matches all",
        input: "Hello\nWorld",
        expectedOutput: "Hello\nWorld",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", ".+", true, true, true, false, false, false, "List matches"]
            }
        ],
    },
    {
        name: "Regex: Astral off",
        input: "𝌆😆",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "\\pS", true, true, false, false, false, false, "List matches"]
            }
        ],
    },
    {
        name: "Regex: Astral on",
        input: "𝌆😆",
        expectedOutput: "𝌆\n😆",
        recipeConfig: [
            {
                "op": "Regular expression",
                "args": ["User defined", "\\pS", true, true, false, false, true, false, "List matches"]
            }
        ],
    }
]);
