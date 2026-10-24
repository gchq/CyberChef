/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Generate ULID: canonical format",
        input: "",
        expectedMatch: /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/,
        recipeConfig: [{op: "Generate ULID", args: []}]
    },
    {
        name: "Generate ULID: binary round trip",
        input: "ignored",
        expectedMatch: /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/,
        recipeConfig: [
            {op: "Generate ULID", args: []},
            {op: "From ULID", args: []},
            {op: "To ULID", args: []}
        ]
    }
]);
