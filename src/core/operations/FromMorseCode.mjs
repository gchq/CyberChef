/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import {LETTER_DELIM_OPTIONS, WORD_DELIM_OPTIONS} from "../lib/Delim";

/**
 * From Morse Code operation
 */
class FromMorseCode extends Operation {

    /**
     * FromMorseCode constructor
     */
    constructor() {
        super();

        this.name = "From Morse Code";
        this.module = "Default";
        this.description = "Translates Morse Code into (upper case) alphanumeric characters.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Letter delimiter",
                "type": "option",
                "value": LETTER_DELIM_OPTIONS
            },
            {
                "name": "Word delimiter",
                "type": "option",
                "value": WORD_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        if (!this.reversedTable) {
            this.reverseTable();
        }

        const letterDelim = Utils.charRep(args[0]);
        const wordDelim = Utils.charRep(args[1]);

        input = input.replace(/-|‐|−|_|–|—|dash/ig, "<dash>"); //hyphen-minus|hyphen|minus-sign|undersore|en-dash|em-dash
        input = input.replace(/\.|·|dot/ig, "<dot>");

        let words = input.split(wordDelim);
        const self = this;
        words = Array.prototype.map.call(words, function(word) {
            const signals = word.split(letterDelim);

            const letters = signals.map(function(signal) {
                return self.reversedTable[signal];
            });

            return letters.join("");
        });
        words = words.join(" ");

        return words;
    }


    /**
     * Reverses the Morse Code lookup table
     */
    reverseTable() {
        this.reversedTable = {};

        for (const letter in MORSE_TABLE) {
            const signal = MORSE_TABLE[letter];
            this.reversedTable[signal] = letter;
        }
    }

}

const MORSE_TABLE = {
    "A": "<dot><dash>",
    "B": "<dash><dot><dot><dot>",
    "C": "<dash><dot><dash><dot>",
    "D": "<dash><dot><dot>",
    "E": "<dot>",
    "F": "<dot><dot><dash><dot>",
    "G": "<dash><dash><dot>",
    "H": "<dot><dot><dot><dot>",
    "I": "<dot><dot>",
    "J": "<dot><dash><dash><dash>",
    "K": "<dash><dot><dash>",
    "L": "<dot><dash><dot><dot>",
    "M": "<dash><dash>",
    "N": "<dash><dot>",
    "O": "<dash><dash><dash>",
    "P": "<dot><dash><dash><dot>",
    "Q": "<dash><dash><dot><dash>",
    "R": "<dot><dash><dot>",
    "S": "<dot><dot><dot>",
    "T": "<dash>",
    "U": "<dot><dot><dash>",
    "V": "<dot><dot><dot><dash>",
    "W": "<dot><dash><dash>",
    "X": "<dash><dot><dot><dash>",
    "Y": "<dash><dot><dash><dash>",
    "Z": "<dash><dash><dot><dot>",
    "1": "<dot><dash><dash><dash><dash>",
    "2": "<dot><dot><dash><dash><dash>",
    "3": "<dot><dot><dot><dash><dash>",
    "4": "<dot><dot><dot><dot><dash>",
    "5": "<dot><dot><dot><dot><dot>",
    "6": "<dash><dot><dot><dot><dot>",
    "7": "<dash><dash><dot><dot><dot>",
    "8": "<dash><dash><dash><dot><dot>",
    "9": "<dash><dash><dash><dash><dot>",
    "0": "<dash><dash><dash><dash><dash>",
    ".": "<dot><dash><dot><dash><dot><dash>",
    ",": "<dash><dash><dot><dot><dash><dash>",
    ":": "<dash><dash><dash><dot><dot><dot>",
    ";": "<dash><dot><dash><dot><dash><dot>",
    "!": "<dash><dot><dash><dot><dash><dash>",
    "?": "<dot><dot><dash><dash><dot><dot>",
    "'": "<dot><dash><dash><dash><dash><dot>",
    "\"": "<dot><dash><dot><dot><dash><dot>",
    "/": "<dash><dot><dot><dash><dot>",
    "-": "<dash><dot><dot><dot><dot><dash>",
    "+": "<dot><dash><dot><dash><dot>",
    "(": "<dash><dot><dash><dash><dot>",
    ")": "<dash><dot><dash><dash><dot><dash>",
    "@": "<dot><dash><dash><dot><dash><dot>",
    "=": "<dash><dot><dot><dot><dash>",
    "&": "<dot><dash><dot><dot><dot>",
    "_": "<dot><dot><dash><dash><dot><dash>",
    "$": "<dot><dot><dot><dash><dot><dot><dash>"
};

export default FromMorseCode;
