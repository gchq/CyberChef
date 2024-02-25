/**
 * RAKE, Rapid Automatic Keyword Extraction tests.
 *
 * @author sw5678
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "RAKE: Basic Example",
        input: "test1 test2. test2",
        expectedOutput: "Scores: , Keywords: \n3.5, test1 test2\n1.5, test2",
        recipeConfig: [
            {
                op: "RAKE",
                args: ["\\s", "\\.\\s|\\n", "i,me,my,myself,we,our"],
            },
        ],
    },
]);
