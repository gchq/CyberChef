/**
 * @author Alexei Baranov
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Alphabet definitions the cipher can operate on. `alpha` is the ordered
 * alphabet (a letter's value comes from its 1-based position), `vowels` drive
 * automatic syllable division and `sonor` lists the sonorant letters that stay
 * with the preceding vowel.
 *
 * The English sets mirror the Russian ones: liquids (l, r) and nasals (m, n)
 * plus the glides w and y stand in for "йлмнр" and "й"; there is no analogue of
 * the Russian soft sign "ь".
 */
const ALPHABETS = {
    Russian: {
        alpha: "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
        vowels: "аеёиоуыэюя",
        sonor: "йлмнрь"
    },
    English: {
        alpha: "abcdefghijklmnopqrstuvwxyz",
        vowels: "aeiou",
        sonor: "lmnrwy"
    }
};

/**
 * Guess which alphabet a set of code words is written in by counting how many
 * of their letters belong to each alphabet. Ties (and text with no letters at
 * all) fall back to Russian.
 *
 * @param {string} codeWords
 * @returns {string} "Russian" or "English"
 */
function detectAlphabet(codeWords) {
    let ru = 0, en = 0;
    for (const ch of codeWords.toLowerCase()) {
        if (ALPHABETS.Russian.alpha.indexOf(ch) >= 0) ru++;
        else if (ALPHABETS.English.alpha.indexOf(ch) >= 0) en++;
    }
    return en > ru ? "English" : "Russian";
}

/**
 * Compute the value of a letter: its 1-based position within the alphabet,
 * reduced to the largest decimal digit of that position when the position has
 * more than one digit. E.g. к -> position 12 -> max digit 2.
 *
 * @param {string} letter
 * @param {string} alpha
 * @returns {number}
 */
function letterValue(letter, alpha) {
    const pos = alpha.indexOf(letter) + 1;
    if (pos <= 0) return 0;
    let max = 0;
    for (const digit of String(pos)) {
        const n = Number(digit);
        if (n > max) max = n;
    }
    return max;
}

/**
 * Split a code word into syllables.
 *
 * If the word contains a hyphen, it is split strictly on hyphens (manual
 * division). Otherwise automatic division is applied: after each vowel the run
 * of consonants up to the next vowel is examined; the leading sonorants of that
 * run stay with the current syllable while the final consonant (the onset of
 * the next vowel) and anything from the first non-sonorant onwards move to the
 * start of the next syllable. Consonants trailing the last vowel stay put.
 *
 * @param {string} word
 * @param {Object} ab - alphabet definition
 * @returns {string[]}
 */
function syllables(word, ab) {
    word = word.toLowerCase();
    if (word.indexOf("-") >= 0) {
        return word.split("-").filter(s => s.length > 0);
    }

    const isVowel = ch => ab.vowels.indexOf(ch) >= 0;
    const isSonor = ch => ab.sonor.indexOf(ch) >= 0;

    const result = [];
    let cur = "";
    let i = 0;
    while (i < word.length) {
        const ch = word[i];
        cur += ch;
        i++;

        if (isVowel(ch)) {
            // Gather the consonant run up to the next vowel.
            let group = "";
            let j = i;
            while (j < word.length && !isVowel(word[j])) {
                group += word[j];
                j++;
            }

            if (j >= word.length) {
                // No further vowel: trailing consonants stay in this syllable.
                cur += group;
                i = j;
            } else {
                // The final consonant of the run always starts the next
                // syllable; only the leading sonorants before it stay.
                let stay = 0;
                const allButLast = group.length - 1;
                while (stay < allButLast && isSonor(group[stay])) stay++;
                cur += group.slice(0, stay);
                result.push(cur);
                cur = group.slice(stay);
                i = j;
            }
        }
    }
    if (cur.length > 0) result.push(cur);
    return result;
}

/**
 * Build the row/box structure from the code words. Each code word is split into
 * syllables; every syllable becomes a row and every letter of the syllable
 * becomes a box whose capacity is that letter's value.
 *
 * @param {string} codeWordsStr
 * @param {Object} ab - alphabet definition
 * @returns {Object[][]} rows - array of rows, each an array of {cap}
 */
function buildRows(codeWordsStr, ab) {
    const words = codeWordsStr.trim().split(/\s+/).filter(w => w.length > 0);
    const rows = [];
    for (const word of words) {
        for (const syllable of syllables(word, ab)) {
            const boxes = [];
            for (const letter of syllable) {
                boxes.push({cap: letterValue(letter, ab.alpha)});
            }
            if (boxes.length > 0) rows.push(boxes);
        }
    }
    return rows;
}

/**
 * Run the layout algorithm for `n` letters over the given rows. The letters
 * themselves are irrelevant - only their count matters - so this drives both
 * encoding and decoding and is independent of the alphabet in use.
 *
 * @param {number} n - number of letters to place
 * @param {Object[][]} rows
 * @returns {Object[]} order - for each placed letter, the {r, b} box it went to
 */
function layout(n, rows) {
    const order = [];
    if (rows.length === 0) return order;

    // Per-box fill counters.
    const counts = rows.map(row => row.map(() => 0));

    // Rows are "born" in order; only born rows participate.
    const aliveRows = [];
    let nextUnborn = 0;
    const birth = () => {
        aliveRows.push(nextUnborn);
        nextUnborn++;
    };
    birth();

    // Flat, ordered list of the boxes of all alive rows. Because rows are born
    // in index order and appended, an already computed flat index stays valid.
    const aliveBoxes = () => {
        const list = [];
        for (const r of aliveRows) {
            for (let b = 0; b < rows[r].length; b++) list.push({r, b});
        }
        return list;
    };

    let cur = -1; // position before the first box
    for (let k = 0; k < n; k++) {
        const boxes = aliveBoxes();

        // Locate open boxes.
        let openCount = 0;
        let onlyOpen = -1;
        for (let idx = 0; idx < boxes.length; idx++) {
            const {r, b} = boxes[idx];
            if (counts[r][b] < rows[r][b].cap) {
                openCount++;
                onlyOpen = idx;
            }
        }

        // Special case: the only open box is the one we just used, so the letter
        // would land there twice in a row. Prefer birthing a new row instead.
        if (openCount === 1 && onlyOpen === cur && nextUnborn < rows.length) {
            birth();
            const after = aliveBoxes();
            const bornRow = aliveRows[aliveRows.length - 1];
            const first = after.length - rows[bornRow].length;
            const t = after[first];
            counts[t.r][t.b]++;
            order.push(t);
            cur = first;
            continue;
        }

        // No open boxes at all: birth the next row if we can, else stop.
        if (openCount === 0) {
            if (nextUnborn < rows.length) {
                birth();
                const after = aliveBoxes();
                const bornRow = aliveRows[aliveRows.length - 1];
                const first = after.length - rows[bornRow].length;
                const t = after[first];
                counts[t.r][t.b]++;
                order.push(t);
                cur = first;
                continue;
            }
            break; // remaining letters are dropped
        }

        // Normal case: walk the circle from the box after the current position.
        const m = boxes.length;
        let found = -1;
        for (let step = 1; step <= m; step++) {
            const idx = (cur + step) % m;
            const {r, b} = boxes[idx];
            if (counts[r][b] < rows[r][b].cap) {
                found = idx;
                break;
            }
        }
        const t = boxes[found];
        counts[t.r][t.b]++;
        order.push(t);
        cur = found;
    }

    return order;
}

/**
 * Reduce arbitrary input to the letters the cipher operates on: lower-case
 * characters that belong to the alphabet. Everything else is discarded.
 *
 * @param {string} text
 * @param {string} alpha
 * @returns {string}
 */
function clean(text, alpha) {
    let out = "";
    for (const ch of text.toLowerCase()) {
        if (alpha.indexOf(ch) >= 0) out += ch;
    }
    return out;
}

/**
 * Kolmar Cipher operation.
 */
class KolmarCipher extends Operation {

    /**
     * KolmarCipher constructor
     */
    constructor() {
        super();

        this.name = "Kolmar Cipher";
        this.module = "Ciphers";
        this.description = "A custom transposition cipher driven by one or more code words, working on either the Russian or English alphabet.<br><br>Each code word is split into syllables (use a hyphen to divide syllables manually, e.g. <code>коль-мар</code> / <code>ho-tel</code>); every syllable defines a row of boxes and every letter's alphabet position gives the capacity of a box. The cleaned text (letters of the chosen alphabet only, everything else is dropped) is dealt into the boxes row by row, birthing new rows as boxes fill up, and read back out box by box to form the cipher text.<br><br>With <code>Alphabet</code> set to <code>Auto</code> the alphabet is inferred from the code words. Decoding reverses the layout, returning the run-together plaintext (spaces are not restored because they are never encoded).";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Code words",
                type: "string",
                value: ""
            },
            {
                name: "Alphabet",
                type: "option",
                value: ["Auto", "Russian", "English"]
            },
            {
                name: "Mode",
                type: "option",
                value: ["Encode", "Decode"]
            },
            {
                name: "Squash to single line",
                type: "boolean",
                value: false
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [codeWords, alphabetArg, mode, squash] = args;

        const lang = alphabetArg === "Auto" ? detectAlphabet(codeWords) : alphabetArg;
        const ab = ALPHABETS[lang] || ALPHABETS.Russian;

        const rows = buildRows(codeWords, ab);
        if (rows.length === 0) {
            throw new OperationError("No code words provided");
        }

        if (mode === "Decode") {
            return this.decode(input, rows);
        }
        return this.encode(input, rows, ab, squash);
    }

    /**
     * Encode the input text.
     *
     * @param {string} input
     * @param {Object[][]} rows
     * @param {Object} ab - alphabet definition
     * @param {boolean} squash
     * @returns {string}
     */
    encode(input, rows, ab, squash) {
        const cleaned = clean(input, ab.alpha);
        const order = layout(cleaned.length, rows);

        // Deal the letters into their boxes, preserving insertion order.
        const boxLetters = rows.map(row => row.map(() => []));
        for (let k = 0; k < order.length; k++) {
            boxLetters[order[k].r][order[k].b].push(cleaned[k]);
        }

        // Read boxes back out, skipping any that never received a letter.
        const lines = [];
        for (let r = 0; r < rows.length; r++) {
            const parts = [];
            for (let b = 0; b < rows[r].length; b++) {
                if (boxLetters[r][b].length > 0) parts.push(boxLetters[r][b].join(""));
            }
            if (parts.length > 0) lines.push(parts.join(" "));
        }

        let result = lines.join("\n");
        if (squash) result = result.replace(/\s+/g, "");
        return result;
    }

    /**
     * Decode the cipher text.
     *
     * @param {string} input
     * @param {Object[][]} rows
     * @returns {string}
     */
    decode(input, rows) {
        // Collapse all whitespace: the cipher text is just the run of letters.
        const cipher = input.replace(/\s+/g, "");
        const order = layout(cipher.length, rows);

        // For each box, the original indices of the letters it holds, in order.
        const boxPositions = rows.map(row => row.map(() => []));
        for (let k = 0; k < order.length; k++) {
            boxPositions[order[k].r][order[k].b].push(k);
        }

        // Walk the boxes in read order, mapping cipher letters back to their
        // original positions.
        const plain = new Array(order.length);
        let ptr = 0;
        for (let r = 0; r < rows.length; r++) {
            for (let b = 0; b < rows[r].length; b++) {
                for (const origIdx of boxPositions[r][b]) {
                    plain[origIdx] = cipher[ptr++];
                }
            }
        }

        return plain.join("");
    }

}

export default KolmarCipher;
