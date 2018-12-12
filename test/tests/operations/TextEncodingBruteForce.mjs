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
        name: "Text Encoding Brute Force",
        input: "Р‘СѓР»РєС– РїСЂР°Р· Р»СЏРЅС–РІР° СЃР°Р±Р°РєСѓ.",
        expectedMatch: /Windows-1251 Cyrillic \(1251\): Булкі праз ляніва сабаку\./,
        recipeConfig: [
            {
                op: "Text Encoding Brute Force",
                args: [],
            },
        ],
    }
]);

