/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Shuffle empty",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Shuffle",
                args: ["Comma"],
            },
        ],
    },
    {
        name: "Shuffle bytes",
        input: "12345678",
        expectedOutput: "31 32 33 34 35 36 37 38",
        recipeConfig: [
            {
                op: "Shuffle",
                args: ["Nothing (separate chars)"],
            },
            {
                op: "To Hex",
                args: ["Space", 0],
            },
            {
                op: "Sort",
                args: ["Space", false, "Alphabetical (case sensitive)"],
            },
        ],
    },
    {
        name: "Shuffle lines",
        input: "1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf\n",
        expectedOutput: "\n1\n2\n3\n4\n5\n6\n7\n8\n9\na\nb\nc\nd\ne\nf",
        recipeConfig: [
            {
                op: "Shuffle",
                args: ["Line feed"],
            },
            {
                op: "Sort",
                args: ["Line feed", false, "Alphabetical (case sensitive)"],
            },
        ],
    },
]);
