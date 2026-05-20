/**
 * @author HarelKatz [github.com/HarelKatz]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

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
        this.description = "Converts smart (typographic) Unicode characters — e.g. smart quotes, em/en dashes, ellipses, ©, ®, ™, arrows — into their plain ASCII equivalents.<br><br>Characters with no ASCII mapping (e.g. <code>☣</code>) are handled according to the 'Unmappable characters' option.<br><br>e.g. <code>“Hello” — world…</code> becomes <code>\"Hello\" -- world...</code>";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Unmappable characters",
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
        const [unmappable] = args;
        let result = "";
        for (const ch of input) {
            if (ch.codePointAt(0) < 128) {
                result += ch;
            } else if (Object.prototype.hasOwnProperty.call(SMART_MAP, ch)) {
                result += SMART_MAP[ch];
            } else {
                switch (unmappable) {
                    case "Remove":
                        break;
                    case "Replace with '.'":
                        result += ".";
                        break;
                    case "Include":
                    default:
                        result += ch;
                        break;
                }
            }
        }
        return result;
    }

}

const SMART_MAP = {
    // Smart double quotes
    "“": "\"",   // “ left double quotation mark
    "”": "\"",   // ” right double quotation mark
    "„": "\"",   // „ double low-9 quotation mark
    "‟": "\"",   // ‟ double high-reversed-9 quotation mark
    "″": "\"",   // ″ double prime

    // Smart single quotes / apostrophes
    "‘": "'",    // ‘ left single quotation mark
    "’": "'",    // ’ right single quotation mark / apostrophe
    "‚": "'",    // ‚ single low-9 quotation mark
    "‛": "'",    // ‛ single high-reversed-9 quotation mark
    "′": "'",    // ′ prime

    // Dashes & hyphens
    "‐": "-",    // ‐ hyphen
    "‑": "-",    // ‑ non-breaking hyphen
    "‒": "-",    // ‒ figure dash
    "–": "-",    // – en dash
    "—": "--",   // — em dash
    "―": "--",   // ― horizontal bar

    // Ellipsis
    "…": "...",  // …

    // Trademark / copyright symbols
    "©": "(c)",  // ©
    "®": "(r)",  // ®
    "™": "(tm)", // ™

    // Arrows
    "←": "<--",  // ←
    "→": "-->",  // →
    "↑": "^",    // ↑
    "↓": "v",    // ↓
    "↔": "<->",  // ↔
    "⇐": "<==",  // ⇐
    "⇒": "==>",  // ⇒
    "⇔": "<=>",  // ⇔

    // Guillemets
    "«": "<<",   // «
    "»": ">>",   // »
    "‹": "<",    // ‹
    "›": ">",    // ›

    // Math & misc symbols
    "×": "x",    // ×
    "÷": "/",    // ÷
    "±": "+/-",  // ±
    "•": "*",    // •
    "·": ".",    // ·

    // Non-ASCII spaces
    " ": " ",    // NBSP
    " ": " ",    // en space
    " ": " ",    // em space
    " ": " ",    // thin space
    " ": " "     // hair space
};

export default EscapeSmartCharacters;
