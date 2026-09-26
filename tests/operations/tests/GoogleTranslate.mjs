/**
 * Google Translate offline tests. Live API behaviour is covered by
 * tests/browser/GoogleTranslate.js.
 *
 * @author CyberChefCloud
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Google Translate: Empty input returns empty output",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                "op": "Google Translate",
                "args": ["en", "es"]
            }
        ]
    },
    {
        name: "Google Translate: Missing Authenticate Google Cloud",
        input: "Hello world",
        expectedError: true,
        expectedOutput: "No Google Cloud credentials found. Please add the 'Authenticate Google Cloud' operation before this one.",
        recipeConfig: [
            {
                "op": "Google Translate",
                "args": ["en", "es"]
            }
        ]
    }
]);
