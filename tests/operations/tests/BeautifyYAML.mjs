/**
 * YAML tests.
 *
 * @author ccarpo [ccarpo@gmx.net]
 *
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXAMPLE_YAML = `number: 3\nplain: string\nblock: |\n  two\n  lines`;
const EXAMPLE_JSON = `{ "number": 3, "plain": "string" }`;

TestRegister.addTests([
    {
        name: "YAML to JSON",
        input: EXAMPLE_YAML,
        expectedOutput: JSON.stringify({
            "number": 3,
            "plain": "string",
            "block": "two\nlines\n"
        }, null, 4),
        recipeConfig: [
            {
                op: "YAML to JSON",
                args: [],
            }
        ],
    },
    {
        name: "Beautify YAML",
        input: EXAMPLE_JSON,
        expectedOutput: `number: 3\nplain: string\n`,
        recipeConfig: [
            {
                op: "Beautify YAML",
                args: [],
            }
        ],
    },
]);
