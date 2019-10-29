/**
 * Lorenz SZ40/42a/42b machine tests.
 * @author VirtualColossus
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        // Simple test first - plain text to ITA2
        name: "Lorenz SZ40: no pattern, plain text",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "HELLO9WORLD55N889THIS9IS9A9TEST9MESSAGE55M",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ40", "No Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // KH Pattern
        name: "Lorenz SZ40: KH pattern, plain text, all 1s",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "VIC3TS/CUJA/3II9W9JWDI5DAFXT4SOIF3999IZD9T",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ40", "KH Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // KH Pattern, Random Start
        name: "Lorenz SZ40: KH pattern, plain text, random start",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "KGZP5ONYCHNNOXS9SN45MIE3SC3DJBZVJUOE5SLVGI",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ40", "KH Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 20, 40, 3, 9, 27, 36, 4, 1, 9, 14, 21, 8, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // ZMUG Pattern, Random Start
        name: "Lorenz SZ40: ZMUG pattern, plain text, random start",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "IQVPAANDCA3CHDNO3V/CZQ/BTPZIKW8YAAQXQGLDMV",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ40", "ZMUG Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 20, 40, 3, 9, 27, 36, 4, 1, 9, 14, 21, 8, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // Bream Pattern, Random Start
        name: "Lorenz SZ40: Bream pattern, plain text, random start",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "/89OALRPJEZQGOO84WOEQZ/I9NBRZOQPBTANC8E/GK",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ40", "BREAM Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 20, 40, 3, 9, 27, 36, 4, 1, 9, 14, 21, 8, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // KH Pattern, all 1s
        name: "Lorenz SZ42a: KH pattern, plain text, all 1s",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "VIC3TS/ZOHUYXWLTUXPV9ZNOTW9IXJPFDLIBB5ZD9K",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ42a", "KH Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    },
    {
        // KH Pattern, all 1s
        name: "Lorenz SZ42a: KH pattern, plain text, all 1s",
        input: "HELLO WORLD, THIS IS A TEST MESSAGE.",
        expectedOutput: "VIC3TS/ZOHUYXWLTUXPV9ZNOTW9IXJPFDLIBB5ZD9K",
        recipeConfig: [
            {
                "op": "Lorenz",
                "args": ["SZ42a", "KH Pattern", false, "Send", "Plaintext", "Plaintext", "5/8/9", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, ".x...xx.x.x..xxx.x.x.xxxx.x.x.x.x.x..x.xx.x", ".xx.x.xxx..x.x.x..x.xx.x.xxx.x....x.xx.x.x.x..x", ".x.x.x..xxx....x.x.xx.x.x.x..xxx.x.x..x.x.xx..x.x.x", ".xx...xxxxx.x.x.xx...x.xx.x.x..x.x.xx.x..x.x.x.x.x.x.", "xx...xx.x..x.xx.x...x.x.x.x.x.x.x.x.xx..xxxx.x.x...xx.x..x.", "x.x.x.x.x.x...x.x.x...x.x.x...x.x....", ".xxxx.xxxx.xxx.xxxx.xx....xxx.xxxx.xxxx.xxxx.xxxx.xxx.xxxx...", ".x...xxx.x.xxxx.x...x.x..xxx....xx.xxxx..", "x..xxx...x.xxxx..xx..x..xx.xx..", "..xx..x.xxx...xx...xx..xx.xx.", "xx..x..xxxx..xx.xxx....x..", "xx..xx....xxxx.x..x.x.."]
            }
        ]
    }
]);
