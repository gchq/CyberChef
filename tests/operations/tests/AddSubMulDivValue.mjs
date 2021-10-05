/**
 * BitwiseOp tests
 *
 * @author BigYellowHammer
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Add value",
        input: "9",
        expectedOutput: "11",
        recipeConfig: [
            { "op": "Add/Subtract/Multiply/Divide by value",
                "args": ["Add", "2"] },

        ]
    },
    {
        name: "Subtract value",
        input: "9",
        expectedOutput: "7",
        recipeConfig: [
            { "op": "Add/Subtract/Multiply/Divide by value",
                "args": ["Subtract", "2"] },

        ]
    },
    {
        name: "Multiply by value",
        input: "9",
        expectedOutput: "18",
        recipeConfig: [
            { "op": "Add/Subtract/Multiply/Divide by value",
                "args": ["Multiply", "2"] },

        ]
    },
    {
        name: "Divide by value",
        input: "10",
        expectedOutput: "5",
        recipeConfig: [
            { "op": "Add/Subtract/Multiply/Divide by value",
                "args": ["Divide", "2"] },

        ]
    }
]);
