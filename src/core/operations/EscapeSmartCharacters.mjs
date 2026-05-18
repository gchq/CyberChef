/**
 * @author min23asdw
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Map of smart characters to their plain ASCII equivalents.
 */
const ESCAPE_MAP = {
    // Quotation marks
    "\u2018": "'",     // ' LEFT SINGLE QUOTATION MARK
    "\u2019": "'",     // ' RIGHT SINGLE QUOTATION MARK
    "\u201A": "'",     // ‚ SINGLE LOW-9 QUOTATION MARK
    "\u201B": "'",     // ‛ SINGLE HIGH-REVERSED-9 QUOTATION MARK
    "\u201C": "\"",    // " LEFT DOUBLE QUOTATION MARK
    "\u201D": "\"",    // " RIGHT DOUBLE QUOTATION MARK
    "\u201E": "\"",    // „ DOUBLE LOW-9 QUOTATION MARK
    "\u201F": "\"",    // ‟ DOUBLE HIGH-REVERSED-9 QUOTATION MARK
    "\u2039": "<",     // ‹ SINGLE LEFT-POINTING ANGLE QUOTATION MARK
    "\u203A": ">",     // › SINGLE RIGHT-POINTING ANGLE QUOTATION MARK
    "\u00AB": "<<",    // « LEFT-POINTING DOUBLE ANGLE QUOTATION MARK
    "\u00BB": ">>",    // » RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK

    // Primes
    "\u2032": "'",     // ′ PRIME
    "\u2033": "''",    // ″ DOUBLE PRIME
    "\u2034": "'''",   // ‴ TRIPLE PRIME
    "\u2035": "'",     // ‵ REVERSED PRIME
    "\u2036": "''",    // ‶ REVERSED DOUBLE PRIME
    "\u2037": "'''",   // ‷ REVERSED TRIPLE PRIME
    "\u2057": "''''",  // ⁗ QUADRUPLE PRIME

    // Dashes and hyphens
    "\u2010": "-",     // ‐ HYPHEN
    "\u2011": "-",     // ‑ NON-BREAKING HYPHEN
    "\u2012": "-",     // ‒ FIGURE DASH
    "\u2013": "-",     // – EN DASH
    "\u2014": "--",    // — EM DASH
    "\u2015": "--",    // ― HORIZONTAL BAR

    // Symbols
    "\u00A9": "(C)",   // © COPYRIGHT SIGN
    "\u00AE": "(R)",   // ® REGISTERED SIGN
    "\u2122": "(TM)",  // ™ TRADE MARK SIGN

    // Arrows
    "\u2190": "<--",   // ← LEFTWARDS ARROW
    "\u2192": "-->",   // → RIGHTWARDS ARROW
    "\u2194": "<->",   // ↔ LEFT RIGHT ARROW
    "\u21D0": "<==",   // ⇐ LEFTWARDS DOUBLE ARROW
    "\u21D2": "==>",   // ⇒ RIGHTWARDS DOUBLE ARROW
    "\u21D4": "<=>",   // ⇔ LEFT RIGHT DOUBLE ARROW

    // Dots, bullets, and ellipsis
    "\u2022": ".",     // • BULLET
    "\u2023": ">",     // ‣ TRIANGULAR BULLET
    "\u2024": ".",     // ․ ONE DOT LEADER
    "\u2025": "..",    // ‥ TWO DOT LEADER
    "\u2026": "...",   // … HORIZONTAL ELLIPSIS
    "\u2027": ".",     // ‧ HYPHENATION POINT

    // Misc punctuation
    "\u2016": "||",    // ‖ DOUBLE VERTICAL LINE
    "\u2017": "==",    // ‗ DOUBLE LOW LINE
    "\u2030": "%0",    // ‰ PER MILLE SIGN
    "\u2031": "%00",   // ‱ PER TEN THOUSAND SIGN
    "\u2038": "^",     // ‸ CARET
    "\u203C": "!!",    // ‼ DOUBLE EXCLAMATION MARK
    "\u203D": "?!",    // ‽ INTERROBANG
    "\u2043": "-",     // ⁃ HYPHEN BULLET
    "\u2044": "/",     // ⁄ FRACTION SLASH
    "\u2045": "[-",    // ⁅ LEFT SQUARE BRACKET WITH QUILL
    "\u2046": "-]",    // ⁆ RIGHT SQUARE BRACKET WITH QUILL
    "\u2047": "??",    // ⁇ DOUBLE QUESTION MARK
    "\u2048": "?!",    // ⁈ QUESTION EXCLAMATION MARK
    "\u2049": "!?",    // ⁉ EXCLAMATION QUESTION MARK
    "\u204E": "*",     // ⁎ LOW ASTERISK
    "\u204F": ";",     // ⁏ REVERSED SEMICOLON
    "\u2052": "%",     // ⁒ COMMERCIAL MINUS SIGN
    "\u2053": "~",     // ⁓ SWUNG DASH
    "\u2055": "*",     // ⁕ FLOWER PUNCTUATION MARK

    // Invisible operators
    "\u2062": "*",     // INVISIBLE TIMES
    "\u2064": "+",     // INVISIBLE PLUS

    // Spaces
    "\u00A0": " ",     // NO-BREAK SPACE
};

/**
 * Escape Smart Characters operation
 */
class EscapeSmartCharacters extends Operation {

    /**
     * EscapeSmartCharacters constructor
     */
    constructor() {
        super();

        this.name = "Escape Smart Characters";
        this.module = "Default";
        this.description = "Converts smart characters (quotes, dashes, apostrophes, arrows, copyright signs, ellipses etc.) to their plain ASCII equivalents.<br><br>For characters with no obvious ASCII equivalent, the specified action will be applied.";
        this.infoURL = "https://wikipedia.org/wiki/Smart_quotes";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Unrecognised characters",
                type: "option",
                value: ["Include", "Remove", "Replace with '.'"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [unrecognisedAction] = args;
        const result = [];

        for (const char of input) {
            if (char in ESCAPE_MAP) {
                result.push(ESCAPE_MAP[char]);
            } else if (char.codePointAt(0) > 0x7F) {
                switch (unrecognisedAction) {
                    case "Remove":
                        break;
                    case "Replace with '.'":
                        result.push(".");
                        break;
                    default:
                        result.push(char);
                }
            } else {
                result.push(char);
            }
        }

        return result.join("");
    }

}

export default EscapeSmartCharacters;
