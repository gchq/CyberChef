/**
 * GeneratePassword tests.
 *
 * @author 0xff1ce [github.com/0xff1ce]
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";


TestRegister.addTests([
    {
        name: "Generate random string of length 10 without symbols or numbers",
        input: "",
        expectedMatch: /^[A-Za-z]{10}$/,
        recipeConfig: [
            {
                "op": "Generate Password",
                "args": [10, false, false]
            },
        ],
    },
    {
        name: "Generate random string of length 15 with symbols but without numbers",
        input: "",
        expectedMatch: /^[A-Za-z!@#$%^&*()\-=+_|\\"']{15}$/,
        recipeConfig: [
            {
                "op": "Generate Password",
                "args": [15, true, false]
            },
        ],
    },
    {
        name: "Generate random string of length 20 with numbers but without symbols",
        input: "",
        expectedMatch: /^[A-Za-z0-9]{20}$/,
        recipeConfig: [
            {
                "op": "Generate Password",
                "args": [20, false, true]
            },
        ],
    },
    {
        name: "Generate random string of length 25 with both symbols and numbers",
        input: "",
        expectedMatch: /^[A-Za-z0-9!@#$%^&*()\-=+_|\\"']{25}$/,
        recipeConfig: [
            {
                "op": "Generate Password",
                "args": [25, true, true]
            },
        ],
    }
]);
