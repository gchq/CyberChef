/**
 * BitwiseOp tests
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Bit shift left",
        input: "01010101 10101010 11111111 00000000 11110000 00001111 00110011 11001100",
        expectedOutput:
            "10101010 01010100 11111110 00000000 11100000 00011110 01100110 10011000",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            { op: "Bit shift left", args: [1] },
            { op: "To Binary", args: ["Space"] },
        ],
    },
    {
        name: "Bit shift right: Logical shift",
        input: "01010101 10101010 11111111 00000000 11110000 00001111 00110011 11001100",
        expectedOutput:
            "00101010 01010101 01111111 00000000 01111000 00000111 00011001 01100110",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            { op: "Bit shift right", args: [1, "Logical shift"] },
            { op: "To Binary", args: ["Space"] },
        ],
    },
    {
        name: "Bit shift right: Arithmetic shift",
        input: "01010101 10101010 11111111 00000000 11110000 00001111 00110011 11001100",
        expectedOutput:
            "00101010 11010101 11111111 00000000 11111000 00000111 00011001 11100110",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            { op: "Bit shift right", args: [1, "Arithmetic shift"] },
            { op: "To Binary", args: ["Space"] },
        ],
    },
    {
        name: "XOR: empty",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            {
                op: "XOR",
                args: [
                    { option: "Binary", string: "11111111" },
                    "Standard",
                    false,
                ],
            },
            { op: "To Binary", args: ["Space"] },
        ],
    },
    {
        name: "XOR: 1111111, standard, no preserve nulls",
        input: "01010101 10101010 11111111 00000000 11110000 00001111 00110011 11001100",
        expectedOutput:
            "10101010 01010101 00000000 11111111 00001111 11110000 11001100 00110011",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            {
                op: "XOR",
                args: [
                    { option: "Binary", string: "11111111" },
                    "Standard",
                    false,
                ],
            },
            { op: "To Binary", args: ["Space"] },
        ],
    },
    {
        name: "XOR: 1111111, standard, preserve nulls",
        input: "01010101 10101010 11111111 00000000 11110000 00001111 00110011 11001100",
        /*
         * We preserve the all 1's case as well, as the `preserve nulls` option
         * also preserves the bytes if they're equivalent to the key
         */
        expectedOutput:
            "10101010 01010101 11111111 00000000 00001111 11110000 11001100 00110011",
        recipeConfig: [
            { op: "From Binary", args: ["Space"] },
            {
                op: "XOR",
                args: [
                    { option: "Binary", string: "11111111" },
                    "Standard",
                    true,
                ],
            },
            { op: "To Binary", args: ["Space"] },
        ],
    },
]);
