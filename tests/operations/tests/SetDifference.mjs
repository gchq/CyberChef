/**
 * Set Difference tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Set Difference",
        input: "1 2 3 4 5\n\n3 4 5 6 7",
        expectedOutput: "1 2",
        recipeConfig: [
            {
                op: "Set Difference",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Set Difference: wrong sample count",
        input: "1 2 3 4 5_3_4 5 6 7",
        expectedOutput:
            "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Set Difference",
                args: [" ", "_"]
            }
        ]
    },
    {
        name: "Set Difference: item delimiter",
        input: "1;2;3;4;5\n\n3;4;5;6;7",
        expectedOutput: "1;2",
        recipeConfig: [
            {
                op: "Set Difference",
                args: ["\n\n", ";"]
            }
        ]
    },
    {
        name: "Set Difference: sample delimiter",
        input: "1;2;3;4;5===3;4;5;6;7",
        expectedOutput: "1;2",
        recipeConfig: [
            {
                op: "Set Difference",
                args: ["===", ";"]
            }
        ]
    }
]);
