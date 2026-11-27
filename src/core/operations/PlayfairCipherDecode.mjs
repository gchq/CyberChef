/**
 * @author skyhigh
 * @copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { genPolybiusSquare } from "../lib/Ciphers.mjs";

/**
 * Playfair Cipher Encode operation
 */
class PlayfairCipherEncode extends Operation {
    /**
     * PlayfairCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Playfair Cipher Decode";
        this.module = "Ciphers";
        this.description = "The Playfair Cipher uses a Polybius square to encode pairs of characters.";
        this.infoURL = "https://wikipedia.org/wiki/Playfair_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Keyword",
                "type": "binaryString",
                "value": ""
            }
        ];
    }

    /**
     * Given the indices of two characters and a Polybius square, returns the ciphered characters.
     * @param {int[][]} tuple
     * @param {string} polybius
     * @returns {string}
     */
    encodeTuple(tuple, polybius) {
        // Assign the entries their own variables
        const a = tuple[0];
        const b = tuple[1];
        // Rearrange the indices according to the Playfair rules
        if (a === b) {
            // Characters are the same; presumably an odd interaction with spacers
            // Make no changes
        } else if (a[0] === b[0]) {
            // Characters are in the same row; shift them up one column, wrapping around if necessary
            a[1] = (a[1] + 4) % 5; // Equivalent to subtracting 1 but handles wrapping more easily
            b[1] = (b[1] + 4) % 5;
        } else if (a[1] === b[1]) {
            // Characters are in the same column; shift them up one row, wrapping around if necessary
            a[0] = (a[0] + 4) % 5;
            b[0] = (b[0] + 4) % 5;
        } else {
            // Characters are in separate rows and columns; swap their columns, keep their rows the same
            [a[1], b[1]] = [b[1], a[1]];
        }

        // Convert these indices to characters
        let output = polybius[a[0]][a[1]];
        output += polybius[b[0]][b[1]];
        return output;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Turn the keyword into a usable keyword string
        const keyword = args[0].toLocaleUpperCase().replace("J", "I");
        const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        const structure = [];
        let output = "";

        // Test the keyword for usability
        if (!/^[A-Z]+$/.test(keyword) && keyword.length > 0) {
            throw new OperationError("The key must consist only of letters in the English alphabet");
        }

        // Generate a Polybius square
        const polybius = genPolybiusSquare(keyword);

        // Begin the (de)cipher process
        let tuple = [];
        let cipheredText = "";
        // Assume "J=I" has already been applied to the cipher text
        input.split("").forEach(letter => {
            // Is the next character in the alphabet?
            if (alpha.split("").indexOf(letter.toLocaleUpperCase()) >= 0) {
                // Find the character's index in the polybius square
                for (let i = 0; i < 5; i++) {
                    const polInd = polybius[i].indexOf(letter.toLocaleUpperCase());
                    if (polInd >= 0) {
                        // Add the next entry to the tuple
                        tuple.push([i, polInd]);

                        // If the tuple is full, add it to the ciphered text and empty it
                        if (tuple.length >= 2) {
                            cipheredText += this.encodeTuple(tuple, polybius);
                            tuple = [];
                        }
                    }
                }

                // Add the letter's case to the structure; "true" for uppercase, "false" for lower
                if (alpha.split("").indexOf(letter) >= 0) {
                    structure.push(true);
                } else {
                    structure.push(false);
                }
            } else {
                // The character isn't in the alphabet; add it to the structure as a symbol
                structure.push(letter);
            }
        });

        // If there's a trailing character, warn the user and remove the last structure entry
        if (tuple.length > 0) {
            output += "Warning: ciphered text contains odd number of characters, final character truncated\n\n";
            structure.pop();
        }

        // Construct the output
        let i = 0;
        structure.forEach(pos => {
            if (typeof pos === "boolean") {
                // Next character is a letter; add the next character in the ciphered text
                output += pos ?
                    cipheredText[i] :
                    cipheredText[i].toLocaleLowerCase();
                i++;
            } else {
                // Next character is a symbol; add the symbol
                output += pos;
            }
        });

        return output;
    }
}

export default PlayfairCipherEncode;
