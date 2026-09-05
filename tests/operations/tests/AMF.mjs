/**
 * Tests for the AMF operations.
 *
 * @author lechedesnatada23
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "AMF Decode: empty input throws an OperationError",
        input: "",
        recipeConfig: [
            {
                op: "AMF Decode",
                args: ["AMF3"]
            }
        ],
        expectedMatch: /^Input must not be empty$/
    },
]);
