/**
 * @license Apache-2.0
 */

import forge from "node-forge";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { toHexFast } from "../lib/Hex.mjs";

const DUKPT_KEY_MASK = Uint8Array.from([0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00, 0xC0, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x00]);
const VARIANT_MASKS = {
    "None": Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    "PIN": Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF]),
    "MAC Request": Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00]),
    "MAC Response": Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00]),
    "Data": Uint8Array.from([0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00]),
};

/**
 * Parses a fixed-length hex string into bytes.
 *
 * @param {string} input
 * @param {number} expectedLen
 * @param {string} name
 * @returns {Uint8Array}
 */
function parseHex(input, expectedLen, name) {
    const hex = (input || "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
        throw new OperationError(`${name} must be hex.`);
    }
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    if (expectedLen && out.length !== expectedLen) {
        throw new OperationError(`${name} must be ${expectedLen} bytes.`);
    }
    return out;
}

/**
 * XORs two equally sized byte arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function xorBytes(a, b) {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        out[i] = a[i] ^ b[i];
    }
    return out;
}

/**
 * Converts bytes to a forge-compatible binary string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toByteString(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        s += String.fromCharCode(bytes[i]);
    }
    return s;
}

/**
 * Encrypts one 8-byte block with 2-key TDES in ECB mode.
 *
 * @param {Uint8Array} key16
 * @param {Uint8Array} block8
 * @returns {Uint8Array}
 */
function encryptBlock3DesEcb(key16, block8) {
    const key24 = toByteString(Uint8Array.from([...key16, ...key16.slice(0, 8)]));
    const cipher = forge.cipher.createCipher("3DES-ECB", key24);
    cipher.mode.pad = function() {
        return true;
    };
    cipher.start();
    cipher.update(forge.util.createBuffer(toByteString(block8)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return Uint8Array.from(out.split("").map(c => c.charCodeAt(0))).slice(0, 8);
}

/**
 * Encrypts one 8-byte block with DES in ECB mode.
 *
 * @param {Uint8Array} key8
 * @param {Uint8Array} block8
 * @returns {Uint8Array}
 */
function encryptBlockDesEcb(key8, block8) {
    const cipher = forge.cipher.createCipher("DES-ECB", toByteString(key8));
    cipher.mode.pad = function() {
        return true;
    };
    cipher.start();
    cipher.update(forge.util.createBuffer(toByteString(block8)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return Uint8Array.from(out.split("").map(c => c.charCodeAt(0))).slice(0, 8);
}

/**
 * Derives the DUKPT IPEK from a BDK and KSN.
 *
 * @param {Uint8Array} bdk
 * @param {Uint8Array} ksn
 * @returns {Uint8Array}
 */
function deriveIpek(bdk, ksn) {
    const ksnReg = Uint8Array.from(ksn);
    ksnReg[7] &= 0xE0;
    ksnReg[8] = 0x00;
    ksnReg[9] = 0x00;
    const data = ksnReg.slice(0, 8);

    const left = encryptBlock3DesEcb(bdk, data);
    const right = encryptBlock3DesEcb(xorBytes(bdk, DUKPT_KEY_MASK), data);

    return Uint8Array.from([...left, ...right]);
}

/**
 * Runs the ANSI X9.24 non-reversible key generation step.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} ksnReg
 * @returns {Uint8Array}
 */
function nonReversibleKeyGen(key, ksnReg) {
    const reg8 = ksnReg.slice(2, 10);

    const keyL = key.slice(0, 8);
    const keyR = key.slice(8, 16);

    const msgR = xorBytes(keyR, reg8);
    const desR = encryptBlockDesEcb(keyL, msgR);
    const right = xorBytes(desR, keyR);

    const masked = xorBytes(key, DUKPT_KEY_MASK);
    const mKeyL = masked.slice(0, 8);
    const mKeyR = masked.slice(8, 16);

    const msgL = xorBytes(mKeyR, reg8);
    const desL = encryptBlockDesEcb(mKeyL, msgL);
    const left = xorBytes(desL, mKeyR);

    return Uint8Array.from([...left, ...right]);
}

/**
 * Derives the base session key for the current transaction counter.
 *
 * @param {Uint8Array} ipek
 * @param {Uint8Array} ksn
 * @returns {Uint8Array}
 */
function deriveSessionBaseKey(ipek, ksn) {
    const ksnReg = Uint8Array.from(ksn);
    ksnReg[7] &= 0xE0;
    ksnReg[8] = 0x00;
    ksnReg[9] = 0x00;

    const counter = ((ksn[7] & 0x1F) << 16) | (ksn[8] << 8) | ksn[9];
    let curKey = Uint8Array.from(ipek);

    for (let shift = 20; shift >= 0; shift--) {
        const bit = 1 << shift;
        if ((counter & bit) !== 0) {
            ksnReg[7] = (ksnReg[7] & 0xE0) | (((counter & 0x1F0000) >> 16) & 0x1F);
            ksnReg[8] = (counter >> 8) & 0xFF;
            ksnReg[9] = counter & 0xFF;
            curKey = nonReversibleKeyGen(curKey, ksnReg);
        }
    }

    return curKey;
}

/**
 * Derive DUKPT key operation
 */
class DeriveDUKPTKey extends Operation {

    /**
     * DeriveDUKPTKey constructor
     */
    constructor() {
        super();

        this.name = "Derive DUKPT Key";
        this.module = "Payment";
        this.description = "Paste the Base Derivation Key (BDK) into the input field as a 16-byte hex value.<br><br>Put the 10-byte Key Serial Number in the <b>KSN</b> argument field.<br><br><b>Input:</b> BDK in hex.<br><b>Arguments:</b> choose whether to derive the IPEK or the transaction key, provide the KSN, choose the variant, and optionally return JSON.<br><br>This operation derives TDES DUKPT keys in software for test and interoperability work.";
        this.inlineHelp = "<strong>Input:</strong> BDK hex.<br><strong>Args:</strong> add the KSN, choose IPEK or transaction-key derivation, then optionally apply a variant.";
        this.testDataSamples = [
            {
                name: "Known transaction key vector",
                input: "0123456789ABCDEFFEDCBA9876543210",
                args: ["Derive Session Key", "FFFF9876543210E00008", "None", false]
            }
        ];
        this.infoURL = "https://en.wikipedia.org/wiki/Derived_unique_key_per_transaction";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Mode",
                "type": "option",
                "value": ["Derive IPEK", "Derive Session Key"],
                "comment": "Choose whether the output should be the IPEK or the derived transaction/session key. Assumption: this implementation follows TDES DUKPT, not AES DUKPT."
            },
            {
                "name": "KSN (hex, 10 bytes)",
                "type": "string",
                "value": "",
                "comment": "Provide the full 10-byte KSN as 20 hex characters, for example <code>FFFF9876543210E00008</code>. Spaces are allowed."
            },
            {
                "name": "Session key variant",
                "type": "option",
                "value": ["None", "PIN", "MAC Request", "MAC Response", "Data"],
                "comment": "Applied only when deriving the session key. Assumption: variants are implemented as simple XOR masks over the derived base key."
            },
            {
                "name": "Output as JSON",
                "type": "boolean",
                "value": false,
                "comment": "When enabled, returns the intermediate values along with the final key so the derivation can be inspected."
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [mode, ksnHex, variant, outputJson] = args;
        const bdk = parseHex(input, 16, "BDK");
        const ksn = parseHex(ksnHex, 10, "KSN");

        const ipek = deriveIpek(bdk, ksn);
        const ipekHex = toHexFast(ipek).toUpperCase();

        if (mode === "Derive IPEK") {
            if (outputJson) {
                return JSON.stringify({ mode, ipek: ipekHex }, null, 4);
            }
            return ipekHex;
        }

        const sessionBase = deriveSessionBaseKey(ipek, ksn);
        const session = xorBytes(sessionBase, VARIANT_MASKS[variant]);
        const sessionHex = toHexFast(session).toUpperCase();

        if (outputJson) {
            return JSON.stringify({
                mode,
                ipek: ipekHex,
                sessionBase: toHexFast(sessionBase).toUpperCase(),
                variant,
                sessionKey: sessionHex
            }, null, 4);
        }

        return sessionHex;
    }

}

export default DeriveDUKPTKey;
