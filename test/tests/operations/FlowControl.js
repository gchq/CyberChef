/**
 * Flow Control tests.
 *
 * @author tlwr [toby@toby.codes]
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "Fork: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
        ],
    },
    {
        name: "Fork, Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, (expect) Error, Merge",
        input: "1.1\n2.5\na\n3.4",
        expectedError: true,
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "Object Identifier to Hex",
                args: [],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Fork, Conditional Jump, Encodings",
        input: "Some data with a 1 in it\nSome data with a 2 in it",
        expectedOutput: "U29tZSBkYXRhIHdpdGggYSAxIGluIGl0\n53 6f 6d 65 20 64 61 74 61 20 77 69 74 68 20 61 20 32 20 69 6e 20 69 74\n",
        recipeConfig: [
            {"op": "Fork", "args": ["\\n", "\\n", false]},
            {"op": "Conditional Jump", "args": ["1", false, "skipReturn", "10"]},
            {"op": "To Hex", "args": ["Space"]},
            {"op": "Return", "args": []},
            {"op": "Label", "args": ["skipReturn"]},
            {"op": "To Base64", "args": ["A-Za-z0-9+/="]}
        ]
    },
    {
        name: "Jump: Empty Label",
        input: [
            "should be changed",
        ].join("\n"),
        expectedOutput: [
            "should be changed was changed",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed"
                    },
                    "should be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Jump: skips 1",
        input: [
            "shouldnt be changed",
        ].join("\n"),
        expectedOutput: [
            "shouldnt be changed",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Jump",
                args: ["skipReplace", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "shouldnt be changed"
                    },
                    "shouldnt be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label",
                args: ["skipReplace"]
            },
        ],
    },
    {
        name: "Conditional Jump: Skips 0",
        input: [
            "match",
            "should be changed 1",
            "should be changed 2",
        ].join("\n"),
        expectedOutput: [
            "match",
            "should be changed 1 was changed",
            "should be changed 2 was changed"
        ].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", false, "", 0],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 1"
                    },
                    "should be changed 1 was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed 2"
                    },
                    "should be changed 2 was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Comment: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Comment",
                "args": [""]
            }
        ]
    },
    {
        name: "Fork, Comment, Base64",
        input: "cat\nsat\nmat",
        expectedOutput: "Y2F0\nc2F0\nbWF0\n",
        recipeConfig: [
            {
                "op": "Fork",
                "args": ["\\n", "\\n", false]
            },
            {
                "op": "Comment",
                "args": ["Testing 123"]
            },
            {
                "op": "To Base64",
                "args": ["A-Za-z0-9+/="]
            }
        ]
    },
    {
        name: "Conditional Jump: Skips 1",
        input: [
            "match",
            "should not be changed",
            "should be changed",
        ].join("\n"),
        expectedOutput: [
            "match",
            "should not be changed",
            "should be changed was changed"
        ].join("\n"),
        recipeConfig: [
            {
                op: "Conditional Jump",
                args: ["match", false, "skip match", 10],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should not be changed"
                    },
                    "should not be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label", args: ["skip match"],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "should be changed"
                    },
                    "should be changed was changed",
                    true,
                    true,
                    true,
                ],
            },
        ],
    },
    {
        name: "Conditional Jump: Skips negatively",
        input: [
            "match",
        ].join("\n"),
        expectedOutput: [
            "replaced",
        ].join("\n"),
        recipeConfig: [
            {
                op: "Label",
                args: ["back to the beginning"],
            },
            {
                op: "Jump",
                args: ["skip replace"],
            },
            {
                op: "Find / Replace",
                args: [
                    {
                        "option": "Regex",
                        "string": "match"
                    },
                    "replaced",
                    true,
                    true,
                    true,
                ],
            },
            {
                op: "Label",
                args: ["skip replace"],
            },
            {
                op: "Conditional Jump",
                args: ["match", false, "back to the beginning", 10],
            },
        ],
    },
]);
