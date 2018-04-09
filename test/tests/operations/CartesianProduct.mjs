/**
 * Cartesian Product tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Cartesian Product",
        input: "1 2 3 4 5\n\na b c d e",
        expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Cartesian Product: wrong sample count",
        input: "1 2\n\n3 4 5\n\na b c d e",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Cartesian Product: too many on left",
        input: "1 2 3 4 5 6\n\na b c d e",
        expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e) (6,undefined)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Cartesian Product: too many on right",
        input: "1 2 3 4 5\n\na b c d e f",
        expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e) (undefined,f)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Cartesian Product: item delimiter",
        input: "1-2-3-4-5\n\na-b-c-d-e",
        expectedOutput: "(1,a)-(2,b)-(3,c)-(4,d)-(5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", "-"],
            },
        ],
    },
    {
        name: "Cartesian Product: sample delimiter",
        input: "1 2 3 4 5_a b c d e",
        expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["_", " "],
            },
        ],
    },
]);
