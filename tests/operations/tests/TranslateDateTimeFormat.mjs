/**
 * Translate DateTime Format tests.
 *
 * @author Cynser
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Translate DateTime Format",
        input: "01/04/1999 22:33:01",
        expectedOutput: "Thursday 1st April 1999 22:33:01 +00:00 UTC",
        recipeConfig: [
            {
                op: "Translate DateTime Format",
                args: [
                    "Standard date and time",
                    "DD/MM/YYYY HH:mm:ss",
                    "UTC",
                    "dddd Do MMMM YYYY HH:mm:ss Z z",
                    "UTC",
                ],
            },
        ],
    },
    {
        name: "Translate DateTime Format: invalid input",
        input: "1234567890",
        expectedMatch: /Invalid format./,
        recipeConfig: [
            {
                op: "Translate DateTime Format",
                args: [
                    "Standard date and time",
                    "DD/MM/YYYY HH:mm:ss",
                    "UTC",
                    "dddd Do MMMM YYYY HH:mm:ss Z z",
                    "UTC",
                ],
            },
        ],
    },
    {
        name: "Translate DateTime Format: timezone conversion",
        input: "01/04/1999 22:33:01",
        expectedOutput: "Thursday 1st April 1999 17:33:01 -05:00 EST",
        recipeConfig: [
            {
                op: "Translate DateTime Format",
                args: [
                    "Standard date and time",
                    "DD/MM/YYYY HH:mm:ss",
                    "UTC",
                    "dddd Do MMMM YYYY HH:mm:ss Z z",
                    "US/Eastern",
                ],
            },
        ],
    },
    {
        name: "Translate DateTime Format: automatic input format",
        input: "1999-04-01 22:33:01",
        expectedOutput: "Thursday 1st April 1999 22:33:01 +00:00 UTC",
        recipeConfig: [
            {
                op: "Translate DateTime Format",
                args: [
                    "Automatic",
                    "",
                    "UTC",
                    "dddd Do MMMM YYYY HH:mm:ss Z z",
                    "UTC",
                ],
            },
        ],
    },
]);
