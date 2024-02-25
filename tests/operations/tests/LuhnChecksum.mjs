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
        expectedOutput: "Checksum: 7\nCheckdigit: 0\nLuhn Validated String: 356417090124690",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            }
        ]
    },
    {
        name: "Luhn Checksum on standard data 2",
        input: "896101950123440000",
        expectedOutput: "Checksum: 5\nCheckdigit: 1\nLuhn Validated String: 8961019501234400001",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            }
        ]
    },
    {
        name: "Luhn Checksum on standard data 3",
        input: "35726908971331",
        expectedOutput: "Checksum: 6\nCheckdigit: 7\nLuhn Validated String: 357269089713317",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            }
        ]
    },
    {
        name: "Luhn Checksum on invalid data",
        input: "35641709b012469",
        expectedOutput: "Character: b is not a digit.",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            }
        ]
    },
    {
        name: "Luhn Checksum on empty data",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Luhn Checksum",
                args: []
            }
        ]
    }
]);
