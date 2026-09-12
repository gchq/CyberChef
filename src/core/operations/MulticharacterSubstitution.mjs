/**
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/**
 * Multi-character Substitution operation.
 */
class MulticharacterSubstitution extends Operation {
    /**
     * MulticharacterSubstitution constructor.
     */
    constructor() {
        super();
        this.name = "Multi-character Substitution";
        this.module = "Default";
        this.description = "Replaces literal strings in a single, case-sensitive pass. At each position the longest matching key wins. Replacements are not processed again and unmatched text is preserved.<br><br>The number-word presets convert full English number words or their first two or three letters to digits. For example, <code>thsetwfinize</code> becomes <code>372590</code> with the two-letter preset.<br><br>Custom dictionaries are JSON objects such as <code>{&quot;foo&quot;:&quot;bar&quot;,&quot;remove&quot;:&quot;&quot;}</code>. Keys must be non-empty and values must be strings. Regular-expression and replacement syntax are treated literally. Custom JSON is limited to 65536 characters and 4096 mappings.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Dictionary",
                type: "option",
                value: ["Number words", "Two-letter number words", "Three-letter number words", "Custom"]
            },
            {
                name: "Custom dictionary",
                type: "text",
                value: "{}"
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [preset, custom] = args;
        let entries;
        if (preset === "Custom") {
            if (custom.length > 65536) {
                throw new OperationError("Custom dictionary must be at most 65536 characters.");
            }
            let parsed;
            try {
                parsed = JSON.parse(custom);
            } catch {
                throw new OperationError("Custom dictionary must be a JSON object mapping non-empty strings to strings.");
            }
            if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
                throw new OperationError("Custom dictionary must be a JSON object mapping non-empty strings to strings.");
            }
            entries = Object.entries(parsed);
            if (entries.some(([key, value]) => key.length === 0 || typeof value !== "string")) {
                throw new OperationError("Custom dictionary must be a JSON object mapping non-empty strings to strings.");
            }
            if (entries.length > 4096) {
                throw new OperationError("Custom dictionary must contain at most 4096 mappings.");
            }
        } else {
            const lengths = new Map([
                ["Number words", undefined],
                ["Two-letter number words", 2],
                ["Three-letter number words", 3]
            ]);
            if (!lengths.has(preset)) {
                throw new OperationError("Unknown dictionary preset.");
            }
            entries = NUMBER_WORDS.map((word, digit) => [word.slice(0, lengths.get(preset)), String(digit)]);
        }
        if (entries.length === 0) return input;
        const dictionary = new Map(entries);
        const pattern = [...dictionary.keys()]
            .sort((a, b) => b.length - a.length)
            .map(key => Utils.escapeRegex(key))
            .join("|");
        return input.replace(new RegExp(pattern, "g"), match => dictionary.get(match));
    }
}

export default MulticharacterSubstitution;
