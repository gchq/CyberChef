/**
 * @author MannXo [prmma23@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import forge from "node-forge";
import { toHexFast } from "../lib/Hex.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * SHE key slot identifiers as defined by the AUTOSAR SHE specification.
 */
const KEY_SLOTS = {
    "SECRET_KEY": 0x0,
    "MASTER_ECU_KEY": 0x1,
    "BOOT_MAC_KEY": 0x2,
    "BOOT_MAC": 0x3,
    "KEY_1": 0x4,
    "KEY_2": 0x5,
    "KEY_3": 0x6,
    "KEY_4": 0x7,
    "KEY_5": 0x8,
    "KEY_6": 0x9,
    "KEY_7": 0xa,
    "KEY_8": 0xb,
    "KEY_9": 0xc,
    "KEY_10": 0xd,
    "RAM_KEY": 0xe,
};

const SLOT_NAMES = Object.keys(KEY_SLOTS);

const FLAGS = {
    "Write protection": 0b100000,
    "Boot protection": 0b010000,
    "Debugger protection": 0b001000,
    "Key usage": 0b000100,
    "Wildcard": 0b000010,
    "Verify only (SHE+)": 0b000001,
};

const CONSTANTS = {
    "SHE": {
        "enc": "010153484500800000000000000000b0",
        "mac": "010253484500800000000000000000b0",
    },
    "SHE+": {
        "enc": "018153484500800000000000000000b0",
        "mac": "018253484500800000000000000000b0",
    },
};

const MAX_COUNTER = 0xfffffff;

/**
 * SHE Key Update operation
 */
class SHEKeyUpdate extends Operation {

    /**
     * SHEKeyUpdate constructor
     */
    constructor() {
        super();

        this.name = "SHE Key Update";
        this.module = "Crypto";
        this.description = "Generates the M1-M5 memory update protocol messages used to load a key into an AUTOSAR SHE (Secure Hardware Extension) module.<br><br>The input is the new key value (KEY_NEW), 16 bytes. M1, M2 and M3 are sent to the SHE module to import the key; M4 and M5 are returned by the module for verification. Keys are derived from the authorising key with the SHE KDF (a Miyaguchi-Preneel one-way compression over AES-128).<br><br>Choose 'SHE+' for the extended memory update constants.";
        this.infoURL = "https://www.autosar.org/fileadmin/standards/R22-11/FO/AUTOSAR_TR_SecureHardwareExtensions.pdf";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Authorising key (KeyAUTH)",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "UID",
                "type": "toggleString",
                "value": "",
                "toggleValues": ["Hex", "UTF8", "Latin1", "Base64"]
            },
            {
                "name": "New key slot (ID)",
                "type": "option",
                "value": SLOT_NAMES,
                "defaultIndex": SLOT_NAMES.indexOf("KEY_1")
            },
            {
                "name": "Authorising key slot (AuthID)",
                "type": "option",
                "value": SLOT_NAMES,
                "defaultIndex": SLOT_NAMES.indexOf("MASTER_ECU_KEY")
            },
            {
                "name": "Counter (CID)",
                "type": "number",
                "value": 1,
                "min": 0,
                "max": MAX_COUNTER
            },
            {
                "name": "Variant",
                "type": "option",
                "value": ["SHE", "SHE+"]
            },
            {
                "name": "Write protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Boot protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Debugger protection",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Key usage",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Wildcard",
                "type": "boolean",
                "value": false
            },
            {
                "name": "Verify only (SHE+)",
                "type": "boolean",
                "value": false
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const keyNew = new Uint8Array(input);
        const keyAuth = strToBytes(Utils.convertToByteString(args[0].string, args[0].option));
        const uid = strToBytes(Utils.convertToByteString(args[1].string, args[1].option));
        const id = KEY_SLOTS[args[2]];
        const authId = KEY_SLOTS[args[3]];
        const counter = args[4];
        const variant = args[5];
        const flagValues = args.slice(6);

        if (keyNew.length !== 16) {
            throw new OperationError(`The new key (input) must be 16 bytes (currently ${keyNew.length} bytes)`);
        }
        if (keyAuth.length !== 16) {
            throw new OperationError(`The authorising key must be 16 bytes (currently ${keyAuth.length} bytes)`);
        }
        if (uid.length !== 15) {
            throw new OperationError(`The UID must be 15 bytes (currently ${uid.length} bytes)`);
        }
        if (counter < 0 || counter > MAX_COUNTER) {
            throw new OperationError("The counter (CID) must be a 28-bit value between 0 and 268435455");
        }

        const flagOrder = Object.keys(FLAGS);
        let fid = 0;
        flagValues.forEach((enabled, i) => {
            if (enabled) fid |= FLAGS[flagOrder[i]];
        });

        const c = CONSTANTS[variant];
        const encC = fromHex(c.enc);
        const macC = fromHex(c.mac);

        const k1 = kdf(keyAuth, encC);
        const k2 = kdf(keyAuth, macC);
        const k3 = kdf(keyNew, encC);
        const k4 = kdf(keyNew, macC);

        const m1 = concat(uid, new Uint8Array([(id << 4) | (authId & 0x0f)]));

        const m2Plain = new Uint8Array(32);
        m2Plain.set(uint32ToBytes(counter * 16 + (0x0f & (fid >> 2))), 0);
        m2Plain[4] = (fid << 6) & 0xc0;
        m2Plain.set(keyNew, 16);
        const m2 = aesCbcEncrypt(k1, m2Plain);

        const m3 = aesCmac(k2, concat(m1, m2));

        const m4Star = aesEcbEncryptBlock(k3, concat(uint32ToBytes(counter * 16 + 0x08), new Uint8Array(12)));
        const m4 = concat(m1, m4Star);

        const m5 = aesCmac(k4, m4);

        return [
            `M1: ${toHexFast(m1)}`,
            `M2: ${toHexFast(m2)}`,
            `M3: ${toHexFast(m3)}`,
            `M4: ${toHexFast(m4)}`,
            `M5: ${toHexFast(m5)}`,
        ].join("\n");
    }

}

/**
 * Converts a byte string into a Uint8Array.
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
function strToBytes(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        out[i] = str.charCodeAt(i);
    }
    return out;
}

/**
 * Parses a hex string into a Uint8Array.
 *
 * @param {string} hex
 * @returns {Uint8Array}
 */
function fromHex(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return out;
}

/**
 * Encodes an unsigned integer as a 4-byte big-endian Uint8Array.
 *
 * @param {number} value
 * @returns {Uint8Array}
 */
function uint32ToBytes(value) {
    return new Uint8Array([
        Math.floor(value / 0x1000000) & 0xff,
        Math.floor(value / 0x10000) & 0xff,
        Math.floor(value / 0x100) & 0xff,
        value & 0xff,
    ]);
}

/**
 * Concatenates two Uint8Arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function concat(a, b) {
    const out = new Uint8Array(a.length + b.length);
    out.set(a, 0);
    out.set(b, a.length);
    return out;
}

/**
 * XORs two equal-length Uint8Arrays.
 *
 * @param {Uint8Array} a
 * @param {Uint8Array} b
 * @returns {Uint8Array}
 */
function xor(a, b) {
    const out = new Uint8Array(a.length);
    for (let i = 0; i < a.length; i++) {
        out[i] = a[i] ^ b[i];
    }
    return out;
}

/**
 * Converts a Uint8Array into a forge byte string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function toForge(bytes) {
    let str = "";
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return str;
}

/**
 * AES-128 ECB encryption of a single 16-byte block.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} block
 * @returns {Uint8Array}
 */
function aesEcbEncryptBlock(key, block) {
    const cipher = forge.cipher.createCipher("AES-ECB", toForge(key));
    cipher.start();
    cipher.update(forge.util.createBuffer(toForge(block)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return strToBytes(out.substring(0, 16));
}

/**
 * AES-128 CBC encryption with a zero IV, no padding.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function aesCbcEncrypt(key, data) {
    const cipher = forge.cipher.createCipher("AES-CBC", toForge(key));
    cipher.start({iv: toForge(new Uint8Array(16))});
    cipher.update(forge.util.createBuffer(toForge(data)));
    cipher.finish();
    const out = cipher.output.getBytes();
    return strToBytes(out.substring(0, data.length));
}

/**
 * SHE key derivation function: the Miyaguchi-Preneel one-way compression
 * of the key concatenated with the given constant.
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} constant
 * @returns {Uint8Array}
 */
function kdf(key, constant) {
    const data = concat(key, constant);
    let g = new Uint8Array(16);
    for (let i = 0; i < data.length; i += 16) {
        const block = data.subarray(i, i + 16);
        g = xor(xor(aesEcbEncryptBlock(g, block), block), g);
    }
    return g;
}

/**
 * AES-128-CMAC (RFC 4493).
 *
 * @param {Uint8Array} key
 * @param {Uint8Array} message
 * @returns {Uint8Array}
 */
function aesCmac(key, message) {
    const Rb = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x87]);
    const cipher = forge.cipher.createCipher("AES-ECB", toForge(key));
    const encrypt = function(block) {
        cipher.start();
        cipher.update(forge.util.createBuffer(toForge(block)));
        cipher.finish();
        return strToBytes(cipher.output.getBytes().substring(0, 16));
    };

    const leftShift1 = function(a) {
        const out = new Uint8Array(a.length);
        let carry = 0;
        for (let i = a.length - 1; i >= 0; i--) {
            out[i] = ((a[i] << 1) | carry) & 0xff;
            carry = a[i] >> 7;
        }
        return out;
    };

    const L = encrypt(new Uint8Array(16));
    let k1 = leftShift1(L);
    if (L[0] & 0x80) k1 = xor(k1, Rb);
    let k2 = leftShift1(k1);
    if (k1[0] & 0x80) k2 = xor(k2, Rb);

    const n = Math.ceil(message.length / 16);
    let lastBlock;
    if (n === 0) {
        lastBlock = new Uint8Array(k2);
        lastBlock[0] ^= 0x80;
    } else {
        const last = message.subarray(16 * (n - 1));
        if (last.length === 16) {
            lastBlock = xor(last, k1);
        } else {
            const padded = new Uint8Array(16);
            padded.set(last, 0);
            padded[last.length] = 0x80;
            lastBlock = xor(padded, k2);
        }
    }

    let x = new Uint8Array(16);
    for (let i = 0; i < n - 1; i++) {
        x = encrypt(xor(x, message.subarray(16 * i, 16 * i + 16)));
    }
    return encrypt(xor(lastBlock, x));
}

export default SHEKeyUpdate;
