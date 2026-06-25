/**
 * @author Jacob Marks [jacob.marks@jacobmarks.com]
 * @copyright Jacob Marks 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Returns cryptographically random bytes.
 *
 * @param {number} n
 * @returns {Uint8Array}
 */
function randomBytes(n) {
    const buf = new Uint8Array(n);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(buf);
    } else {
        for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256);
    }
    return buf;
}

/**
 * Converts a Uint8Array to an uppercase hex string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toHex(bytes) {
    return Array.from(bytes, b => b.toString(16).padStart(2, "0").toUpperCase()).join("");
}

/**
 * Parses a hex string to a Uint8Array.
 *
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
}

/**
 * Key Component Split operation
 */
class KeyComponentSplit extends Operation {

    /**
     * KeyComponentSplit constructor
     */
    constructor() {
        super();

        this.name = "Key Component Split";
        this.module = "Payment";
        this.description = "Splits a symmetric key into N XOR components for key ceremony use. N-1 components are generated randomly; the final component is derived so that XOR of all N components equals the original key. Accepts 2–8 components. Recombine with Key Component Combine.<br><br>Output is one component per line (hex). Use JSON output to include component count and key length metadata.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Number of components",
                type: "number",
                value: 3
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false
            }
        ];
        this.testDataSamples = [{
            input: "0123456789ABCDEFFEDCBA9876543210",
            args:  [3, false]
        }];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [numComponents, outputJson] = args;

        const keyHex = input.trim().toUpperCase().replace(/\s+/g, "");
        if (keyHex.length === 0) throw new Error("Input key is empty.");
        if (!/^[0-9A-F]+$/.test(keyHex) || keyHex.length % 2 !== 0) {
            throw new Error("Input must be a valid even-length hex string.");
        }

        const n = Math.round(numComponents);
        if (n < 2 || n > 8) throw new Error("Number of components must be between 2 and 8.");

        const keyBytes = hexToBytes(keyHex);
        const len = keyBytes.length;

        // Generate N-1 random components; last = key XOR all others
        const components = [];
        for (let i = 0; i < n - 1; i++) components.push(randomBytes(len));

        const last = new Uint8Array(keyBytes);
        for (const c of components) {
            for (let i = 0; i < len; i++) last[i] ^= c[i];
        }
        components.push(last);

        const hexComponents = components.map(toHex);

        if (!outputJson) return hexComponents.join("\n");

        return JSON.stringify({
            algorithm: "XOR",
            keyLengthBits: len * 8,
            componentCount: n,
            components: hexComponents
        }, null, 4);
    }

}

export default KeyComponentSplit;
