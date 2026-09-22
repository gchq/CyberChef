/**
 * A1Z26 Cipher Decode tests
 *
 * @author brick-pixel
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "A1Z26 Cipher Decode: basic decode",
        "input": "8 5 12 12 15",
        "expectedOutput": "hello",
        "recipeConfig": [
            {
                "op": "A1Z26 Cipher Decode",
                "args": ["Space"]
            }
        ]
    },
    {
        "name": "A1Z26 Cipher Decode: empty input returns empty string",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "A1Z26 Cipher Decode",
                "args": ["Space"]
            }
        ]
    }
]);
