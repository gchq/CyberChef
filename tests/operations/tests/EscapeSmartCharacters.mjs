/**
 * Escape Smart Characters tests
 *
 * @author HarelKatz [github.com/HarelKatz]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        "name": "Escape Smart Characters: smart quotes and apostrophes",
        "input": "“Hello,” she said, ‘yes.’",
        "expectedOutput": "\"Hello,\" she said, 'yes.'",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: em dash, en dash and ellipsis",
        "input": "page 1–3 — wait…",
        "expectedOutput": "page 1-3 -- wait...",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: trademark symbols",
        "input": "Foo© Bar® Baz™",
        "expectedOutput": "Foo(c) Bar(r) Baz(tm)",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: arrows and guillemets",
        "input": "← → ↔ ⇒ « »",
        "expectedOutput": "<-- --> <-> ==> << >>",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: math and misc",
        "input": "3 × 4 ÷ 2 = 6, ±0.5 • item",
        "expectedOutput": "3 x 4 / 2 = 6, +/-0.5 * item",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: NBSP becomes regular space",
        "input": "a b c",
        "expectedOutput": "a b c",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: unmappable Include preserves char",
        "input": "warning: ☣ hazard",
        "expectedOutput": "warning: ☣ hazard",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: unmappable Remove drops char",
        "input": "warning: ☣ hazard",
        "expectedOutput": "warning:  hazard",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Remove"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: unmappable Replace substitutes dot",
        "input": "warning: ☣ hazard",
        "expectedOutput": "warning: . hazard",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Replace with '.'"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: pure ASCII passes through",
        "input": "hello world! 123",
        "expectedOutput": "hello world! 123",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    },
    {
        "name": "Escape Smart Characters: empty input",
        "input": "",
        "expectedOutput": "",
        "recipeConfig": [
            {
                "op": "Escape Smart Characters",
                "args": ["Include"]
            }
        ]
    }
]);
