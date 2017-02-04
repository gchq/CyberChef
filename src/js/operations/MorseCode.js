/**
 * Morse Code translation operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
var MorseCode = {

    /**
     * @constant
     * @default
     */
    FORMAT_OPTIONS: ["-/.", "_/.", "Dash/Dot", "DASH/DOT", "dash/dot"],

    /**
     * @constant
     * @default
     */
    LETTER_DELIM_OPTIONS: ["space", "line feed", "crlf"],

    /**
     * @constant
     * @default
     */
    WORD_DELIM_OPTIONS: ["line feed", "crlf", "space"],

    /**
     * @constant
     * @default
     */
    OPTION_TABLE: {
        "space": " ",
        "line feed": "\n",
        "crlf": "\r\n"
    },

    /**
     * @constant
     * @default
     */
    MORSE_TABLE: {
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
    },


    /**
     * To Morse Code operation.
     *
     * @param {number} input
     * @param {Object[]} args
     * @returns {string}
     */
    translateTo: function(input, args) {
        var format = args[0].split("/");
        var dash = format[0];
        var dot = format[1];

        var letter_delim = MorseCode.OPTION_TABLE[args[1]];
        var word_delim = MorseCode.OPTION_TABLE[args[2]];

        input = input.split(/\r?\n/);
        input = Array.prototype.map.call(input, function(line) {
            var words = line.split(/ +/);
            words = Array.prototype.map.call(words, function(word) {
                var letters = Array.prototype.map.call(word, function(character) {
                    var letter = character.toUpperCase();
                    if(typeof MorseCode.MORSE_TABLE[letter] == "undefined") {
                        return "";
                    }

                    return MorseCode.MORSE_TABLE[letter];
                });

                return letters.join("<ld>");
            });
            line = words.join("<wd>");
            return line;
        });
        input = input.join("\n");

        input = input.replace(
            /<dash>|<dot>|<ld>|<wd>/g,
            function(match) {
                switch(match) {
                    case "<dash>": return dash;
                    case "<dot>": return dot;
                    case "<ld>": return letter_delim;
                    case "<wd>": return word_delim;
                }
            }
        );

        return input;
    },
    
    
    /**
     * From Morse Code operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    translateFrom: (function() {
        var reversedTable = null;
        var reverseTable = function() {
            reversedTable = {};

            for(var letter in MorseCode.MORSE_TABLE) {
                var signal = MorseCode.MORSE_TABLE[letter];
                reversedTable[signal] = letter;
            }
        };

        return function(input, args) {
            if(reversedTable === null) {
                reverseTable();
            }

            var letter_delim = MorseCode.OPTION_TABLE[args[0]];
            var word_delim = MorseCode.OPTION_TABLE[args[1]];

            input = input.replace(/-|_|dash/ig, "<dash>")
            input = input.replace(/\.|dot/ig, "<dot>")

            var words = input.split(word_delim);
            words = Array.prototype.map.call(words, function(word) {
                var signals = word.split(letter_delim);

                var letters = signals.map(function(signal) {
                    return reversedTable[signal];
                });

                var word = letters.join("");
                return word;
            });
            words = words.join(" ");

            return words;
        };
    })(),
    
};
