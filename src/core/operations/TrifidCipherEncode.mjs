/**
 * @author skyhigh
 * @copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.description = "The trifid cipher uses a table to fractionate each plaintext letter into a trigram, mixes the constituents of the trigrams, and then applies the table in reverse to turn these mixed trigrams into ciphertext letters. Uses an alphabet of A-Z and +.";
        this.infoURL = "https://wikipedia.org/wiki/Trifid_cipher";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Keyword",
                "type": "binaryString",
                "value": ""
            },
            {
                "name": "Group Size",
                "type": "number",
                "value": "5"
            }
        ];
    }

    /**
     * @param {string} alpha
     * @param {string} keyword
     * @returns {string}
     */
    genTrigramCube(alpha, keyword) {
        const cubeArray = `${keyword}${alpha}`.split("").unique(),
            cube = [[], [], []];

        // We want to fill the cube such that [layer][row][column] is the order for retrieval later.

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                cube[i][j] = cubeArray.slice((i * 9) + (j * 3), (i * 9) + (j * 3) + 3);
            }
        }

        return cube;
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        // Turn the keyword into a usable keyword string
        const keyword = args[0].toLocaleUpperCase();
        const groupSize = args[1];
        const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+";
        const [xCo, yCo, zCo] = [[], [], []];
        const structure = [];

        let output = "";

        // Test the keyword for usability
        if (!/^[A-Z+]+$/.test(keyword) && keyword.length > 0) {
            throw new OperationError("The key must consist only of letters in the English alphabet and the \"+\" symbol");
        }

        // Generate a trigram cube, in the same manner as one would generate a Polybius square
        const cube = this.genTrigramCube(alpha, keyword);

        // Begin the cipher process
        let [xGroup, yGroup, zGroup] = [[], [], []];
        input.split("").forEach(letter => {
            // Is the next character in the alphabet?
            if (alpha.split("").indexOf(letter.toLocaleUpperCase()) >= 0) {
                // Find the character's index in the cube
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const k = cube[i][j].indexOf(letter.toLocaleUpperCase());
                        if (k >= 0) {
                            // Add the cube's indices to the respective arrays
                            zGroup.push(i);
                            yGroup.push(j);
                            xGroup.push(k);

                            // If the group is full push the arrays and reset them
                            if (xGroup.length >= groupSize) {
                                xCo.push(xGroup);
                                yCo.push(yGroup);
                                zCo.push(zGroup);
                                [xGroup, yGroup, zGroup] = [[], [], []];
                            }
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

        // If there's a trailing group, push it
        if (xGroup.length > 0) {
            xCo.push(xGroup);
            yCo.push(yGroup);
            zCo.push(zGroup);
        }

        // Cipher each group
        let cipheredText = "";
        for (let i = 0; i < xCo.length; i++) {
            const concat = `${zCo[i].join("")}${yCo[i].join("")}${xCo[i].join("")}`;
            for (let j = 0; j < concat.length; j += 3) {
                cipheredText += cube[concat[j]][concat[j + 1]][concat[j + 2]];
            }
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

    /**
     * Highlight Trifid Cipher Encode
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        return pos;
    }

    /**
     * Highlight Trifid Cipher Encode in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        return pos;
    }

}

export default TrifidCipherEncode;
