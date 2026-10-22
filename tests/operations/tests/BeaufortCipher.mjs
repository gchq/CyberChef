/**
 * Beaufort Cipher tests
 *
 * @author MarekConto
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    // Reference: https://www.dcode.fr/beaufort-cipher
    {
        name: "Beaufort: known plaintext",
        input: "DCODE",
        expectedOutput: "HCKHA",
        recipeConfig: [{op: "Beaufort Cipher", args: ["KEY"]}]
    },
    {
        name: "Beaufort: known ciphertext",
        input: "HCKHA",
        expectedOutput: "DCODE",
        recipeConfig: [{op: "Beaufort Cipher", args: ["KEY"]}]
    },
    {
        name: "Beaufort: mixed case key and input",
        input: "DcOdE",
        expectedOutput: "HcKhA",
        recipeConfig: [{op: "Beaufort Cipher", args: ["kEy"]}]
    },
    {
        name: "Beaufort: nonletters do not advance the key",
        input: "D éc0KO!İd\r\nſE😀D",
        expectedOutput: "H éc0KK!İh\r\nſA😀V",
        recipeConfig: [{op: "Beaufort Cipher", args: ["KEY"]}]
    },
    {
        name: "Beaufort: whole alphabet with one-letter key",
        input: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        expectedOutput: "AZYXWVUTSRQPONMLKJIHGFEDCB",
        recipeConfig: [{op: "Beaufort Cipher", args: ["A"]}]
    },
    {
        name: "Beaufort: key longer than input",
        input: "ABC",
        expectedOutput: "LNL",
        recipeConfig: [{op: "Beaufort Cipher", args: ["LONGKEY"]}]
    },
    {
        name: "Beaufort: empty input",
        input: "",
        expectedOutput: "",
        recipeConfig: [{op: "Beaufort Cipher", args: ["KEY"]}]
    },
    {
        name: "Beaufort: no ASCII letters",
        input: "0123 !\t\r\néKİſ😀",
        expectedOutput: "0123 !\t\r\néKİſ😀",
        recipeConfig: [{op: "Beaufort Cipher", args: ["KEY"]}]
    },
    {
        name: "Beaufort: reciprocal recipe",
        input: "Attack at dawn!\r\nZebra 123 é😀",
        expectedOutput: "Attack at dawn!\r\nZebra 123 é😀",
        recipeConfig: [
            {op: "Beaufort Cipher", args: ["FORTIFICATION"]},
            {op: "Beaufort Cipher", args: ["FORTIFICATION"]}
        ]
    },
    ...["", "A1", "A B", "KEY\n", "é", "K", "İ", "ſ"].flatMap(key => ["DCODE", ""].map(input => ({
        name: `Beaufort: invalid key ${JSON.stringify(key)}${input === "" ? " with empty input" : ""}`,
        input,
        expectedOutput: key === "" ? "Key cannot be empty." : "The key must consist only of letters A-Z.",
        recipeConfig: [{op: "Beaufort Cipher", args: [key]}]
    })))
]);
