/**
 * Convert Image Format tests.
 *
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Convert Image Format: WebP input to PNG",
        input: "UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoBAAEAAgA0JaACdLoB+AADsAD+8MQL/yC5YXXI1/8gP+QH/ID/+PIAAAA=",
        expectedMatch: /^89504e470d0a1a0a/,
        recipeConfig: [
            { op: "From Base64", args: ["A-Za-z0-9+/=", true] },
            { op: "Convert Image Format", args: ["PNG", 80, "Auto", 9] },
            { op: "To Hex", args: ["None"] }
        ]
    }
]);
