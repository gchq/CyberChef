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
        // Combining marks must travel with the letter they decorate: in
        // decomposed text the accents stay on their own vowels rather than
        // drifting onto a neighbouring consonant.
        name: "Typoglycemia: NFD combining marks stay on their base character",
        input: "cafe\u0301 re\u0301sume\u0301 nai\u0308ve",
        expectedOutput: "cfae\u0301 re\u0301usme\u0301 ni\u0308ave",
        recipeConfig: [
            {
                op: "Typoglycemia",
                args: [5, 4, 2],
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
