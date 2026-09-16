/**
 * NTLM test.
 *
 * @author brun0ne [brunonblok@gmail.com]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "NT Hash",
        input: "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()_+.,?/",
        expectedOutput: "C5FA1C40E55734A8E528DBFE21766D23",
        recipeConfig: [
            {
                op: "NT Hash",
                args: [],
            },
        ],
    },
    {
        name: "LM Hash",
        input: "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@#$%^&*()_+.,?/",
        expectedOutput: "6D9DF16655336CA75A3C13DD18BA8156",
        recipeConfig: [
            {
                op: "LM Hash",
                args: [],
            },
        ],
    },
    {
        // #1807: bytes that expand when uppercased (e.g. 0xDF -> "SS") used to
        // overflow the library's fixed 14-byte buffer and throw a RangeError,
        // which also broke the "Generate all hashes" operation.
        name: "LM Hash: input with characters that expand when uppercased",
        input: "cf df 26 2e 2d 2b 2c 30 21 25 21 53 28 2a",
        expectedOutput: "98C1A4EB163B98D8DB93DECF17002EEE",
        recipeConfig: [
            {
                op: "From Hex",
                args: ["Auto"],
            },
            {
                op: "LM Hash",
                args: [],
            },
        ],
    },

]);
