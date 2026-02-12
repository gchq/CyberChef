/**
 * Regular Expression tests.
 *
 * @author C85297 [95289555+C85297@users.noreply.github.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Regular Expression - built in email regex - IP address",
        input: "yaunwfkb\nexample@[127.0.0.1]\n091nvka",
        expectedOutput: "example@[127.0.0.1]",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "Email address",
                    null,
                    true,
                    true,
                    false,
                    false,
                    false,
                    false,
                    "List matches",
                ],
            },
        ],
    },
    {
        name: "Regular Expression - built in email regex - invalid IP address",
        input: "yaunwfkb\false_positive@[1.2.3.]\n091nvka",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "Email address",
                    null,
                    true,
                    true,
                    false,
                    false,
                    false,
                    false,
                    "List matches",
                ],
            },
        ],
    },
]);
