/**
 * Base58 tests.
 *
 * @author tlwr [toby@toby.codes
 *
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 */
TestRegister.addTests([
    {
        name: "To Morse Code: 'SOS'",
        input: "SOS",
        expectedOutput: "... --- ...",
        recipeConfig: [
            {
                op: "To Morse Code",
                args: ["-/.", "Space", "Line feed"],
            },
        ],
    },
    {
        name: "From Morse Code '... --- ...'",
        input: "... --- ...",
        expectedOutput: "SOS",
        recipeConfig: [
            {
                op: "From Morse Code",
                args: ["Space", "Line feed"],
            },
        ],
    },
]);
