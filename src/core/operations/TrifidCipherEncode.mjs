/**
 * @author skyhigh
 * @copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../Operation.mjs";

/**
 * Trifid Cipher Encode operation
 */
class TrifidCipherEncode extends Operation {
    /**
     * TrifidCipherEncode constructor
     */
    constructor() {
        super();

        this.name = "Trifid Cipher Encode";
        this.module = "Ciphers";
        this.description = "The trifid cipher uses a table to fractionate each plaintext letter into a trigram, mixes the constituents of the trigrams, and then applies the table in reverse to turn these mixed trigrams into ciphertext letters.";
        this.infoURL = "https://en.wikipedia.org/wiki/Trifid_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Trigram Size",
                "type": "number",
                "value": 3
            },
            {
                "name": "Group Size",
                "type": "number",
                "value": 5
            },
            {
                "name": "Alphabet",
                "type": "binaryString",
                "value": "ABCDEFGHIJKLMNOPQRSTUVWXYZ+"
            },
            {
                "name": "Keyword",
                "type": "binaryString",
                "value": ""
            }
        ];
    }

    /**
     * Given a group of characters, returns those characters ciphered.
     * @param {string} input
     * @param {int} groupSize
     * @param {int} trigramSize
     * @param {string} mixedAlphabet
     * @returns {string}
     */
    encodeGroup(currentGroup, groupSize, trigramSize, mixedAlphabet) {
        // Convert the group into an array of numbers based on the mixed alphabet
        const vertical = [];
        let rowCount = 0;
        currentGroup.split("").forEach(letter => {
            const n = mixedAlphabet.search(letter.toLocaleUpperCase());
            // Filter out anything not in the alphabet
            if (n >= 0) {
                // Add an entry to the array based on the position of the letter in the trigram
                const x = (n % trigramSize);
                const y = (((n - x) / trigramSize) % trigramSize);
                const z = ((((n - x) / trigramSize) - y) / trigramSize);
                vertical.push(z, y, x); // Layer, row, column
                rowCount++;
            }
        });

        // Read the array entries sideways
        const horizontal = [];
        let currentTriple = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < groupSize; j++) {
                const nextCharPos = (j * 3) + i; // 3 for number of trigram dimensions
                currentTriple.push(vertical[nextCharPos]);
                if (currentTriple.length === 3) {
                    const z = currentTriple[0];
                    const y = currentTriple[1];
                    const x = currentTriple[2];
                    const encodedIndex = (((z * trigramSize) + y) * trigramSize) + x;
                    horizontal.push(mixedAlphabet[encodedIndex]);
                    currentTriple = [];
                }
            }
        }
        // Return the encoded letters to the original string, matching case and symbol placement
        let finalString = "";
        let finalStringIndex = 0;
        for (let i = 0; i < currentGroup.length; i++) {
            if (mixedAlphabet.search(currentGroup[i].toLocaleUpperCase()) < 0) {
                // If the current character is a symbol, just add it to the final string
                finalString += currentGroup[i];
            } else {
                if (currentGroup[i].toLocaleUpperCase() === currentGroup[i]) {
                    // If the current character is uppercase, add the encoded equivalent with no changes
                    finalString += horizontal[finalStringIndex]
                } else {
                    // If the current character is lowercase, add the encoded equivalent converted to lowercase
                    finalString += horizontal[finalStringIndex].toLocaleLowerCase();
                }
                // Since we added an encoded character, increment the respective index
                finalStringIndex++;
            }
        }

        return finalString;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Initialize the args
        const [trigramSize, groupSize, alphabet, key] = args;
        const expectedAlphabetSize = trigramSize ** 3;
        let output = "";
        // Throw an error if the alphabet isn't the right size
        if (alphabet.length !== expectedAlphabetSize) {
            // const errorString = "Alphabet must be exactly " + expectedAlphabetSize + " characters";
            throw new OperationError("Alphabet is the wrong length");
        }
        // Convert the alphabet to uppercase letters only
        let alphabetFinal = alphabet.toLocaleUpperCase();

        // Generate the mixed alphabet using the key and the alphabet
        let mixedAlphabet = "";
        key.split("").unique().forEach(letter => {
            const next = letter.toLocaleUpperCase();
            if (alphabetFinal.search(next) >= 0) {
                // Add this character to the mixed alphabet, then remove it from the regular alphabet
                mixedAlphabet += next;
                alphabetFinal = alphabetFinal.replace(next, "");
            }
        });
        console.log(mixedAlphabet);
        // Add the remaining characters
        alphabetFinal.split("").forEach(letter => {
            mixedAlphabet += letter;
        });

        // Last but not least, encode
        let currentGroup = "";
        let i = 0;
        input.split("").forEach(letter => {
            currentGroup += letter;
            // If letter is part of alphabet, increment i
            if (mixedAlphabet.search(letter.toLocaleUpperCase()) >= 0) {
                i++;
            }
            // If i is equal to the group size, send the group to be encoded
            if (i === groupSize) {
                output += this.encodeGroup(currentGroup, groupSize, trigramSize, mixedAlphabet);
                // Reset values
                currentGroup = "";
                i = 0;
            }
        });
        // Check for a trailing group
        if (i > 0) {
            let smallGroupSize = 0;
            // Calculate size of small group, not counting symbols
            currentGroup.split("").forEach(letter => {
                if (mixedAlphabet.search(letter.toLocaleUpperCase()) >= 0) {
                    smallGroupSize++;
                }
            });
            // Using small group size, encode the final group
            output += this.encodeGroup(currentGroup, smallGroupSize, trigramSize, mixedAlphabet);
        }

        return output;
    }
}

export default TrifidCipherEncode;
