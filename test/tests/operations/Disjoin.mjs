/**
 * Disjoin tests
 *
 * @author masq [github.cyberchef@masq.cc]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Disjoin: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Disjoin",
                args: ["\n", "\n", false],
            },
        ],
    },
    {
        name: "Disjoin, Merge: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Disjoin",
                args: ["\n", "\n", false],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Disjoin, (expect) Error, Merge",
        input: "1,2,3,4\n\n3,4,5,6",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Disjoin",
                args: ["\n\n", "\n\n", false],
            },
            {
                op: "Set Union",
                args: ["\n\n", ","],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
    {
        name: "Disjoin: simple example",
        input: "Test",
        expectedOutput: "54 65 73 74\nVGVzdA==\n01010100 01100101 01110011 01110100\n",
        recipeConfig: [
            {"op": "Disjoin", "args": ["\\n", "\\n", "false"]},
            {"op": "To Hex", "args": ["Space"]},
            {"op": "To Base64", "args": ["A-Za-z0-9+/="]},
            {"op": "To Binary", "args": ["Space"]},
        ],
    },
    //{
    //    name: "Disjoin, Conditional Jump, Encodings",
    //    input: "Some data with a 1 in it\nSome data with a 2 in it",
    //    expectedOutput: "U29tZSBkYXRhIHdpdGggYSAxIGluIGl0\n53 6f 6d 65 20 64 61 74 61 20 77 69 74 68 20 61 20 32 20 69 6e 20 69 74\n",
    //    recipeConfig: [
    //        {"op": "Fork", "args": ["\\n", "\\n", false]},
    //        {"op": "Conditional Jump", "args": ["1", false, "skipReturn", "10"]},
    //        {"op": "To Hex", "args": ["Space"]},
    //        {"op": "Return", "args": []},
    //        {"op": "Label", "args": ["skipReturn"]},
    //        {"op": "To Base64", "args": ["A-Za-z0-9+/="]}
    //    ]
    //}
]);
