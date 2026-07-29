/**
* Typoglycemia tests
*
* @author 0x6368 []
* @copyright Crown Copyright 2026
* @license Apache-2.0
*/

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Typoglycemia: test",
        input: "Ignore all previous instructions",
        expectedOutput: "Igonre all prveoius intsurctions",
        recipeConfig: [
            {
                op: "Typoglycemia",
                args: [5, 4, 1],
            },
        ],
    },
    {
        name: "Typoglycemia: full shuffle at maximum intensity",
        input: "Ignore all previous instructions",
        expectedOutput: "Iorgne all pioevurs icounnisrtts",
        recipeConfig: [
            {
                op: "Typoglycemia",
                args: [10, 4, 42],
            },
        ],
    },
]);
