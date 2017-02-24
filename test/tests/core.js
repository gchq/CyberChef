/**
 * Core tests.
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 */
TestRegister.addTests([
    //{
    //    name: "Example error",
    //    input: "1\n2\na\n4",
    //    expectedOutput: "1\n2\n3\n4",
    //    recipeConfig: [
    //        {
    //            op: "Fork",
    //            args: ["\n", "\n", false],
    //        },
    //        {
    //            op: "To Base",
    //            args: [16],
    //        },
    //    ],
    //},
    //{
    //    name: "Example non-error when error was expected",
    //    input: "1",
    //    expectedError: true,
    //    recipeConfig: [
    //        {
    //            op: "To Base",
    //            args: [16],
    //        },
    //    ],
    //},
    //{
    //    name: "Example fail",
    //    input: "1\n2\na\n4",
    //    expectedOutput: "1\n2\n3\n4",
    //    recipeConfig: [
    //        {
    //            op: "Fork",
    //            args: ["\n", "\n", true],
    //        },
    //        {
    //            op: "To Base",
    //            args: [16],
    //        },
    //    ],
    //},
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
        input: "1\n2\na\n4",
        expectedError: true,
        recipeConfig: [
            {
                op: "Fork",
                args: ["\n", "\n", false],
            },
            {
                op: "To Base",
                args: [16],
            },
            {
                op: "Merge",
                args: [],
            },
        ],
    },
]);
