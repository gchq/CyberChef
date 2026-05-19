/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import forge from "node-forge";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHexFast } from "../lib/Hex.mjs";

// ── X9.24-3 key usage indicators (bytes 2-3 of derivation data) ───────────────

const KEY_USAGE = {
    "IK Derivation":    0x8001,   // BDK → device Initial Key (X9.24-3 §6.3.1)
    Intermediate:       0x0000,   // internal binary-tree node (not user-visible)
    "PIN Encryption":   0x1000,
    "MAC Generation":   0x2000,   // sender / request direction
    "MAC Verification": 0x2001,   // receiver / response direction
    "MAC Both Ways":    0x2002,
    "Data Encryption":  0x3000,
    "Data Decryption":  0x3001,
    "Data Both Ways":   0x3002,
};

// AES-128 wire constants
const ALGO_CODE   = 0x0002;   // AES-128 algorithm identifier
const KEY_LEN_VAL = 0x0080;   // 128 bits

// CMAC Rb constant for 128-bit block (RFC 4493)
const RB = new Uint8Array(16);
RB[15] = 0x87;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parses a hex string into a Uint8Array, validating format and byte length.
 *
 * @param {string} hex
 * @param {number} expectedBytes
 * @param {string} name
 * @returns {Uint8Array}
 */
function parseHex(hex, expectedBytes, name) {
    const h = (hex || "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(h) || h.length % 2 !== 0)
        throw new OperationError(`${name} must be a hex string.`);
    const bytes = new Uint8Array(h.length / 2);
    for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
    if (expectedBytes && bytes.length !== expectedBytes)
        throw new OperationError(`${name} must be ${expectedBytes} bytes (got ${bytes.length}).`);
    return bytes;
}

/**
 * XORs two equal-length byte arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function xor(a, b) {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) out[i] = a[i] ^ b[i];
    return out;
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
 * Converts a Uint8Array to a byte string for use with node-forge.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toByteString(bytes) {
    return Array.from(bytes, b => String.fromCharCode(b)).join("");
}

/**
 * Converts a Uint8Array to an uppercase hex string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function hex(bytes) {
    return toHexFast(bytes).toUpperCase();
}

// ── AES-128 ECB single-block encrypt ─────────────────────────────────────────
// Reuses the forge cipher object across calls (same pattern as CMAC.mjs).

/**
 * Creates a reusable AES-ECB cipher instance for a 16-byte key.
 *
 * @param {Uint8Array} key16
 * @returns {Object}
 */
function makeEcbCipher(key16) {
    return forge.cipher.createCipher("AES-ECB", toByteString(key16));
}

/**
 * Encrypts a single 16-byte block with the given AES-ECB cipher instance.
 *
 * @param {Object} cipher
 * @param {Uint8Array} block16
 * @returns {Uint8Array}
 */
function ecbBlock(cipher, block16) {
    cipher.start();
    cipher.update(forge.util.createBuffer(toByteString(block16)));
    cipher.finish();
    return Uint8Array.from(cipher.output.getBytes(), c => c.charCodeAt(0)).slice(0, 16);
}

// ── AES-CMAC (RFC 4493) ───────────────────────────────────────────────────────

/**
 * Computes AES-CMAC of a message using a 16-byte AES key.
 *
 * @param {Uint8Array} key16
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
function aesCmac(key16, message) {
    const cipher = makeEcbCipher(key16);

    // Subkey generation
    const L  = ecbBlock(cipher, new Uint8Array(16));
    const K1 = shiftLeft1(L);
    if (L[0] & 0x80) for (let i = 0; i < 16; i++) K1[i] ^= RB[i];
    const K2 = shiftLeft1(K1);
    if (K1[0] & 0x80) for (let i = 0; i < 16; i++) K2[i] ^= RB[i];

    const n    = Math.max(1, Math.ceil(message.length / 16));
    const flag = message.length > 0 && message.length % 16 === 0;

    // Prepare final block
    const lastRaw   = message.slice((n - 1) * 16);
    const lastBlock = new Uint8Array(16);
    lastBlock.set(lastRaw);
    if (!flag) lastBlock[lastRaw.length] = 0x80;   // ISO/IEC 7816-4 padding
    const lastXored = xor(lastBlock, flag ? K1 : K2);

    // CBC-MAC chain
    let X = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++)
        X = ecbBlock(cipher, xor(X, message.slice(i * 16, (i + 1) * 16)));
    return ecbBlock(cipher, xor(X, lastXored));
}

// ── X9.24-3 AES-128 DUKPT derivation ─────────────────────────────────────────

/**
 * Builds the 16-byte IK derivation data block (ANSI X9.24-3-2017 §6.3.1).
 *
 * Layout (IK derivation only — uses full 8-byte IKI, no counter field):
 *   [0]    version         = 0x01
 *   [1]    key size class  = 0x01 (AES-128)
 *   [2-3]  key usage       = 0x8001 (IK Derivation)
 *   [4-5]  algorithm       = 0x0002 (AES-128)
 *   [6-7]  key length      = 0x0080 (128 bits)
 *   [8-15] IKI             (full 8 bytes)
 *
 * @param {Uint8Array} iki8
 * @returns {Uint8Array}
 */
function ikDerivationData(iki8) {
    const d = new Uint8Array(16);
    d[0] = 0x01; d[1] = 0x01;
    d[2] = (KEY_USAGE["IK Derivation"] >> 8) & 0xFF;
    d[3] =  KEY_USAGE["IK Derivation"]       & 0xFF;
    d[4] = (ALGO_CODE   >> 8) & 0xFF; d[5] = ALGO_CODE    & 0xFF;
    d[6] = (KEY_LEN_VAL >> 8) & 0xFF; d[7] = KEY_LEN_VAL  & 0xFF;
    d.set(iki8, 8);
    return d;
}

/**
 * Builds the 16-byte derivation data block for intermediate-node and working-key
 * derivation (ANSI X9.24-3-2017 §6.3.2 / §6.3.3).
 *
 * Layout:
 *   [0]    version         = 0x01
 *   [1]    key size class  = 0x01 (AES-128)
 *   [2-3]  key usage indicator
 *   [4-5]  algorithm       = 0x0002 (AES-128)
 *   [6-7]  key length      = 0x0080 (128 bits)
 *   [8-11] last 4 bytes of IKI (IKI[4..7])
 *   [12-15] counter register (4 bytes, big-endian)
 *
 * @param {number} usage
 * @param {Uint8Array} iki8
 * @param {number} counterReg
 * @returns {Uint8Array}
 */
function derivationData(usage, iki8, counterReg) {
    const d = new Uint8Array(16);
    d[0] = 0x01; d[1] = 0x01;
    d[2] = (usage       >> 8) & 0xFF; d[3] = usage        & 0xFF;
    d[4] = (ALGO_CODE   >> 8) & 0xFF; d[5] = ALGO_CODE    & 0xFF;
    d[6] = (KEY_LEN_VAL >> 8) & 0xFF; d[7] = KEY_LEN_VAL  & 0xFF;
    // last 4 bytes of 8-byte IKI
    d[8] = iki8[4]; d[9] = iki8[5]; d[10] = iki8[6]; d[11] = iki8[7];
    d[12] = (counterReg >>> 24) & 0xFF;
    d[13] = (counterReg >>> 16) & 0xFF;
    d[14] = (counterReg >>>  8) & 0xFF;
    d[15] =  counterReg         & 0xFF;
    return d;
}

/**
 * Derives the Initial Key (IK) from a BDK and IKI using AES-CMAC.
 *
 * @param {Uint8Array} bdk16
 * @param {Uint8Array} iki8
 * @returns {Uint8Array}
 */
function deriveIK(bdk16, iki8) {
    return aesCmac(bdk16, ikDerivationData(iki8));
}

/**
 * Binary-tree traversal from IK to the leaf transaction key.
 * Uses the 21 usable counter bits (bits 20-0 of the 4-byte counter field).
 *
 * @param {Uint8Array} ik16
 * @param {Uint8Array} iki8
 * @param {number} counter
 * @returns {Uint8Array}
 */
function deriveTransactionKey(ik16, iki8, counter) {
    const usable = counter & 0x1FFFFF;
    if (usable === 0) throw new OperationError(
        "Counter 0 is reserved — no transactions have occurred yet."
    );
    if (usable === 0x1FFFFF) throw new OperationError(
        "Counter 0x1FFFFF indicates key exhaustion — this terminal needs a new IK."
    );
    let key = Uint8Array.from(ik16);
    let reg = 0;
    for (let bit = 20; bit >= 0; bit--) {
        if (usable & (1 << bit)) {
            reg |= (1 << bit);
            key = aesCmac(key, derivationData(KEY_USAGE.Intermediate, iki8, reg));
        }
    }
    return key;
}

/**
 * Derives a purpose-specific working key from the transaction key.
 * Uses the full 32-bit counter in the derivation data (not the 21-bit tree counter).
 *
 * @param {Uint8Array} txKey16
 * @param {Uint8Array} iki8
 * @param {number} counter
 * @param {string} purposeName
 * @returns {Uint8Array}
 */
function deriveWorkingKey(txKey16, iki8, counter, purposeName) {
    return aesCmac(txKey16, derivationData(KEY_USAGE[purposeName], iki8, counter));
}

// ── Operation class ───────────────────────────────────────────────────────────

/**
 * Derive DUKPT AES Key operation.
 */
class DeriveDUKPTAESKey extends Operation {

    /**
     * DeriveDUKPTAESKey constructor.
     */
    constructor() {
        super();

        this.name = "DUKPT Derive AES Key";
        this.module = "Payment";
        this.description = [
            "Derives AES DUKPT working keys per <b>ANSI X9.24-3</b> (AES-128).",
            "<br><br>",
            "<b>Input:</b> 16-byte BDK as hex, or the 16-byte Initial Key (IK) if you already have it.",
            "<br><br>",
            "The <b>KSN</b> is 12 bytes: 8-byte Initial Key Identifier (IKI) + 4-byte transaction counter.",
            "Only the low 21 bits of the counter are used for derivation (max 2,097,151 transactions per IK).",
            "<br><br>",
            "<b>Derivation data format (X9.24-3, 16 bytes — working keys):</b>",
            "<pre>",
            "[0]    version        = 0x01\n",
            "[1]    key size class = 0x01 (AES-128)\n",
            "[2-3]  key usage indicator\n",
            "[4-5]  algorithm      = 0x0002 (AES-128)\n",
            "[6-7]  key length     = 0x0080 (128 bits)\n",
            "[8-11] last 4 bytes of IKI\n",
            "[12-15] transaction counter (4 bytes, full 32-bit value)\n",
            "</pre>",
            "IK derivation uses a separate 16-byte block with full 8-byte IKI at [8-15] and usage 0x8001.",
            "<b>Key usage codes:</b> PIN Encryption=0x1000, MAC Generation=0x2000, ",
            "MAC Verification=0x2001, MAC Both Ways=0x2002, ",
            "Data Encryption=0x3000, Data Decryption=0x3001, Data Both Ways=0x3002.",
            "<br><br>",
            "AES-192 and AES-256 require a multi-block KDF and are not implemented here.",
            " Cross-verify results against KABC (kabc.ca/payment/dukptaes) or the X9.24-3 annex test vectors.",
        ].join("");
        this.inlineHelp = [
            "<strong>Input:</strong> BDK hex (16 bytes) or IK hex (16 bytes).",
            "<strong>KSN:</strong> 24 hex chars = 8-byte IKI + 4-byte counter.",
        ].join(" ");
        this.testDataSamples = [
            {
                name: "Derive IK from BDK",
                input: "__RANDOM_AES_128_HEX__",
                args: ["BDK", "Derive IK", "123456789012345600000001", "PIN Encryption", false],
            },
        ];
        this.infoURL = "https://www.eftlab.com/knowledge-base/dukpt-aes";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Input key type",
                type: "option",
                value: ["BDK", "Initial Key (IK)"],
            },
            {
                name: "Derive",
                type: "option",
                value: ["Initial Key (IK)", "Working Key"],
            },
            {
                name: "KSN (24 hex chars — 8-byte IKI + 4-byte counter)",
                type: "string",
                value: "",
            },
            {
                name: "Key purpose",
                type: "option",
                value: [
                    "PIN Encryption",
                    "MAC Generation",
                    "MAC Verification",
                    "MAC Both Ways",
                    "Data Encryption",
                    "Data Decryption",
                    "Data Both Ways",
                ],
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
        const [inputKeyType, deriveMode, ksnHex, purpose, outputJson] = args;

        const inputKey = parseHex(input, 16, "Input key");
        const ksn      = parseHex(ksnHex, 12, "KSN");
        const iki      = ksn.slice(0, 8);
        const counter  = (ksn[8] << 24 | ksn[9] << 16 | ksn[10] << 8 | ksn[11]) >>> 0;

        // Resolve IK
        const ik = inputKeyType === "BDK" ? deriveIK(inputKey, iki) : Uint8Array.from(inputKey);

        if (deriveMode === "Initial Key (IK)") {
            if (outputJson) {
                const out = { inputKeyType, ik: hex(ik) };
                if (inputKeyType === "BDK") out.bdk = hex(inputKey);
                return JSON.stringify(out, null, 4);
            }
            return hex(ik);
        }

        // Derive working key
        const txKey  = deriveTransactionKey(ik, iki, counter);
        const wkKey  = deriveWorkingKey(txKey, iki, counter, purpose);

        if (outputJson) {
            const out = { inputKeyType, iki: hex(iki), counter: `0x${counter.toString(16).padStart(8, "0").toUpperCase()}` };
            if (inputKeyType === "BDK") out.bdk = hex(inputKey);
            out.ik             = hex(ik);
            out.transactionKey = hex(txKey);
            out.purpose        = purpose;
            out.workingKey     = hex(wkKey);
            return JSON.stringify(out, null, 4);
        }

        return hex(wkKey);
    }

}

export default DeriveDUKPTAESKey;
