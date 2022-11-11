/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Shuffle operation
 */
class Shuffle extends Operation {

    /**
     * Shuffle constructor
     */
    constructor() {
        super();

        this.name = "Shuffle";
        this.module = "Default";
        this.description = "Randomly reorders input elements.";
        this.infoURL = "https://wikipedia.org/wiki/Shuffling";
        this.inputType = "ArrayBuffer";
        this.outputType = "ArrayBuffer";
        this.args = [
            {
                "name": "By",
                "type": "option",
                "value": ["Byte", "Character", "Line"],
                "defaultIndex": 1
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {ArrayBuffer}
     */
    run(input, args) {
        const type = args[0];
        if (input.byteLength === 0) return input;
        if (ArrayBuffer.isView(input)) {
            if (input.byteOffset === 0 && input.byteLength === input.buffer.byteLength) {
                input = input.buffer;
            } else {
                input = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
            }
        }
        const inputBytes = new Uint8Array(input);

        // return a random number in [0, 1)
        const rng = (typeof crypto) !== "undefined" && crypto.getRandomValues ? (function() {
            const buf = new Uint32Array(2);
            return function() {
                // generate 53-bit random integer: 21 + 32 bits
                crypto.getRandomValues(buf);
                const value = (buf[0] >>> (32 - 21)) * ((1 << 30) * 4) + buf[1];
                return value / ((1 << 23) * (1 << 30));
            };
        })() : Math.random;

        // return a random integer in [0, max)
        const randint = function(max) {
            return Math.floor(rng() * max);
        };

        const toShuffle = [];
        let addLastNewLine = false;
        switch (type) {
            case "Character":
                // split input into UTF-8 code points
                for (let i = 0; i < inputBytes.length;) {
                    const charLength = (function() {
                        if (inputBytes[i] < 0xc0) return 1;
                        if (inputBytes[i] < 0xe0) return 2;
                        if (inputBytes[i] < 0xf0) return 3;
                        if (inputBytes[i] < 0xf8) return 4;
                        return 1;
                    })();
                    if (i + charLength <= inputBytes.length) {
                        let elementLength = charLength;
                        for (let j = 1; j < charLength; j++) {
                            if ((inputBytes[i + j] & 0xc0) !== 0x80) {
                                elementLength = 1;
                                break;
                            }
                        }
                        toShuffle.push([i, elementLength]);
                        i += elementLength;
                    } else {
                        toShuffle.push([i, 1]);
                        i++;
                    }
                }
                break;
            case "Line":
                {
                    // split input by newline characters
                    let lineBegin = 0;
                    for (let i = 0; i < inputBytes.length; i++) {
                        if (inputBytes[i] === 0xd || inputBytes[i] === 0xa) {
                            if (i + 1 < inputBytes.length && inputBytes[i] === 0xd && inputBytes[i + 1] === 0xa) {
                                i++;
                            }
                            toShuffle.push([lineBegin, i - lineBegin + 1]);
                            lineBegin = i + 1;
                        }
                    }
                    if (lineBegin < inputBytes.length) {
                        toShuffle.push([lineBegin, inputBytes.length - lineBegin]);
                        addLastNewLine = true;
                    }
                }
                break;
            default:
            {
                // Creating element information for each bytes looks very wasteful.
                // Therefore, directly shuffle here.
                const outputBytes = new Uint8Array(inputBytes);
                for (let i = outputBytes.length - 1; i > 0; i--) {
                    const idx = randint(i + 1);
                    const tmp = outputBytes[idx];
                    outputBytes[idx] = outputBytes[i];
                    outputBytes[i] = tmp;
                }
                return outputBytes.buffer;
            }
        }

        // shuffle elements
        const lastStart = toShuffle[toShuffle.length - 1][0];
        for (let i = toShuffle.length - 1; i > 0; i--) {
            const idx = randint(i + 1);
            const tmp = toShuffle[idx];
            toShuffle[idx] = toShuffle[i];
            toShuffle[i] = tmp;
        }

        // place shuffled elements
        const outputBytes = new Uint8Array(inputBytes.length + (addLastNewLine ? 1 : 0));
        let outputPos = 0;
        for (let i = 0; i < toShuffle.length; i++) {
            outputBytes.set(new Uint8Array(input, toShuffle[i][0], toShuffle[i][1]), outputPos);
            outputPos += toShuffle[i][1];
            if (addLastNewLine && toShuffle[i][0] === lastStart) {
                outputBytes[outputPos] = 0xa;
                outputPos++;
            }
        }
        return outputBytes.buffer;
    }

}

export default Shuffle;
