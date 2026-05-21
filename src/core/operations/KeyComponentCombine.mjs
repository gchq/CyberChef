/**
 * @author Jacob Marks [jacob.marks@jacobmarks.com]
 * @copyright Jacob Marks 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";

/**
 * Key Component Combine operation
 */
class KeyComponentCombine extends Operation {

    /**
     * KeyComponentCombine constructor
     */
    constructor() {
        super();

        this.name = "Key Component Combine";
        this.module = "Payment";
        this.description = "Combines XOR key components into the original key. Each component is XOR'd together to reconstruct the key. Accepts 2–8 components.<br><br>Input: one hex component per line, or JSON output from Key Component Split. Plain hex output chains directly into wrap and encryption operations.";
        this.infoURL = "";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Output as JSON",
                type: "boolean",
                value: false
            }
        ];
        this.testDataSamples = [{
            input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF\nFEDCBA98765432100123456789ABCDEF",
            args:  [false]
        }];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [outputJson] = args;

        const trimmed = input.trim();
        if (!trimmed) throw new Error("Input is empty.");

        let hexComponents;
        if (trimmed.startsWith("{")) {
            let parsed;
            try { parsed = JSON.parse(trimmed); } catch (e) {
                throw new Error("Invalid JSON input.");
            }
            if (!Array.isArray(parsed.components) || parsed.components.length === 0) {
                throw new Error("JSON input must contain a non-empty 'components' array.");
            }
            hexComponents = parsed.components;
        } else {
            hexComponents = trimmed.split("\n")
                .map(l => l.trim().toUpperCase().replace(/\s+/g, ""))
                .filter(l => l.length > 0);
        }

        if (hexComponents.length < 2) throw new Error("At least 2 components are required.");
        if (hexComponents.length > 8) throw new Error("Maximum 8 components are supported.");

        for (const hex of hexComponents) {
            if (!/^[0-9A-F]+$/.test(hex) || hex.length % 2 !== 0) {
                throw new Error(`Invalid hex component: ${hex.slice(0, 16)}${hex.length > 16 ? "…" : ""}`);
            }
        }

        const byteLen = hexComponents[0].length / 2;
        if (hexComponents.some(h => h.length / 2 !== byteLen)) {
            throw new Error("All components must be the same length.");
        }

        const result = new Uint8Array(byteLen);
        for (const hex of hexComponents) {
            for (let i = 0; i < byteLen; i++) {
                result[i] ^= parseInt(hex.slice(i * 2, i * 2 + 2), 16);
            }
        }

        const keyHex = Array.from(result, b => b.toString(16).padStart(2, "0").toUpperCase()).join("");

        if (!outputJson) return keyHex;

        return JSON.stringify({
            algorithm: "XOR",
            keyLengthBits: byteLen * 8,
            componentCount: hexComponents.length,
            keyHex
        }, null, 4);
    }

}

export default KeyComponentCombine;
