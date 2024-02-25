/**
 * Cartesian Product tests.
 *
 * @author d98762625
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Cartesian Product",
        input: "1 2 3 4 5\n\na b c d e",
        expectedOutput:
            "(1,a) (1,b) (1,c) (1,d) (1,e) (2,a) (2,b) (2,c) (2,d) (2,e) (3,a) (3,b) (3,c) (3,d) (3,e) (4,a) (4,b) (4,c) (4,d) (4,e) (5,a) (5,b) (5,c) (5,d) (5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Cartesian Product: too many on left",
        input: "1 2 3 4 5 6\n\na b c d e",
        expectedOutput:
            "(1,a) (1,b) (1,c) (1,d) (1,e) (2,a) (2,b) (2,c) (2,d) (2,e) (3,a) (3,b) (3,c) (3,d) (3,e) (4,a) (4,b) (4,c) (4,d) (4,e) (5,a) (5,b) (5,c) (5,d) (5,e) (6,a) (6,b) (6,c) (6,d) (6,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Cartesian Product: too many on right",
        input: "1 2 3 4 5\n\na b c d e f",
        expectedOutput:
            "(1,a) (1,b) (1,c) (1,d) (1,e) (1,f) (2,a) (2,b) (2,c) (2,d) (2,e) (2,f) (3,a) (3,b) (3,c) (3,d) (3,e) (3,f) (4,a) (4,b) (4,c) (4,d) (4,e) (4,f) (5,a) (5,b) (5,c) (5,d) (5,e) (5,f)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", " "]
            }
        ]
    },
    {
        name: "Cartesian Product: item delimiter",
        input: "1-2-3-4-5\n\na-b-c-d-e",
        expectedOutput:
            "(1,a)-(1,b)-(1,c)-(1,d)-(1,e)-(2,a)-(2,b)-(2,c)-(2,d)-(2,e)-(3,a)-(3,b)-(3,c)-(3,d)-(3,e)-(4,a)-(4,b)-(4,c)-(4,d)-(4,e)-(5,a)-(5,b)-(5,c)-(5,d)-(5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["\n\n", "-"]
            }
        ]
    },
    {
        name: "Cartesian Product: sample delimiter",
        input: "1 2 3 4 5_a b c d e",
        expectedOutput:
            "(1,a) (1,b) (1,c) (1,d) (1,e) (2,a) (2,b) (2,c) (2,d) (2,e) (3,a) (3,b) (3,c) (3,d) (3,e) (4,a) (4,b) (4,c) (4,d) (4,e) (5,a) (5,b) (5,c) (5,d) (5,e)",
        recipeConfig: [
            {
                op: "Cartesian Product",
                args: ["_", " "]
            }
        ]
    }
]);
