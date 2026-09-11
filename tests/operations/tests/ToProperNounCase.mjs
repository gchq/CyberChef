/**
 * To Proper Noun Case tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Proper Noun Case: single word",
        input: "bob",
        expectedOutput: "Bob",
        recipeConfig: [{ op: "To Proper Noun Case", args: [] }]
    },
    {
        name: "To Proper Noun Case: normalises existing case",
        input: "bob Jenkins",
        expectedOutput: "Bob Jenkins",
        recipeConfig: [{ op: "To Proper Noun Case", args: [] }]
    },
    {
        name: "To Proper Noun Case: preserves punctuation",
        input: "BOB DEWITT, ALICE LIGHT, JIM SIMONS",
        expectedOutput: "Bob Dewitt, Alice Light, Jim Simons",
        recipeConfig: [{ op: "To Proper Noun Case", args: [] }]
    },
    {
        name: "To Proper Noun Case: apostrophes and hyphens",
        input: "MARY-JANE O'NEILL",
        expectedOutput: "Mary-Jane O'Neill",
        recipeConfig: [{ op: "To Proper Noun Case", args: [] }]
    },
    {
        name: "To Proper Noun Case: Unicode letters",
        input: "ÉLODIE BRÛLÉ",
        expectedOutput: "Élodie Brûlé",
        recipeConfig: [{ op: "To Proper Noun Case", args: [] }]
    }
]);
