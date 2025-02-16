/**
 * YAML to JSON tests.
 *
 * @author mshwed [m@ttshwed.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXPECTED_JSON_SINGLE = '{"version":"1.0.0","dependencies":{"yaml":"^1.10.0"},"package":{"exclude":[".idea/**",".gitignore"]}}';
const EXPECTED_JSON_SPACED_SINGLE = '{\n"version": "1.0.0",\n"dependencies": {\n    "yaml": "^1.10.0"\n  },\n"package": {\n    "exclude": [\n      ".idea/**",\n      ".gitignore"\n    ]\n  }\n}';

TestRegister.addTests([
    {
        name: "YAML to JSON: simple",
        input: "version: 1.0.0\ndependencies:\n  yaml: ^1.10.0\npackage:\n  exclude:\n    - .idea/**\n    - .gitignore\n",
        expectedOutput: EXPECTED_JSON_SINGLE,
        recipeConfig: [
            {
                op: "YAML to JSON",
                args: [0]
            },
        ],
    },
    {
        name: "YAML to JSON: spacing",
        input: "version: 1.0.0\ndependencies:\n  yaml: ^1.10.0\npackage:\n  exclude:\n    - .idea/**\n    - .gitignore\n",
        expectedOutput: EXPECTED_JSON_SPACED_SINGLE,
        recipeConfig: [
            {
                op: "YAML to JSON",
                args: [2]
            },
        ],
    }
]);
