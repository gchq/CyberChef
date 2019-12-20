/**
 * Text Encoding Brute Force tests.
 *
 * @author Matthieu [m@tthieux.xyz]
 *
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Normalise Unicode - NFD",
        input: "\u00c7\u0043\u0327\u2160",
        expectedMatch: /C\u0327C\u0327\u2160/,
        recipeConfig: [
            {
                op: "Normalise Unicode",
                args: ["NFD"],
            },
        ],
    }, {
        name: "Normalise Unicode - NFC",
        input: "\u00c7\u0043\u0327\u2160",
        expectedMatch: /\u00C7\u00C7\u2160/,
        recipeConfig: [
            {
                op: "Normalise Unicode",
                args: ["NFC"],
            },
        ],
    }, {
        name: "Normalise Unicode - NFKD",
        input: "\u00c7\u0043\u0327\u2160",
        expectedMatch: /C\u0327C\u0327I/,
        recipeConfig: [
            {
                op: "Normalise Unicode",
                args: ["NFKD"],
            },
        ],
    }, {
        name: "Normalise Unicode - NFKC",
        input: "\u00c7\u0043\u0327\u2160",
        expectedMatch: /\u00C7\u00C7\u2160/,
        recipeConfig: [
            {
                op: "Normalise Unicode",
                args: ["NFKC"],
            },
        ],
    },
]);

