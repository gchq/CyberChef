/**
 * @author Daniel Temkin [http://danieltemkin.com]
 * @author Thomas Leplus [https://www.leplus.org]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * ROT8000 operation.
 */
class ROT8000 extends Operation {
    /**
     * ROT8000 constructor
     */
    constructor() {
        super();
        this.name = "ROT8000";
        this.module = "Default";
        this.description =
            "The simple Caesar-cypher encryption that replaces each Unicode character with the one 0x8000 places forward or back along the alphabet.";
        this.infoURL = "https://rot8000.com/info";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    run(input, args) {
        // Inspired from https://github.com/rottytooth/rot8000/blob/main/rot8000.js
        // these come from the valid-code-point-transitions.json file generated from the c# proj
        // this is done bc: 1) don't trust JS's understanging of surrogate pairs and 2) consistency with original rot8000
        const validCodePoints = {
            33: true,
            127: false,
            161: true,
            5760: false,
            5761: true,
            8192: false,
            8203: true,
            8232: false,
            8234: true,
            8239: false,
            8240: true,
            8287: false,
            8288: true,
            12288: false,
            12289: true,
            55296: false,
            57344: true,
        };
        const bmpSize = 0x10000;
        const rotList = {}; // the mapping of char to rotated char
        const hiddenBlocks = [];
        let startBlock = 0;
        for (const key in validCodePoints) {
            if (Object.prototype.hasOwnProperty.call(validCodePoints, key)) {
                if (validCodePoints[key] === true)
                    hiddenBlocks.push({
                        start: startBlock,
                        end: parseInt(key, 10) - 1,
                    });
                else startBlock = parseInt(key, 10);
            }
        }
        const validIntList = []; // list of all valid chars
        let currValid = false;
        for (let i = 0; i < bmpSize; i++) {
            if (validCodePoints[i] !== undefined) {
                currValid = validCodePoints[i];
            }
            if (currValid) validIntList.push(i);
        }
        const rotateNum = Object.keys(validIntList).length / 2;
        // go through every valid char and find its match
        for (let i = 0; i < validIntList.length; i++) {
            rotList[String.fromCharCode(validIntList[i])] = String.fromCharCode(
                validIntList[(i + rotateNum) % (rotateNum * 2)],
            );
        }
        let output = "";
        for (let count = 0; count < input.length; count++) {
            // if it is not in the mappings list, just add it directly (no rotation)
            if (rotList[input[count]] === undefined) {
                output += input[count];
                continue;
            }
            // otherwise, rotate it and add it to the string
            output += rotList[input[count]];
        }
        return output;
    }

    /**
     * Highlight ROT8000
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
     * Highlight ROT8000 in reverse
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

export default ROT8000;
