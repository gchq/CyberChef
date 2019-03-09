/**
 * Compress tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Bzip2 decompress",
        input: "425a6839314159265359b218ed630000031380400104002a438c00200021a9ea601a10003202185d5ed68ca6442f1e177245385090b218ed63",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "Bzip2 Decompress",
                "args": []
            }
        ],
    },
]);
