/**
 * Regular Expression tests.
 *
 * @author C85297 [95289555+C85297@users.noreply.github.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";
import { EMAIL_REGEX } from "../../../src/core/lib/Extract.mjs";

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
                    EMAIL_REGEX.source,
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
        input: "yaunwfkb\nfalse_positive@[1.2.3.]\n091nvka",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "Email address",
                    EMAIL_REGEX.source,
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
        name: "Regular Expression - built in email regex - IPv4 from #2318",
        input: "user@[1.2.3.4]\ntest@[192.168.0.1]\nno-match@[1.2.3.]",
        expectedOutput: "user@[1.2.3.4]\ntest@[192.168.0.1]",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "Email address",
                    EMAIL_REGEX.source,
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
        // A named capture group whose name is written as a Unicode escape is passed
        // through to the native engine verbatim, so the replacer receives an extra
        // `groups` argument. The offset must still be resolved correctly and escaped,
        // otherwise the input is injected raw into the title attribute.
        name: "Regular Expression - highlight with escaped named capture group",
        input: "~'><script>alert('1')</script>",
        expectedOutput: "<span class='hl2' title='Offset: 0\nGroups:\n\t1: ~\n'>~</span>&#x27;&gt;&lt;script&gt;alert(&#x27;1&#x27;)&lt;/script&gt;",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "User defined",
                    "(?<\\u0041>~)",
                    false, false, false, false, false, false,
                    "Highlight matches",
                ],
            },
        ],
    },
    {
        name: "Regular Expression - highlight with named capture group",
        input: "ab ab",
        expectedOutput: "<span class='hl2' title='Offset: 0\nGroups:\n\t1: a\n\t2: b\n'>ab</span> <span class='hl1' title='Offset: 3\nGroups:\n\t1: a\n\t2: b\n'>ab</span>",
        recipeConfig: [
            {
                op: "Regular expression",
                args: [
                    "User defined",
                    "(?<x>a)(b)",
                    false, false, false, false, false, false,
                    "Highlight matches",
                ],
            },
        ],
    },
]);
