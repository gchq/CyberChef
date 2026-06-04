/**
 * To Binary tests
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Binary: custom byte length",
        input: "hello",
        expectedOutput: "01101000 01100101 01101100 01101100 01101111",
        recipeConfig: [
            {
                "op": "To Binary",
                "args": ["Space", 8]
            }
        ]
    },
    {
        name: "To Binary: byte length too large",
        input: "hello",
        expectedOutput: "Byte length must be an integer between 0 and 65536",
        recipeConfig: [
            {
                "op": "To Binary",
                "args": ["Space", "8111111111111111111"]
            }
        ]
    }
]);
