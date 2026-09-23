/**
 * Parse colour code tests.
 *
 * @author OpenAI
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Parse colour code: hex input renders inline picker metadata",
        input: "#000",
        expectedMatch: /data-parse-colour-code-picker[\s\S]*data-initial-color="rgba\(0, 0, 0, 1\)"[\s\S]*Hex:\s+#000000[\s\S]*RGBA:\s+rgba\(0, 0, 0, 1\)/,
        recipeConfig: [
            {
                op: "Parse colour code",
                args: []
            }
        ]
    },
    {
        name: "Parse colour code: rgba input preserves alpha output",
        input: "rgba(217, 237, 247, 0.5)",
        expectedMatch: /data-initial-color="rgba\(217, 237, 247, 0.5\)"[\s\S]*Hex:\s+#d9edf7[\s\S]*HSLA:\s+hsla\(200, 65%, 91%, 0.5\)/,
        recipeConfig: [
            {
                op: "Parse colour code",
                args: []
            }
        ]
    },
    {
        name: "Parse colour code: cmyk input converts to rgba",
        input: "cmyk(0.12, 0.04, 0.00, 0.03)",
        expectedMatch: /data-current-color="rgba\(218, 237, 247, 1\)"[\s\S]*RGB:\s+rgb\(218, 237, 247\)[\s\S]*CMYK:\s+cmyk\(0.12, 0.04, 0.00, 0.03\)/,
        recipeConfig: [
            {
                op: "Parse colour code",
                args: []
            }
        ]
    },
    {
        name: "Parse colour code: ignores embedded markup in rgba input",
        input: "rgba(1,2,3,1)<script>alert(1)</script>",
        expectedMatch: /RGBA:\s+rgba\(1, 2, 3, 1\)/,
        unexpectedMatch: /<script>/,
        recipeConfig: [
            {
                op: "Parse colour code",
                args: []
            }
        ]
    }
]);
