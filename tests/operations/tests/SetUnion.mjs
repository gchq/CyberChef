/**
 * Set Union tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Set Union: Nothing",
        input: "\n\n",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Set Union",
        input: "1 2 3 4 5\n\n3 4 5 6 7",
        expectedOutput: "1 2 3 4 5 6 7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Set Union: invalid sample number",
        input: "1 2 3 4 5\n\n3 4 5 6 7\n\n1",
        expectedOutput:
            "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Set Union: item delimiter",
        input: "1,2,3,4,5\n\n3,4,5,6,7",
        expectedOutput: "1,2,3,4,5,6,7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", ","]
            }
        ]
    },
    {
        name: "Set Union: sample delimiter",
        input: "1 2 3 4 5whatever3 4 5 6 7",
        expectedOutput: "1 2 3 4 5 6 7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["whatever", " "]
            }
        ]
    }
]);
