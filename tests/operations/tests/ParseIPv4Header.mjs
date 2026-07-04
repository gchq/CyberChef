/**
 * Parse IPv4 header tests.
 *
 * @author C85297 [95289555+C85297@users.noreply.github.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse IPv4 header: Correctly formatted HTML output",
        input: "45 00 00 3c 1c 46 40 00 40 06 b1 e6 c0 a8 00 01 c0 a8 00 02 3c 73 63 72 69 70 74 3e 61 6c 65 72 74 28 31 33 33 37 29 3c 2f 73 63 72 69 70 74 3e",
        expectedOutput: "&lt;script&gt;alert(1337)&lt;/script&gt;",
        recipeConfig: [
            {
                op: "Parse IPv4 header",
                args: ["Hex", "Data (raw)"]
            }
        ]
    },
    {
        name: "Parse IPv4 header: regression for Uint8Array.concat crash on truncated raw input",
        input: "\x45\x00\x00\x14\x00\x00\x00\x00\x40\x06\x00\x00",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Parse IPv4 header",
                args: ["Raw", "Data (raw)"]
            }
        ]
    }
]);
