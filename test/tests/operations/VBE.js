/**
 * CharEnc tests.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister.js";

TestRegister.addTests([
    {
        name: "VBE Decode",
        input: "##@~^DgAAAA==\\ko$K6,JCV^GJqAQAAA==^#~@",
        expectedOutput: "MsgBox \"Hello\"",
        recipeConfig: [
            {
                "op": "Decode VBE",
                "args": []
            },
        ],
    },
]);
