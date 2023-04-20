/**
 * JSON to YAML tests.
 *
 * @author mshwed [m@ttshwed.com]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

const EXPECTED_YAML = "version: 1.0.0\ndependencies:\n  yaml: ^1.10.0\npackage:\n  exclude:\n    - .idea/**\n    - .gitignore\n";

TestRegister.addTests([
    {
        name: "JSON to YAML: no spacing",
        input: JSON.stringify({ "version": "1.0.0", "dependencies": { "yaml": "^1.10.0" }, "package": { "exclude": [".idea/**", ".gitignore"]}}),
        expectedOutput: EXPECTED_YAML,
        recipeConfig: [
            {
                op: "JSON to YAML",
                args: []
            },
        ],
    },
    {
        name: "JSON to YAML: with spacing",
        input: JSON.stringify({ "version": "1.0.0", "dependencies": { "yaml": "^1.10.0" }, "package": { "exclude": [".idea/**", ".gitignore"]}}, null, 4),
        expectedOutput: EXPECTED_YAML,
        recipeConfig: [
            {
                op: "JSON to YAML",
                args: []
            },
        ],
    }
]);
