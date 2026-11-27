/**
 * @author scottdermott [scottdermott@outlook.com]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

/**
 * Basic Arithmetic Tests
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Basic Arithmetic: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Basic Arithmetic",
                args: [],
            },
        ],
    },
    {
        name: "Basic Arithmetic: Addition",
        input: "1+2+3+4+5+6+7+8+9+0",
        expectedOutput: 45,
        recipeConfig: [
            {
                op: "Basic Arithmetic",
                args: [],
            },
        ],
    },
    {
        name: "Basic Arithmetic: Subtraction",
        input: "100-9-8-7-6-5-4-3-2-1-0",
        expectedOutput: 55,
        recipeConfig: [
            {
                op: "Basic Arithmetic",
                args: [],
            },
        ],
    },
    {
        name: "Basic Arithmetic: Add + Sub",
        input: "1+2+3+4+5+6+7+8+9-9-8-7-6-5-4-3-2-1",
        expectedOutput: 0,
        recipeConfig: [
            {
                op: "Basic Arithmetic",
                args: [],
            },
        ],
    },
    {
        name: "Basic Arithmetic: Large number",
        input: "999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999+999",
        expectedOutput: 22977,
        recipeConfig: [
            {
                op: "Basic Arithmetic",
                args: [],
            },
        ],
    },
]);
