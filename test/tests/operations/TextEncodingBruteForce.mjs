/**
 * Text Encoding Brute Force tests.
 *
 * @author Cynser
 *
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */
import TestRegister from "../../TestRegister";

TestRegister.addTests([
    {
        name: "Text Encoding Brute Force - Encode",
        input: "Р‘СѓР»РєС– РїСЂР°Р· Р»СЏРЅС–РІР° СЃР°Р±Р°РєСѓ.",
        expectedMatch: /Windows-1251 Cyrillic \(1251\): Булкі праз ляніва сабаку\./,
        recipeConfig: [
            {
                op: "Text Encoding Brute Force",
                args: ["Encode"],
            },
        ],
    },
    {
        name: "Text Encoding Brute Force - Decode",
        input: "Áóëê³ ïðàç ëÿí³âà ñàáàêó.",
        expectedMatch: /Windows-1251 Cyrillic \(1251\): Булкі праз ляніва сабаку\./,
        recipeConfig: [
            {
                op: "Text Encoding Brute Force",
                args: ["Decode"],
            },
        ],
    }
]);

