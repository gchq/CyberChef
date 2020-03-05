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
        name: "CipherSaber2 Decrypt",
        input: "\x5d\xd9\x7f\xeb\x77\x3c\x42\x9d\xfe\x9c\x3b\x21\x63\xbd\x53\x38\x18\x7c\x36\x37",
        expectedOutput: "helloworld",
        recipeConfig: [
            {
                op: "CipherSaber2 Decrypt",
                args: [{ "option": "Latin1", "string": "test" }, 20],
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
