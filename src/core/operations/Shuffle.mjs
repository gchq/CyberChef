/**
 * @author mikecat
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {INPUT_DELIM_OPTIONS} from "../lib/Delim.mjs";

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
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Delimiter",
                type: "option",
                value: INPUT_DELIM_OPTIONS
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const delim = Utils.charRep(args[0]);
        if (input.length === 0) return input;

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

        // Split input into shuffleable sections
        const toShuffle = input.split(delim);

        // shuffle elements
        for (let i = toShuffle.length - 1; i > 0; i--) {
            const idx = randint(i + 1);
            const tmp = toShuffle[idx];
            toShuffle[idx] = toShuffle[i];
            toShuffle[i] = tmp;
        }

        return toShuffle.join(delim);
    }

}

export default Shuffle;
