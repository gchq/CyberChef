/**
 * yEnc tests.
 *
 * @author skyswordw
 * @copyright Crown Copyright 2026
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To yEnc",
        input: "ABC",
        expectedOutput: "=ybegin line=128 size=3 name=test.bin\r\nklm\r\n=yend size=3",
        recipeConfig: [
            {
                op: "To yEnc",
                args: ["test.bin", 128]
            }
        ]
    },
    {
        name: "From yEnc",
        input: "=ybegin line=128 size=3 name=test.bin\r\nklm\r\n=yend size=3",
        expectedOutput: "ABC",
        recipeConfig: [
            {
                op: "From yEnc",
                args: []
            }
        ]
    },
    {
        name: "To yEnc line length",
        input: "ABCD",
        expectedOutput: "=ybegin line=2 size=4 name=test.bin\r\nkl\r\nmn\r\n=yend size=4",
        recipeConfig: [
            {
                op: "To yEnc",
                args: ["test.bin", 2]
            }
        ]
    },
    {
        name: "yEnc round trip with escaped byte",
        input: "13",
        expectedOutput: "13",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["None"]
            },
            {
                op: "To yEnc",
                args: ["escaped.bin", 128]
            },
            {
                op: "From yEnc",
                args: []
            },
            {
                op: "To Hex",
                args: ["None", 0]
            }
        ]
    },
    {
        name: "From yEnc ignores surrounding text",
        input: "before\r\n=ybegin line=128 size=3 name=test.bin\r\nklm\r\n=yend size=3\r\nafter",
        expectedOutput: "ABC",
        recipeConfig: [
            {
                op: "From yEnc",
                args: []
            }
        ]
    },
    {
        name: "From yEnc rejects size mismatch",
        input: "=ybegin line=128 size=4 name=test.bin\r\nklm\r\n=yend size=3",
        expectedOutput: "Decoded size 3 does not match yEnc header size 4.",
        recipeConfig: [
            {
                op: "From yEnc",
                args: []
            }
        ]
    }
]);
