/**
 * Set Union tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Set Union: Nothing",
        input: "\n\n",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Set Union",
        input: "1 2 3 4 5\n\n3 4 5 6 7",
        expectedOutput: "1 2 3 4 5 6 7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Set Union: invalid sample number",
        input: "1 2 3 4 5\n\n3 4 5 6 7\n\n1",
        expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", " "],
            },
        ],
    },
    {
        name: "Set Union: item delimiter",
        input: "1,2,3,4,5\n\n3,4,5,6,7",
        expectedOutput: "1,2,3,4,5,6,7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["\n\n", ","],
            },
        ],
    },
    {
        name: "Set Union: sample delimiter",
        input: "1 2 3 4 5whatever3 4 5 6 7",
        expectedOutput: "1 2 3 4 5 6 7",
        recipeConfig: [
            {
                op: "Set Union",
                args: ["whatever", " "],
            },
        ],
    },
    // {
    //     name: "Set Operations: Intersection",
    //     input: "1 2 3 4 5\n\n3 4 5 6 7",
    //     expectedOutput: "3 4 5",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Intersection"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Intersection: only one set",
    //     input: "1 2 3 4 5 6 7 8",
    //     expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Intersection"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Intersection: item delimiter",
    //     input: "1-2-3-4-5\n\n3-4-5-6-7",
    //     expectedOutput: "3-4-5",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", "-", "Intersection"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Intersection: sample delimiter",
    //     input: "1-2-3-4-5z3-4-5-6-7",
    //     expectedOutput: "3-4-5",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["z", "-", "Intersection"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Set Difference",
    //     input: "1 2 3 4 5\n\n3 4 5 6 7",
    //     expectedOutput: "1 2",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Set Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Set Difference: wrong sample count",
    //     input: "1 2 3 4 5_3_4 5 6 7",
    //     expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: [" ", "_", "Set Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Set Difference: item delimiter",
    //     input: "1;2;3;4;5\n\n3;4;5;6;7",
    //     expectedOutput: "1;2",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", ";", "Set Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Set Difference: sample delimiter",
    //     input: "1;2;3;4;5===3;4;5;6;7",
    //     expectedOutput: "1;2",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["===", ";", "Set Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Symmetric Difference",
    //     input: "1 2 3 4 5\n\n3 4 5 6 7",
    //     expectedOutput: "1 2 6 7",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Symmetric Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Symmetric Difference: wrong sample count",
    //     input: "1 2\n\n3 4 5\n\n3 4 5 6 7",
    //     expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Symmetric Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Symmetric Difference: item delimiter",
    //     input: "a_b_c_d_e\n\nc_d_e_f_g",
    //     expectedOutput: "a_b_f_g",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", "_", "Symmetric Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Symmetric Difference: sample delimiter",
    //     input: "a_b_c_d_eAAAAAc_d_e_f_g",
    //     expectedOutput: "a_b_f_g",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["AAAAA", "_", "Symmetric Difference"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product",
    //     input: "1 2 3 4 5\n\na b c d e",
    //     expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e)",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product: wrong sample count",
    //     input: "1 2\n\n3 4 5\n\na b c d e",
    //     expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product: too many on left",
    //     input: "1 2 3 4 5 6\n\na b c d e",
    //     expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e) (6,undefined)",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product: too many on right",
    //     input: "1 2 3 4 5\n\na b c d e f",
    //     expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e) (undefined,f)",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product: item delimiter",
    //     input: "1-2-3-4-5\n\na-b-c-d-e",
    //     expectedOutput: "(1,a)-(2,b)-(3,c)-(4,d)-(5,e)",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", "-", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Cartesian Product: sample delimiter",
    //     input: "1 2 3 4 5_a b c d e",
    //     expectedOutput: "(1,a) (2,b) (3,c) (4,d) (5,e)",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["_", " ", "Cartesian Product"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Power set: nothing",
    //     input: "",
    //     expectedOutput: "",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Power Set"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Power set: Too many samples",
    //     input: "1 2 3\n\n4",
    //     expectedOutput: "Incorrect number of sets, perhaps you need to modify the sample delimiter or add more samples?",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Power Set"],
    //         },
    //     ],
    // },
    // {
    //     name: "Set Operations: Power set",
    //     input: "1 2 4",
    //     expectedOutput: "\n4\n2\n1\n2 4\n1 4\n1 2\n1 2 4\n",
    //     recipeConfig: [
    //         {
    //             op: "Set Operations",
    //             args: ["\n\n", " ", "Power Set"],
    //         },
    //     ],
    // },
]);
