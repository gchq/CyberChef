/**
 * Typex machine tests.
 * @author s2224834
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        // Unlike Enigma we're not verifying against a real machine here, so this is just a test
        // to catch inadvertent breakage.
        name: "Typex: basic",
        input: "hello world, this is a test message.",
        expectedOutput: "VIXQQ VHLPN UCVLA QDZNZ EAYAT HWC",
        recipeConfig: [
            {
                "op": "Typex",
                "args": [
                    "MCYLPQUVRXGSAOWNBJEZDTFKHI<BFHNQUW",
                    false,
                    "B",
                    "C",
                    "KHWENRCBISXJQGOFMAPVYZDLTU<BFHNQUW",
                    false,
                    "D",
                    "E",
                    "BYPDZMGIKQCUSATREHOJNLFWXV<BFHNQUW",
                    false,
                    "F",
                    "G",
                    "ZANJCGDLVHIXOBRPMSWQUKFYET<BFHNQUW",
                    true,
                    "H",
                    "I",
                    "QXBGUTOVFCZPJIHSWERYNDAMLK<BFHNQUW",
                    true,
                    "J",
                    "K",
                    "AN BC FG IE KD LU MH OR TS VZ WQ XJ YP",
                    "EHZTLCVKFRPQSYANBUIWOJXGMD",
                    "None",
                    true
                ]
            }
        ]
    },
    {
        name: "Typex: keyboard",
        input: "hello world, this is a test message.",
        expectedOutput: "VIXQQ FDJXT WKLDQ DFQOD CNCSK NULBG JKQDD MVGQ",
        recipeConfig: [
            {
                "op": "Typex",
                "args": [
                    "MCYLPQUVRXGSAOWNBJEZDTFKHI<BFHNQUW",
                    false,
                    "B",
                    "C",
                    "KHWENRCBISXJQGOFMAPVYZDLTU<BFHNQUW",
                    false,
                    "D",
                    "E",
                    "BYPDZMGIKQCUSATREHOJNLFWXV<BFHNQUW",
                    false,
                    "F",
                    "G",
                    "ZANJCGDLVHIXOBRPMSWQUKFYET<BFHNQUW",
                    true,
                    "H",
                    "I",
                    "QXBGUTOVFCZPJIHSWERYNDAMLK<BFHNQUW",
                    true,
                    "J",
                    "K",
                    "AN BC FG IE KD LU MH OR TS VZ WQ XJ YP",
                    "EHZTLCVKFRPQSYANBUIWOJXGMD",
                    "Encrypt",
                    true
                ]
            }
        ]
    },
    {
        name: "Typex: self-decrypt",
        input: "hello world, this is a test message.",
        expectedOutput: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        recipeConfig: [
            {
                "op": "Typex",
                "args": [
                    "MCYLPQUVRXGSAOWNBJEZDTFKHI<BFHNQUW",
                    false,
                    "B",
                    "C",
                    "KHWENRCBISXJQGOFMAPVYZDLTU<BFHNQUW",
                    false,
                    "D",
                    "E",
                    "BYPDZMGIKQCUSATREHOJNLFWXV<BFHNQUW",
                    false,
                    "F",
                    "G",
                    "ZANJCGDLVHIXOBRPMSWQUKFYET<BFHNQUW",
                    true,
                    "H",
                    "I",
                    "QXBGUTOVFCZPJIHSWERYNDAMLK<BFHNQUW",
                    true,
                    "J",
                    "K",
                    "AN BC FG IE KD LU MH OR TS VZ WQ XJ YP",
                    "EHZTLCVKFRPQSYANBUIWOJXGMD",
                    "Encrypt",
                    true
                ]
            },
            {
                "op": "Typex",
                "args": [
                    "MCYLPQUVRXGSAOWNBJEZDTFKHI<BFHNQUW",
                    false,
                    "B",
                    "C",
                    "KHWENRCBISXJQGOFMAPVYZDLTU<BFHNQUW",
                    false,
                    "D",
                    "E",
                    "BYPDZMGIKQCUSATREHOJNLFWXV<BFHNQUW",
                    false,
                    "F",
                    "G",
                    "ZANJCGDLVHIXOBRPMSWQUKFYET<BFHNQUW",
                    true,
                    "H",
                    "I",
                    "QXBGUTOVFCZPJIHSWERYNDAMLK<BFHNQUW",
                    true,
                    "J",
                    "K",
                    "AN BC FG IE KD LU MH OR TS VZ WQ XJ YP",
                    "EHZTLCVKFRPQSYANBUIWOJXGMD",
                    "Decrypt",
                    true
                ]
            }
        ]
    }
]);
