/**
 * Strip UDP header tests.
 *
 * @author c65722 []
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Strip UDP header: No payload",
        input: "8111003500000000",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip UDP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip UDP header: Payload",
        input: "8111003500080000ffffffffffffffff",
        expectedOutput: "ffffffffffffffff",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip UDP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "Strip UDP header: Input length less than header length",
        input: "81110035000000",
        expectedOutput: "Need 8 bytes for a UDP Header",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Strip UDP header",
                args: [],
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    }
]);
