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
    {
        name: "Head 0",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 0, false]
            }
        ],
    },
    {
        name: "Head 1",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 1, false]
            }
        ],
    },
    {
        name: "Head 2",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 2, false]
            }
        ],
    },
    {
        name: "Head 6",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 6, false]
            }
        ],
    },
    {
        name: "Head big",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 100, false]
            }
        ],
    },
    {
        name: "Head all but 0",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 0, true]
            }
        ],
    },
    {
        name: "Head all but 1",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 1, true]
            }
        ],
    },
    {
        name: "Head all but 2",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 2, true]
            }
        ],
    },
    {
        name: "Head all but 6",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 6, true]
            }
        ],
    },
    {
        name: "Head all but big",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [].join("\n"),
        recipeConfig: [
            {
                "op": "Head",
                "args": ["Line feed", 100, true]
            }
        ],
    },
    {
        name: "Tail 0",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 0, false]
            }
        ],
    },
    {
        name: "Tail 1",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 1, false]
            }
        ],
    },
    {
        name: "Tail 2",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 2, false]
            }
        ],
    },
    {
        name: "Tail 6",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 6, false]
            }
        ],
    },
    {
        name: "Tail big",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 100, false]
            }
        ],
    },
    {
        name: "Tail all but 0",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 0, true]
            }
        ],
    },
    {
        name: "Tail all but 1",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [1, 2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 1, true]
            }
        ],
    },
    {
        name: "Tail all but 2",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [2, 3, 4, 5, 6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 2, true]
            }
        ],
    },
    {
        name: "Tail all but 6",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [6].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 6, true]
            }
        ],
    },
    {
        name: "Tail all but big",
        input: [1, 2, 3, 4, 5, 6].join("\n"),
        expectedOutput: [].join("\n"),
        recipeConfig: [
            {
                "op": "Tail",
                "args": ["Line feed", 100, true]
            }
        ],
    },
]);
