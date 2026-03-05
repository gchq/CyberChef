/* @author sw5678
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "AlternatingCaps: Basic Example",
        "input": "Hello, world!",
        "expectedOutput": "hElLo, WoRlD!",
        "recipeConfig": [
            {
                "op": "Alternating Caps",
                "args": []
            },
        ],
    }
]);
