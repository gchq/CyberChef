/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

// ── Key / IV specs ────────────────────────────────────────────────────────────

const KEY_SPECS = {
    "AES-128 (16 bytes)":                    { bytes: 16,  algorithm: "A", type: "key", pciOk: true },
    "AES-192 (24 bytes)":                    { bytes: 24,  algorithm: "A", type: "key", pciOk: true },
    "AES-256 (32 bytes)":                    { bytes: 32,  algorithm: "A", type: "key", pciOk: true },
    "TDES Double-length (16 bytes)":         { bytes: 16,  algorithm: "T", type: "key", pciOk: false,
        warn: "TDES prohibited for new PIN keys since 1 January 2023 (PCI PIN Req 2-2)" },
    "TDES Triple-length (24 bytes)":         { bytes: 24,  algorithm: "T", type: "key", pciOk: false,
        warn: "TDES prohibited for new PIN keys since 1 January 2023 (PCI PIN Req 2-2)" },
    "AES IV / Nonce (16 bytes)":             { bytes: 16,  algorithm: "A", type: "iv",  pciOk: true },
    "Custom random bytes (specify below)":   { bytes: null, algorithm: null, type: "custom", pciOk: true },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generates n cryptographically random bytes using WebCrypto or node-forge.
 *
 * @param {number} n
 * @returns {Uint8Array}
 */
function randomBytes(n) {
    const buf = new Uint8Array(n);
    if (typeof globalThis !== "undefined" && globalThis.crypto && globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues(buf);
    } else {
        const raw = forge.random.getBytesSync(n);
        for (let i = 0; i < n; i++) buf[i] = raw.charCodeAt(i);
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
 * Converts a Uint8Array to a byte string for use with node-forge.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toByteStr(bytes) {
    return Array.from(bytes, b => String.fromCharCode(b)).join("");
}

/**
 * Left-shifts a byte array by one bit.
 *
 * @param {Uint8Array} a
 * @returns {Uint8Array}
 */
function shiftLeft1(a) {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length - 1; i++)
        out[i] = ((a[i] << 1) | (a[i + 1] >> 7)) & 0xFF;
    out[a.length - 1] = (a[a.length - 1] << 1) & 0xFF;
    return out;
}

/**
 * Computes the AES CMAC KCV: CMAC(key, zero-block), first 3 bytes.
 * Uses the PCI PIN-required method, not the legacy ECB-zeros method.
 *
 * @param {Uint8Array} key
 * @returns {string}
 */
function aesCmacKcv(key) {
    const k = key.slice(0, 16);
    const RB = new Uint8Array(16); RB[15] = 0x87;
    const cipher = forge.cipher.createCipher("AES-ECB", toByteStr(k));

    const ecb = block => {
        cipher.start();
        cipher.update(forge.util.createBuffer(toByteStr(block)));
        cipher.finish();
        return Uint8Array.from(cipher.output.getBytes(), c => c.charCodeAt(0)).slice(0, 16);
    };

    const L  = ecb(new Uint8Array(16));
    const K1 = shiftLeft1(L);
    if (L[0] & 0x80) for (let i = 0; i < 16; i++) K1[i] ^= RB[i];

    // Single full block (16 zero bytes) — complete block uses K1
    const finalBlock = new Uint8Array(16);
    for (let i = 0; i < 16; i++) finalBlock[i] = K1[i]; // 0x00 XOR K1[i]

    return toHex(ecb(finalBlock).slice(0, 3));
}

// ── Operation ─────────────────────────────────────────────────────────────────

/**
 * Generate random payment key or IV.
 */
class GenerateKey extends Operation {

    /**
     * GenerateKey constructor.
     */
    constructor() {
        super();

        this.name = "Generate Key";
        this.module = "Payment";
        this.description = [
            "Generates a cryptographically random payment key, IV, or custom-length byte string.",
            "<br><br>",
            "Supported types: <b>AES-128/192/256</b>, <b>TDES double/triple-length</b>,",
            " <b>AES IV/Nonce (16 bytes)</b>, or a <b>custom length</b> for any other use.",
            "<br><br>",
            "For AES keys, optionally computes a <b>CMAC KCV</b> (3-byte, AES-CMAC of a zero block),",
            " which is the PCI-required check value method — not the legacy ECB-zeros method.",
            "<br><br>",
            "<b>Important:</b> Keys generated in the browser are suitable for <b>testing only</b>.",
            " For production, keys must be generated in an HSM or other FIPS 140-2+ approved device.",
        ].join("");

        this.inlineHelp = "Select a key type; output is hex. Use JSON output for KCV and metadata.";

        this.testDataSamples = [
            { name: "AES-128 key", input: "", args: ["AES-128 (16 bytes)", 16, true, true] },
        ];

        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Key / material type",
                type: "option",
                value: Object.keys(KEY_SPECS),
            },
            {
                name: "Custom length (bytes)",
                type: "number",
                value: 16,
                min: 1,
                max: 256,
            },
            {
                name: "Compute AES CMAC KCV",
                type: "boolean",
                value: true,
            },
            {
                name: "Output as JSON",
                type: "boolean",
                value: false,
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [keyType, customLength, computeKcv, outputJson] = args;

        const spec = KEY_SPECS[keyType];
        if (!spec) throw new OperationError("Unknown key / material type.");

        const byteCount = spec.type === "custom" ? Math.max(1, Math.min(256, customLength)) : spec.bytes;
        const material  = randomBytes(byteCount);
        const hex       = toHex(material);

        if (!outputJson) return hex;

        const out = {
            type:        keyType,
            lengthBytes: byteCount,
            lengthBits:  byteCount * 8,
            hex,
        };

        if (spec.algorithm) out.algorithm = spec.algorithm === "A" ? "AES" : "TDES";
        if (spec.warn)      out.warning   = spec.warn;

        if (computeKcv && spec.algorithm === "A" && byteCount >= 16) {
            out.kcv       = aesCmacKcv(material);
            out.kcvMethod = "AES-CMAC of 16 zero bytes, first 3 bytes (PCI PIN compliant)";
        }

        out.note = "For testing only — production keys must be generated in an approved HSM.";

        return JSON.stringify(out, null, 4);
    }
}

export default GenerateKey;
