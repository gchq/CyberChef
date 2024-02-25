/**
 * @author joostrijneveld [joost@joostrijneveld.nl]
 * @copyright Crown Copyright 2022
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import { toHex } from "../lib/Hex.mjs";

/**
 * Computes the ChaCha block function
 *
 * @param {byteArray} key
 * @param {byteArray} nonce
 * @param {byteArray} counter
 * @param {integer} rounds
 * @returns {byteArray}
 */
function chacha(key, nonce, counter, rounds) {
    const tau = "expand 16-byte k";
    const sigma = "expand 32-byte k";

    let state, c;
    if (key.length === 16) {
        c = Utils.strToByteArray(tau);
        state = c.concat(key).concat(key);
    } else {
        c = Utils.strToByteArray(sigma);
        state = c.concat(key);
    }
    state = state.concat(counter).concat(nonce);

    const x = Array();
    for (let i = 0; i < 64; i += 4) {
        x.push(Utils.byteArrayToInt(state.slice(i, i + 4), "little"));
    }
    const a = [...x];

    /**
     * Macro to compute a 32-bit rotate-left operation
     *
     * @param {integer} x
     * @param {integer} n
     * @returns {integer}
     */
    function ROL32(x, n) {
        return ((x << n) & 0xffffffff) | (x >>> (32 - n));
    }

    /**
     * Macro to compute a single ChaCha quarterround operation
     *
     * @param {integer} x
     * @param {integer} a
     * @param {integer} b
     * @param {integer} c
     * @param {integer} d
     * @returns {integer}
     */
    function quarterround(x, a, b, c, d) {
        x[a] = (x[a] + x[b]) & 0xffffffff;
        x[d] = ROL32(x[d] ^ x[a], 16);
        x[c] = (x[c] + x[d]) & 0xffffffff;
        x[b] = ROL32(x[b] ^ x[c], 12);
        x[a] = (x[a] + x[b]) & 0xffffffff;
        x[d] = ROL32(x[d] ^ x[a], 8);
        x[c] = (x[c] + x[d]) & 0xffffffff;
        x[b] = ROL32(x[b] ^ x[c], 7);
    }

    for (let i = 0; i < rounds / 2; i++) {
        quarterround(x, 0, 4, 8, 12);
        quarterround(x, 1, 5, 9, 13);
        quarterround(x, 2, 6, 10, 14);
        quarterround(x, 3, 7, 11, 15);
        quarterround(x, 0, 5, 10, 15);
        quarterround(x, 1, 6, 11, 12);
        quarterround(x, 2, 7, 8, 13);
        quarterround(x, 3, 4, 9, 14);
    }

    for (let i = 0; i < 16; i++) {
        x[i] = (x[i] + a[i]) & 0xffffffff;
    }

    let output = Array();
    for (let i = 0; i < 16; i++) {
        output = output.concat(Utils.intToByteArray(x[i], 4, "little"));
    }
    return output;
}

/**
 * ChaCha operation
 */
class ChaCha extends Operation {
    /**
     * ChaCha constructor
     */
    constructor() {
        super();

        this.name = "ChaCha";
        this.module = "Default";
        this.description =
            "ChaCha is a stream cipher designed by Daniel J. Bernstein. It is a variant of the Salsa stream cipher. Several parameterizations exist; 'ChaCha' may refer to the original construction, or to the variant as described in RFC-8439. ChaCha is often used with Poly1305, in the ChaCha20-Poly1305 AEAD construction.<br><br><b>Key:</b> ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).<br><br><b>Nonce:</b> ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).<br><br><b>Counter:</b> ChaCha uses a counter of 4 or 8 bytes (32 or 64 bits); together, the nonce and counter must add up to 16 bytes. The counter starts at zero at the start of the keystream, and is incremented at every 64 bytes.";
        this.infoURL = "https://wikipedia.org/wiki/Salsa20#ChaCha_variant";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64"],
            },
            {
                name: "Nonce",
                type: "toggleString",
                value: "",
                toggleValues: ["Hex", "UTF8", "Latin1", "Base64", "Integer"],
            },
            {
                name: "Counter",
                type: "number",
                value: 0,
                min: 0,
            },
            {
                name: "Rounds",
                type: "option",
                value: ["20", "12", "8"],
            },
            {
                name: "Input",
                type: "option",
                value: ["Hex", "Raw"],
            },
            {
                name: "Output",
                type: "option",
                value: ["Raw", "Hex"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            nonceType = args[1].option,
            rounds = parseInt(args[3], 10),
            inputType = args[4],
            outputType = args[5];

        if (key.length !== 16 && key.length !== 32) {
            throw new OperationError(`Invalid key length: ${key.length} bytes.

ChaCha uses a key of 16 or 32 bytes (128 or 256 bits).`);
        }

        let counter, nonce, counterLength;
        if (nonceType === "Integer") {
            nonce = Utils.intToByteArray(
                parseInt(args[1].string, 10),
                12,
                "little",
            );
            counterLength = 4;
        } else {
            nonce = Utils.convertToByteArray(args[1].string, args[1].option);
            if (!(nonce.length === 12 || nonce.length === 8)) {
                throw new OperationError(`Invalid nonce length: ${nonce.length} bytes.

ChaCha uses a nonce of 8 or 12 bytes (64 or 96 bits).`);
            }
            counterLength = 16 - nonce.length;
        }
        counter = Utils.intToByteArray(args[2], counterLength, "little");

        const output = [];
        input = Utils.convertToByteArray(input, inputType);

        let counterAsInt = Utils.byteArrayToInt(counter, "little");
        for (let i = 0; i < input.length; i += 64) {
            counter = Utils.intToByteArray(
                counterAsInt,
                counterLength,
                "little",
            );
            const stream = chacha(key, nonce, counter, rounds);
            for (let j = 0; j < 64 && i + j < input.length; j++) {
                output.push(input[i + j] ^ stream[j]);
            }
            counterAsInt++;
        }

        if (outputType === "Hex") {
            return toHex(output);
        } else {
            return Utils.arrayBufferToStr(output);
        }
    }

    /**
     * Highlight ChaCha
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlight(pos, args) {
        const inputType = args[4],
            outputType = args[5];
        if (inputType === "Raw" && outputType === "Raw") {
            return pos;
        }
    }

    /**
     * Highlight ChaCha in reverse
     *
     * @param {Object[]} pos
     * @param {number} pos[].start
     * @param {number} pos[].end
     * @param {Object[]} args
     * @returns {Object[]} pos
     */
    highlightReverse(pos, args) {
        const inputType = args[4],
            outputType = args[5];
        if (inputType === "Raw" && outputType === "Raw") {
            return pos;
        }
    }
}

export default ChaCha;
