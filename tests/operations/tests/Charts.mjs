/**
 * Chart tests.
 *
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../TestRegister";

TestRegister.addTests([
    {
        name: "Scatter chart",
        input: "100 100\n200 200\n300 300\n400 400\n500 500",
        expectedMatch: /^<svg width/,
        recipeConfig: [
            { 
                "op": "Scatter chart",
                "args": ["Line feed", "Space", false, "time", "stress", "black", 5, false]
            }
        ],
    },
    {
        name: "Hex density chart",
        input: "100 100\n200 200\n300 300\n400 400\n500 500",
        expectedMatch: /^<svg width/,
        recipeConfig: [
            { 
                "op": "Hex Density chart",
                "args": ["Line feed", "Space", 25, 15, true, "", "", true, "white", "black", true] 
            }
        ],
    },
    {
        name: "Series chart",
        input: "100 100 100\n200 200 200\n300 300 300\n400 400 400\n500 500 500",
        expectedMatch: /^<svg width/,
        recipeConfig: [
            { 
                "op": "Series chart",
                "args": ["Line feed", "Space", "", 1, "mediumseagreen, dodgerblue, tomato"] 
            }
        ],
    },
    {
        name: "Heatmap chart",
        input: "100 100\n200 200\n300 300\n400 400\n500 500",
        expectedMatch: /^<svg width/,
        recipeConfig: [
            { 
                "op": "Heatmap chart",
                "args": ["Line feed", "Space", 25, 25, true, "", "", false, "white", "black"]
            }
        ],
    },
]);
