/**
 * To/From Case Insensitive Regex tests.
 *
 * @author masq [github.cyberchef@masq.cc]
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "To Case Insensitive Regex: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: [],
            },
        ],
    },
    {
        name: "From Case Insensitive Regex: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Case Insensitive Regex",
                args: [],
            },
        ],
    },
    {
        name: "To Case Insensitive Regex: simple test",
        input: "S0meth!ng",
        expectedOutput: "[sS]0[mM][eE][tT][hH]![nN][gG]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: [],
            },
        ],
    },
    {
        name: "From Case Insensitive Regex: simple test",
        input: "[sS]0[mM][eE][tT][hH]![nN][Gg] [wr][On][g]?",
        expectedOutput: "s0meth!nG [wr][On][g]?",
        recipeConfig: [
            {
                op: "From Case Insensitive Regex",
                args: [],
            },
        ],
    },
]);
