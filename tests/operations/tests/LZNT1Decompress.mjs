/**
 * LZNT1 Decompress tests.
 *
 * @author 0xThiebaut [thiebaut.dev]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "LZNT1 Decompress",
        input: "\x1a\xb0\x00compress\x00edtestda\x04ta\x07\x88alot",
        expectedOutput: "compressedtestdatacompressedalot",
        recipeConfig: [
            {
                op: "LZNT1 Decompress",
                args: [],
            },
        ],
    },
]);
