/**
 * @author Arnim Rupp https://github.com/2d4d/crypto_puzzles
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Convert to Emoji alphabet operation
 */
class ConvertToEmojiAlphabet extends Operation {
    /**
     * ConvertToEmojiAlphabet constructor
     */
    constructor() {
        super();

        this.name = "Convert to Emoji alphabet";
        this.module = "Default";
        this.description = "This is a fun 'cipher' for kids. Converts characters to their representation in the Emoji animal alphabet, matching first letters of the animal. Can be combined with 'Generate QR Code'.";
        this.infoURL = "https://en.wikipedia.org/wiki/Emoji";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        return input.replace(/[a-z0-9,.\-+*#?! ]/ig, letter => {
            return lookup[letter.toUpperCase()];
        });
    }
}

const lookup = {
    "A": "🐜 ",
    "B": "🐻 ",
    "C": "℃  ",
    "D": "🐬 ",
    "E": "🐘 ",
    "F": "🦊 ",
    "G": "🦒 ",
    "H": "🐹 ",
    "I": "ℹ️ ",
    "J": "ʝ ",
    "K": "🦘 ",
    "L": "🦁 ",
    "M": "🐁 ",
    "N": "ℕ ",
    "O": "🐙 ",
    "P": "🐧 ",
    "Q": "🂭 ",
    "R": "🐀 ",
    "S": "🐍 ",
    "T": "🐅 ",
    "U": "ᶙ ",
    "V": "✌ ",
    "W": "🐋 ",
    "X": "⚔️ ",
    "Y": "¥ ",
    "Z": "🦓 ",
    "0": "🅾️  ",
    "1": "🥇 ",
    "2": "⚁ ",
    "3": "ᗱ ",
    "4": "༥ ",
    "5": "⚄ ",
    "6": "🃖 ",
    "7": "ㇴ ",
    "8": "🎱 ",
    "9": "9️⃣ ",
    "+": "➕ ",
    "-": "➖ ",
    "#": "#️⃣ ",
    "*": "✳️ ",
    ".": ". ",
    ",": ", ",
    " ": "  ",
    "?": "� ",
    "!": "❗️ "

};

export default ConvertToEmojiAlphabet;
