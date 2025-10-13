/**
 * Base91 tests
 *
 * @author ialejandrozalles
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Base91",
        input: "hello",
        expectedOutput: "TPwJh>A",
        recipeConfig: [
            { op: "To Base91", args: [] }
        ]
    },
    {
        name: "From Base91",
        input: "TPwJh>A",
        expectedOutput: "hello",
        recipeConfig: [
            { op: "From Base91", args: [] }
        ]
    },
    {
        name: "To/From Base91 Roundtrip",
        input: "The quick brown fox jumps over the lazy dog",
        expectedOutput: "The quick brown fox jumps over the lazy dog",
        recipeConfig: [
            { op: "To Base91", args: [] },
            { op: "From Base91", args: [] }
        ]
    }
]);
