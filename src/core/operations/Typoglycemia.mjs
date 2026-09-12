/**
 * @author avantguard cyber security AG
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Matches a single word: a letter followed by further letters and combining marks.
 * Hyphens and apostrophes are deliberately excluded so that they act as word
 * boundaries and can never be shuffled into the middle of a word.
 */
const WORD_REGEX = /\p{L}[\p{L}\p{M}]*/gu;

/**
 * Scripts without alphabetic word recognition. Transposing these characters
 * corrupts the text without producing any typoglycemia effect, so such words
 * are passed through untouched.
 */
const IDEOGRAPHIC_REGEX = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

/**
 * Matches one grapheme cluster: a base character together with any combining
 * marks that follow it.
 */
const CLUSTER_REGEX = /\P{M}\p{M}*/gu;

/**
 * Number of candidate scrambles generated per word before the best one is picked.
 */
const CANDIDATES = 12;

/**
 * Creates a seeded pseudo random number generator returning values in [0, 1).
 *
 * @param {number} seed
 * @returns {function(): number}
 */
function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
        a = a + 0x6D2B79F5 | 0;
        let t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Builds the set of open bigrams of a string: every ordered pair of characters
 * no more than two positions apart. Reading models (Grainger & Whitney) treat
 * the overlap of these sets as a proxy for how recognisable a scrambled word
 * remains.
 *
 * @param {string[]} chars
 * @returns {Set<string>}
 */
function openBigrams(chars) {
    const set = new Set();
    for (let i = 0; i < chars.length; i++) {
        for (let j = i + 1; j <= Math.min(i + 2, chars.length - 1); j++) {
            set.add(chars[i] + chars[j]);
        }
    }
    return set;
}

/**
 * Fraction of the original's open bigrams that survive in the scrambled version.
 * 1 means perfectly readable, 0 means nothing recognisable is left.
 *
 * @param {string[]} original
 * @param {string[]} scrambled
 * @returns {number}
 */
function bigramOverlap(original, scrambled) {
    const before = openBigrams(original);
    const after = openBigrams(scrambled);
    if (before.size === 0) return 1;
    let kept = 0;
    for (const bigram of before) {
        if (after.has(bigram)) kept++;
    }
    return kept / before.size;
}

/**
 * Fraction of positions holding a different character than before.
 *
 * @param {string[]} original
 * @param {string[]} scrambled
 * @returns {number}
 */
function movedFraction(original, scrambled) {
    let moved = 0;
    for (let i = 0; i < original.length; i++) {
        if (original[i] !== scrambled[i]) moved++;
    }
    return original.length ? moved / original.length : 0;
}

/**
 * Displacement bounded permutation. Each character is given a sort key of its
 * own index plus uniform noise, so characters drift by roughly `amp` positions
 * rather than being scattered anywhere in the word. This is what preserves
 * readability: transpositions stay local.
 *
 * @param {string[]} chars
 * @param {number} amp
 * @param {function(): number} rnd
 * @returns {string[]}
 */
function jitterSort(chars, amp, rnd) {
    return chars
        .map((c, i) => [i + amp * (rnd() * 2 - 1), c])
        .sort((a, b) => a[0] - b[0])
        .map(entry => entry[1]);
}

/**
 * Unbounded uniform shuffle, used at maximum intensity where readability is
 * explicitly not the goal.
 *
 * @param {string[]} chars
 * @param {function(): number} rnd
 * @returns {string[]}
 */
function fullShuffle(chars, rnd) {
    const out = chars.slice();
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Scrambles a word's middle characters as far as possible while keeping enough
 * open bigrams intact to stay readable. Several candidates are generated and
 * the most scrambled one clearing the readability floor wins.
 *
 * @param {string[]} middle
 * @param {number} amp
 * @param {number} floor
 * @param {function(): number} rnd
 * @returns {string[]}
 */
function scrambleMiddle(middle, amp, floor, rnd) {
    if (middle.length < 2) return middle;

    let best = null;
    let bestMoved = -1;
    for (let i = 0; i < CANDIDATES; i++) {
        const candidate = amp === Infinity ?
            fullShuffle(middle, rnd) :
            jitterSort(middle, amp, rnd);
        const moved = movedFraction(middle, candidate);
        if (moved === 0) continue;
        if (bigramOverlap(middle, candidate) < floor) continue;
        if (moved > bestMoved) {
            best = candidate;
            bestMoved = moved;
        }
    }
    if (best) return best;

    // Nothing cleared the floor, so guarantee a visible effect with the most
    // conservative change available: a single adjacent transposition.
    const out = middle.slice();
    const i = Math.floor(rnd() * (out.length - 1));
    [out[i], out[i + 1]] = [out[i + 1], out[i]];
    return out;
}

/**
 * Typoglycemia operation
 */
class Typoglycemia extends Operation {

    /**
     * Typoglycemia constructor
     */
    constructor() {
        super();

        this.name = "Typoglycemia";
        this.module = "Default";
        this.description = "Scrambles the middle letters of each word while keeping the first and last letter in place, so the text usually stays readable thanks to the typoglycemia phenomenon.<br><br>Letters are displaced only a short distance rather than shuffled at random, which is what preserves readability. The intensity (1-10) controls how far they may travel: 1 is a light touch, 5 gives the classic effect, 10 abandons readability for a full shuffle.<br><br>A seed of 0 scrambles differently every time; any other value produces reproducible output.";
        this.infoURL = "https://wikipedia.org/wiki/Transposed_letter_effect#Internet_meme";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Intensity",
                type: "number",
                value: 5
            },
            {
                name: "Minimum word length",
                type: "number",
                value: 4
            },
            {
                name: "Seed",
                type: "number",
                value: 1
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [intensity, minWordLength, seed] = args;

        if (isNaN(intensity) || intensity < 1 || intensity > 10)
            throw new OperationError("Intensity must be between 1 and 10.");
        if (isNaN(minWordLength) || minWordLength < 3)
            throw new OperationError("Minimum word length must be at least 3.");

        // Displacement amplitude grows with intensity while the readability
        // floor drops, trading recognisability for scrambling. At the top of
        // the scale both constraints are removed entirely.
        const amp = intensity >= 10 ? Infinity : 0.7 + 0.3 * intensity;
        const floor = intensity >= 10 ? 0 : Math.max(0, 0.9 - 0.05 * intensity);
        const rnd = seed === 0 ? Math.random : mulberry32(seed);

        return input.replace(WORD_REGEX, (word) => {
            // Split into grapheme clusters rather than code points so that a
            // combining mark always travels with the character it decorates,
            // instead of drifting onto a different letter.
            const clusters = word.match(CLUSTER_REGEX) ?? [];
            if (clusters.length < minWordLength) return word;
            if (IDEOGRAPHIC_REGEX.test(word)) return word;

            // Scramble in lower case, then restore the original capitalisation
            // by position. Word shape is a reading cue, so "McDonald" should
            // stay front-loaded with capitals rather than move them around.
            const lower = clusters.map(c => c.toLowerCase());
            const middle = scrambleMiddle(lower.slice(1, -1), amp, floor, rnd);
            const scrambled = [lower[0], ...middle, lower[clusters.length - 1]];

            return scrambled.map((c, i) => {
                const original = clusters[i];
                const isUpper = original === original.toUpperCase() &&
                    original !== original.toLowerCase();
                return isUpper ? c.toUpperCase() : c;
            }).join("");
        });
    }

}

export default Typoglycemia;
