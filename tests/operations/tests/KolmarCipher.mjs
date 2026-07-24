/**
 * Kolmar Cipher tests.
 *
 * @author Alexei Baranov [alex022003@mail.ru]
 *
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */
import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // ---- Russian ----
    {
        name: "Kolmar Cipher: encode привет / кольмар",
        input: "привет",
        expectedOutput: "пе рт и в",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode пе рт и в / кольмар",
        input: "пе рт и в",
        expectedOutput: "привет",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode тест / коль-мар (manual syllables)",
        input: "тест",
        expectedOutput: "т е с т",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["коль-мар", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode т е с т / коль-мар",
        input: "т е с т",
        expectedOutput: "тест",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["коль-мар", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode абв / наклейка",
        input: "абв",
        expectedOutput: "ав б",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["наклейка", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode ав б / наклейка",
        input: "ав б",
        expectedOutput: "абв",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["наклейка", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode drops non-Cyrillic",
        input: "hello привет 123 мир!",
        expectedOutput: "пе ртр им ви",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode пе ртр им ви / кольмар",
        input: "пе ртр им ви",
        expectedOutput: "приветмир",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode empty text",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode with no code words errors",
        input: "аб вг",
        expectedOutput: "No code words provided",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode full demo (3 code words, multiline)",
        input: "не стоит называть кольмара кальмаром ведь он обидится и умрет от печали",
        expectedOutput:
            "но еиавкь стз тны\nаомр т ьлаалмрм\nкьаов а\nен дои ьбдсим о\nия т\nуроеаи\nет тпчл",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар наклейка океан", "Russian", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode full demo (3 code words, multiline)",
        input: "но еиавкь стз тны\nаомр т ьлаалмрм\nкьаов а\nен дои ьбдсим о\nия т\nуроеаи\nет тпчл",
        expectedOutput:
            "нестоитназыватькольмаракальмаромведьонобидитсяиумретотпечали",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар наклейка океан", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode squashed to single line",
        input: "привет",
        expectedOutput: "пертив",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Encode", true],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode squashed input",
        input: "пертив",
        expectedOutput: "привет",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Russian", "Decode", false],
            },
        ],
    },

    // ---- Auto alphabet detection ----
    {
        name: "Kolmar Cipher: Auto detects Russian from code words",
        input: "привет",
        expectedOutput: "пе рт и в",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар", "Auto", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: Auto detects English from code words",
        input: "cab",
        expectedOutput: "c a b",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["cat", "Auto", "Encode", false],
            },
        ],
    },

    // ---- English (values hand-derived from the same algorithm) ----
    {
        name: "Kolmar Cipher: encode cab / cat (English)",
        input: "cab",
        expectedOutput: "c a b",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["cat", "English", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode c a b / cat (English)",
        input: "c a b",
        expectedOutput: "cab",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["cat", "English", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: encode cabcab / cat (English, wrap + refill)",
        input: "cabcab",
        expectedOutput: "ccb a ba",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["cat", "English", "Encode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: decode ccb a ba / cat (English)",
        input: "ccb a ba",
        expectedOutput: "cabcab",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["cat", "English", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: English encode drops non-Latin",
        input: "Hello, World! Привет 123",
        expectedOutput: "helloworld",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["programming languages", "English", "Encode", true],
            },
            {
                op: "Kolmar Cipher",
                args: ["programming languages", "English", "Decode", false],
            },
        ],
    },

    // ---- Round-trip invariants: decode(encode(x)) == cleaned(x) ----
    {
        name: "Kolmar Cipher: round-trip Russian full demo",
        input: "не стоит называть кольмара кальмаром ведь он обидится и умрет от печали",
        expectedOutput:
            "нестоитназыватькольмаракальмаромведьонобидитсяиумретотпечали",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: ["кольмар наклейка океан", "Russian", "Encode", false],
            },
            {
                op: "Kolmar Cipher",
                args: ["кольмар наклейка океан", "Russian", "Decode", false],
            },
        ],
    },
    {
        name: "Kolmar Cipher: round-trip English (squashed intermediate)",
        input: "The quick brown fox",
        expectedOutput: "thequickbrownfox",
        recipeConfig: [
            {
                op: "Kolmar Cipher",
                args: [
                    "programming languages are wonderful",
                    "English",
                    "Encode",
                    true,
                ],
            },
            {
                op: "Kolmar Cipher",
                args: [
                    "programming languages are wonderful",
                    "English",
                    "Decode",
                    false,
                ],
            },
        ],
    },
]);
