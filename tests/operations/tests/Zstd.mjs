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
        name: "Zstd compress & decompress: level 1",
        input: "The cat sat on the mat.",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                op: "Zstd Compress",
                args: ["1"]
            },
            {
                op: "Zstd Decompress",
                args: []
            }
        ]
    },
    {
        name: "Zstd compress & decompress: level 22",
        input: "The cat sat on the mat.",
        expectedOutput: "The cat sat on the mat.",
        recipeConfig: [
            {
                op: "Zstd Compress",
                args: ["22"]
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
    },
    {
        // A frame written by a streaming compressor carries no decompressed size in
        // its header, so the size has to be worked out from the framing instead.
        // Generated using: node -e "process.stdout.write('The cat sat on the mat. '.repeat(90000))" | zstd -3 -c | xxd -p | tr -d '\n'
        // The expected output is the SHA2-256 of the 2,160,000 decompressed bytes.
        name: "Zstd decompress: streamed frame over 1MiB with no content size",
        input: "28b52ffd0458040100c05468652063617420736174206f6e20746865206d61742e20010094ff6f3ec74c000008730100fcff3910024c000008680100fcff3910024c000008540100fcff3910024c000008730100fcff3910024c000008680100fcff3910024c000008540100fcff3910024c000008730100fcff3910024c000008680100fcff3910024c000008540100fcff3910024c000008730100fcff3910024c000008680100fcff3910024c000008540100fcff3910024c000008730100fcff3910024c000008680100fcff3910024c000008540100fcff3910024d0000087301007c751d0801a6b69191",
        expectedOutput: "4c34ddbd251cb7e3b7a40cb6216e7eb9e2e6bd20051e5916e9deb120c89a5432",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "Zstd Decompress",
                args: []
            },
            {
                op: "SHA2",
                args: ["256", 64, 160]
            }
        ]
    },
    {
        // Generated using: printf abc > a; printf defgh > b; zstd -3 a b; cat a.zst b.zst | xxd -p | tr -d '\n'
        name: "Zstd decompress: concatenated frames",
        input: "28b52ffd2403190000616263990977ad28b52ffd24052900006465666768592dbf54",
        expectedOutput: "abcdefgh",
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
        // Generated using: { printf abc | zstd -3 -c; printf def | zstd -3 -c; } | xxd -p | tr -d '\n'
        name: "Zstd decompress: concatenated frames with no content size",
        input: "28b52ffd0458190000616263990977ad28b52ffd0458190000646566a8d553db",
        expectedOutput: "abcdef",
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
        // A skippable frame holding the four bytes 'meta', followed by a data frame.
        name: "Zstd decompress: skippable frame",
        input: "502a4d18040000006d65746128b52ffd2403190000616263990977ad",
        expectedOutput: "abc",
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
        // Generated using: printf 'The cat sat on the mat.' | zstd -3 --check -c | xxd -p | tr -d '\n'
        name: "Zstd decompress: frame with content checksum",
        input: "28b52ffd0458b900005468652063617420736174206f6e20746865206d61742e2d278f35",
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
        // The first 20 bytes of the streamed frame above.
        name: "Zstd decompress: truncated input error",
        input: "28b52ffd0458040100c054686520636174207361",
        expectedOutput: "Failed to decompress: the input ends part way through a Zstandard frame.",
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
        name: "Zstd decompress: invalid input error",
        input: "00010203",
        expectedOutput: "Failed to decompress: the input is not valid Zstandard data.",
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
    }
]);
