/**
 * YARA Rules tests.
 *
 * @author Matt C [matt@artemisbot.uk]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "YARA Match: simple foobar",
        input: "foobar foobar bar foo foobar",
        expectedOutput: "Rule \"foo\" matches (4 times):\nPos 0, length 3, identifier $re1, data: \"foo\"\nPos 7, length 3, identifier $re1, data: \"foo\"\nPos 18, length 3, identifier $re1, data: \"foo\"\nPos 22, length 3, identifier $re1, data: \"foo\"\nRule \"bar\" matches (4 times):\nPos 3, length 3, identifier $re1, data: \"bar\"\nPos 10, length 3, identifier $re1, data: \"bar\"\nPos 14, length 3, identifier $re1, data: \"bar\"\nPos 25, length 3, identifier $re1, data: \"bar\"\n",
        recipeConfig: [
            {
                "op": "YARA Rules",
                "args": ["rule foo {strings: $re1 = /foo/ condition: $re1} rule bar {strings: $re1 = /bar/ condition: $re1}", true, true, true, true],
            }
        ],
    },
]);

