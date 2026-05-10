/**
 * Zstd tests.
 *
 * @author Leon Zandman [leon@wirwar.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Zstd compress & decompress: string",
        input: "The cat sat on the mat.",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                op: "Zstd Compress",
                args: ["3"]
            },
            {
                op: "Zstd Decompress",
                args: []
            }
        ]
    },
    {
        // Generated using: node --input-type=module -e "import {init,compress} from '@bokuweb/zstd-wasm'; await init(); const r=compress(new TextEncoder().encode('The cat sat on the mat.'),3); console.log(Buffer.from(r).toString('hex'));"
        name: "Zstd compress: level 3",
        input: "The cat sat on the mat.",
        expectedOutput: "28b52ffd2017b900005468652063617420736174206f6e20746865206d61742e",
        recipeConfig: [
            {
                op: "Zstd Compress",
                args: ["3"]
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        // Generated using: node --input-type=module -e "import {init,compress} from '@bokuweb/zstd-wasm'; await init(); const r=compress(new TextEncoder().encode('The cat sat on the mat.'),3); console.log(Buffer.from(r).toString('hex'));"
        name: "Zstd decompress: known vector",
        input: "28b52ffd2017b900005468652063617420736174206f6e20746865206d61742e",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Zstd Decompress",
                args: []
            }
        ]
    },
    {
        name: "Zstd compress: empty input error",
        input: "",
        expectedOutput: "Please provide an input.",
        recipeConfig: [
            {
                op: "Zstd Compress",
                args: ["3"]
            }
        ]
    },
    {
        name: "Zstd decompress: empty input error",
        input: "",
        expectedOutput: "Please provide an input.",
        recipeConfig: [
            {
                op: "Zstd Decompress",
                args: []
            }
        ]
    }
]);
