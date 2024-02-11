/**
 * StrUtils tests.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Search: HTML op",
        input: "abc def\ndef abc",
        expectedOutput: "<span class='hl2' title='Offset: 0\n\
Groups:\n\
\t1: abc\n\
'>abc</span> <span class='hl1' title='Offset: 4\n\
Groups:\n\
\t1: def\n\
'>def</span>\n\
<span class='hl2' title='Offset: 8\n\
Groups:\n\
\t1: def\n\
'>def</span> <span class='hl1' title='Offset: 12\n\
Groups:\n\
\t1: abc\n\
'>abc</span>",
        recipeConfig: [
            {
                "op": "Search",
                "args": ["abc\ndef", false, true, true, false, false, false, "Highlight matches"]
            }
        ],
    },
    {
        name: "Search: regex",
        input: "abc def\ndef abc",
        expectedOutput: "abc\ndef\ndef\nabc",
        recipeConfig: [
            {
                "op": "Search",
                "args": ["a.c\nd.f", true, true, true, false, false, false, "List matches"]
            }
        ],
    }
]);
