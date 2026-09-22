/**
 * Jq tests.
 *
 * @author  rtpt-romankarwacik [roman.karwacik@redteam-pentesting.de]
 *
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Get raw JSON Property",
        input: '{"data": "testString\\u0000"}',
        expectedOutput: "testString\u0000",
        recipeConfig: [
            {
                op: "Jq",
                args: [".data", true],
            },
        ],
    },
    {
        name: "Get JSON Property",
        input: '{"data": "testString\\u0000"}',
        expectedOutput: "\"testString\\u0000\"",
        recipeConfig: [
            {
                op: "Jq",
                args: [".data", false],
            },
        ],
    },
]);
