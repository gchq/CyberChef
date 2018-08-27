/**
 * Length Value Decoder tests.
 *
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "KeyValue",
        input: [5, 72, 111, 117, 115, 101, 4, 114, 111, 111, 109, 4, 100, 111, 111, 114],
        expectedOutput: [{"key": [25], "length": 5, "value": [72, 111, 117, 115, 101]}, {"key": [73], "length": 4, "value": [114, 111, 111, 109]}, {"key": [41], "length": 4, "value": [100, 111, 111, 114]}],
        recipeConfig: [
            {
                "op": "Length Value Decoder",
                "args": ["0 Bytes (No Key)", "1 Byte", false]
            }
        ]
    },
]);
