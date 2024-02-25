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
                args: []
            }
        ]
    },
    {
        name: "From Case Insensitive Regex: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "From Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: simple test",
        input: "S0meth!ng",
        expectedOutput: "[sS]0[mM][eE][tT][hH]![nN][gG]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "From Case Insensitive Regex: simple test",
        input: "[sS]0[mM][eE][tT][hH]![nN][Gg] [wr][On][g]?",
        expectedOutput: "s0meth!nG [wr][On][g]?",
        recipeConfig: [
            {
                op: "From Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [A-Z] -> [A-Za-z]",
        input: "[A-Z]",
        expectedOutput: "[A-Za-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [a-z] -> [A-Za-z]",
        input: "[a-z]",
        expectedOutput: "[A-Za-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [H-d] -> [A-DH-dh-z]",
        input: "[H-d]",
        expectedOutput: "[A-DH-dh-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [!-D] -> [!-Da-d]",
        input: "[!-D]",
        expectedOutput: "[!-Da-d]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [%-^] -> [%-^a-z]",
        input: "[%-^]",
        expectedOutput: "[%-^a-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [K-`] -> [K-`k-z]",
        input: "[K-`]",
        expectedOutput: "[K-`k-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [[-}] -> [[-}A-Z]",
        input: "[[-}]",
        expectedOutput: "[[-}A-Z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [b-}] -> [b-}B-Z]",
        input: "[b-}]",
        expectedOutput: "[b-}B-Z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [<-j] -> [<-z]",
        input: "[<-j]",
        expectedOutput: "[<-z]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: [^-j] -> [A-J^-j]",
        input: "[^-j]",
        expectedOutput: "[A-J^-j]",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: not simple test",
        input: "Mozilla[A-Z0-9]+[A-Z]Mozilla[0-9whatA-Z][H-d][!-H][a-~](.)+",
        expectedOutput:
            "[mM][oO][zZ][iI][lL][lL][aA][A-Za-z0-9]+[A-Za-z][mM][oO][zZ][iI][lL][lL][aA][0-9[wW][hH][aA][tT]A-Za-z][A-DH-dh-z][!-Ha-h][a-~A-Z](.)+",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    },
    {
        name: "To Case Insensitive Regex: erroneous test",
        input: "Mozilla[A-Z",
        expectedOutput: "Invalid Regular Expression (Please note this version of node does not support look behinds).",
        recipeConfig: [
            {
                op: "To Case Insensitive Regex",
                args: []
            }
        ]
    }
]);
