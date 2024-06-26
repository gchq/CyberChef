/**
 * @author Arnim Rupp https://github.com/2d4d/crypto_puzzles
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */


import TestRegister from "../../lib/TestRegister.mjs";

TestRegister.addTests([
    {
        name: "Convert to Emoji alphabet: nothing",
        input: "",
        expectedOutput: "",
        recipeConfig: [
            {
                op: "Convert to Emoji alphabet",
                args: []
            }
        ]
    },
    {
        name: "Convert to Emoji alphabet: full alphabet with numbers",
        input: "abcdefghijklmnopqrstuvwxyz1234567890,.-#+*-",
        expectedOutput: "🐜 🐻 ℃  🐬 🐘 🦊 🦒 🐹 ℹ️ ʝ 🦘 🦁 🐁 ℕ 🐙 🐧 🂭 🐀 🐍 🐅 ᶙ ✌ 🐋 ⚔️ ¥ 🦓 🥇 ⚁ ᗱ ༥ ⚄ 🃖 ㇴ 🎱 9️⃣ 🅾️  , . ➖ #️⃣ ➕ ✳️ ➖ ",
        recipeConfig: [
            {
                op: "Convert to Emoji alphabet",
                args: []
            }
        ]
    }
]);
