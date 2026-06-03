/**
 * InsertBytes test.
 *
 * @author Didier Stevens [didier.stevens@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Insert bytes - test 1",
        input: "This is a test",
        expectedOutput: "This is a test",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "", "option": "Hex"}, 0, false, false],
            },
        ],
    },
    {
        name: "Insert bytes - test 2",
        input: "This is a test",
        expectedOutput: "AThis is a test",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "41", "option": "Hex"}, 0, false, false],
            },
        ],
    },
    {
        name: "Insert bytes - test 3",
        input: "This is a test",
        expectedOutput: "This is a testA",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "41", "option": "Hex"}, 0, true, false],
            },
        ],
    },
    {
        name: "Insert bytes - test 4",
        input: "This is a test",
        expectedOutput: "Ahis is a test",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "41", "option": "Hex"}, 0, false, true],
            },
        ],
    },
    {
        name: "Insert bytes - test 5",
        input: "This is a test",
        expectedOutput: "This is a tesA",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "41", "option": "Hex"}, 1, true, true],
            },
        ],
    },
    {
        name: "Insert bytes - test 6",
        input: "This is a test",
        expectedOutput: "This is not a test",
        recipeConfig: [
            {
                op: "Insert bytes",
                args: [{"string": "not ", "option": "Latin1"}, 8, false, false],
            },
        ],
    },

]);
