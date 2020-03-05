/**
 * From Decimal tests
 *
 * @author n1073645 [n1073645@gmail.com]
 * @copyright Crown Copyright 2020
 * @licence Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Luhn Checksum on standard data",
        input: "35641709012469",
        expectedOutput: "7",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            },
        ],
    },
    {
        name: "Luhn Checksum on invalid data",
        input: "35641709b012469",
        expectedOutput: "Character: b is not a digit.",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            },
        ],
    },
    {
        name: "Luhn Checksum on empty data",
        input: "",
        expectedOutput: "0",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            },
        ],
    }
]);
