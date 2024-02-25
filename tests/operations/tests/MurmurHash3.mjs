/**
 * MurmurHash3 tests
 * @author AliceGrey [alice@grey.systems]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To MurmurHash3: nothing",
        input: "",
        expectedOutput: "0",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [0],
            },
        ],
    },
    {
        name: "To MurmurHash3: 1",
        input: "1",
        expectedOutput: "2484513939",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [0],
            },
        ],
    },
    {
        name: "To MurmurHash3: Hello World!",
        input: "Hello World!",
        expectedOutput: "3691591037",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [0],
            },
        ],
    },
    {
        name: "To MurmurHash3: Hello World! with seed",
        input: "Hello World!",
        expectedOutput: "1148600031",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [1337],
            },
        ],
    },
    {
        name: "To MurmurHash3: foo",
        input: "foo",
        expectedOutput: "4138058784",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [0],
            },
        ],
    },
    {
        name: "To MurmurHash3: foo signed",
        input: "foo",
        expectedOutput: "-156908512",
        recipeConfig: [
            {
                op: "MurmurHash3",
                args: [0, true],
            },
        ],
    }
]);
