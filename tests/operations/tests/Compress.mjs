/**
 * Compress tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

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
    {
        name: "LZMA compress & decompress",
        input: "The cat sat on the mat.",
        // Generated using command `echo -n "The cat sat on the mat." | lzma -z -6 | xxd -p`
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                "op": "LZMA Compress",
                "args": ["6"]
            },
            {
                "op": "LZMA Decompress",
                "args": []
            },
        ],
    },
    {
        name: "LZMA decompress: binary",
        // Generated using command `echo "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10" | xxd -r -p | lzma -z -6 | xxd -p`
        input: "5d00008000ffffffffffffffff00000052500a84f99bb28021a969d627e03e8a922effffbd160000",
        expectedOutput: "00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f 10",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "LZMA Decompress",
                "args": []
            },
            {
                "op": "To Hex",
                "args": ["Space", 0]
            }
        ],
    },
    {
        name: "LZMA decompress: string",
        // Generated using command `echo -n "The cat sat on the mat." | lzma -z -6 | xxd -p`
        input: "5d00008000ffffffffffffffff002a1a08a202b1a4b814b912c94c4152e1641907d3fd8cd903ffff4fec0000",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["Space"]
            },
            {
                "op": "LZMA Decompress",
                "args": []
            }
        ],
    },
    {
        name: "LZ4 Compress",
        input: "The cat sat on the mat.",
        expectedOutput: "04224d184070df170000805468652063617420736174206f6e20746865206d61742e00000000",
        recipeConfig: [
            {
                "op": "LZ4 Compress",
                "args": []
            },
            {
                "op": "To Hex",
                "args": ["None", 0]
            }
        ],
    },
    {
        name: "LZ4 Decompress",
        input: "04224d184070df170000805468652063617420736174206f6e20746865206d61742e00000000",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                "op": "From Hex",
                "args": ["None"]
            },
            {
                "op": "LZ4 Decompress",
                "args": []
            }
        ],
    },
    {
        name: "ZStandard Decompress",
        input: "KLUv/QRYuQAAVGhlIGNhdCBzYXQgb24gdGhlIG1hdC4tJ481",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                "op": "From Base64",
                "args": []
            },
            {
                "op": "ZStandard Decompress",
                "args": [65536]
            }
        ],
    }
]);
