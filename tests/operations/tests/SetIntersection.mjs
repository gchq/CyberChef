/**
 * Set Intersection tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Set  Intersection",
        input: "1 2 3 4 5\n\n3 4 5 6 7",
        expectedOutput: "3 4 5",
        recipeConfig: [
            {
                op: "Set Intersection",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Set Intersection: only one set",
        input: "1 2 3 4 5 6 7 8",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Set Intersection",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Set Intersection: item delimiter",
        input: "1-2-3-4-5\n\n3-4-5-6-7",
        expectedOutput: "3-4-5",
        recipeConfig: [
            {
                op: "Set Intersection",
                args: ["\n\n", "-"],
            },
        ],
    },
    {
        name: "Set Intersection: sample delimiter",
        input: "1-2-3-4-5z3-4-5-6-7",
        expectedOutput: "3-4-5",
        recipeConfig: [
            {
                op: "Set Intersection",
                args: ["z", "-"],
            },
        ],
    }
]);
