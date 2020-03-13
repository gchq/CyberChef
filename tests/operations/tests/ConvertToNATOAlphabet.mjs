/**
 * @author MarvinJWendt [git@marvinjwendt.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Convert to NATO alphabet: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Convert to NATO alphabet",
                args: [""]
            }
        ]
    },
    {
        name: "Convert to NATO alphabet: full alphabet with numbers",
        input: "abcdefghijklmnopqrstuvwxyz0123456789",
        expectedOutput: "alfa bravo charlie delta echo foxtrot golf hotel india juliett kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu zero one two three four five six seven eight nine ",
        recipeConfig: [
            {
                op: "Convert to NATO alphabet",
                args: [""]
            }
        ]
    }
]);
