/**
 * Cipher tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 * 
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";


TestRegister.addTests([
    {
        name: "Affine Encode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Encode: no effect",
        input: "some keys are shaped as locks. index[me]",
        expectedOutput: "some keys are shaped as locks. index[me]",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Encode: normal",
        input: "some keys are shaped as locks. index[me]",
        expectedOutput: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        recipeConfig: [
            {
                op: "Affine Cipher Encode",
                args: [23, 23]
            }
        ],
    },
    {
        name: "Affine Decode: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Decode: no effect",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [1, 0]
            }
        ],
    },
    {
        name: "Affine Decode: normal",
        input: "vhnl tldv xyl vcxelo xv qhrtv. zkolg[nl]",
        expectedOutput: "some keys are shaped as locks. index[me]",
        recipeConfig: [
            {
                op: "Affine Cipher Decode",
                args: [23, 23]
            }
        ],
    },
    {
        name: "Atbash: no input",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Atbash Cipher",
                args: []
            }
        ],
    },
    {
        name: "Atbash: normal",
        input: "old slow slim horn",
        expectedOutput: "low hold horn slim",
        recipeConfig: [
            {
                op: "Atbash Cipher",
                args: []
            }
        ],
    },
]);
