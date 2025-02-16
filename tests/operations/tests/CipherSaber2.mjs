/**
 * Ciphersaber2 tests.
 *
 * @author n1073645 [n1073645@gmail.com]
 *
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "CipherSaber2 Encrypt",
        input: "Hello World",
        expectedMatch: /.{21}/s,
        recipeConfig: [
            {
                op: "CipherSaber2 Encrypt",
                args: [{ "option": "Latin1", "string": "test" }, 20],
            },
        ],
    },
    {
        // input taken from https://ciphersaber.gurus.org/
        name: "CipherSaber2 Decrypt",
        input: "\x6f\x6d\x0b\xab\xf3\xaa\x67\x19\x03\x15\x30\xed\xb6\x77"  +
            "\xca\x74\xe0\x08\x9d\xd0\xe7\xb8\x85\x43\x56\xbb\x14\x48\xe3" +
            "\x7c\xdb\xef\xe7\xf3\xa8\x4f\x4f\x5f\xb3\xfd",
        expectedOutput: "This is a test of CipherSaber.",
        recipeConfig: [
            {
                op: "CipherSaber2 Decrypt",
                args: [{ "option": "Latin1", "string": "asdfg" }, 1],
            },
        ],
    },
    {
        name: "CipherSaber2 Encrypt",
        input: "",
        expectedMatch: /.{10}/s,
        recipeConfig: [
            {
                op: "CipherSaber2 Encrypt",
                args: [{ "option": "Latin1", "string": "" }, 20],
            },
        ],
    },
]);
