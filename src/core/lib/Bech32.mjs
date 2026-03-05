/**
 * Pure JavaScript implementation of Bech32 and Bech32m encoding.
 *
 * Bech32 is defined in BIP-0173: https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki
 * Bech32m is defined in BIP-0350: https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki
 *
 * @author Medjedtxm
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

import OperationError from "../errors/OperationError.mjs";

/** Bech32 character set (32 characters, excludes 1, b, i, o) */
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

/** Reverse lookup table for decoding */
const CHARSET_REV = {};
for (let i = 0; i < CHARSET.length; i++) {
    CHARSET_REV[CHARSET[i]] = i;
}

/** Checksum constant for Bech32 (BIP-0173) */
const BECH32_CONST = 1;

/** Checksum constant for Bech32m (BIP-0350) */
const BECH32M_CONST = 0x2bc830a3;

/** Generator polynomial coefficients for checksum */
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

/**
 * Compute the polymod checksum
 * @param {number[]} values - Array of 5-bit values
 * @returns {number} - Checksum value
 */
function polymod(values) {
    let chk = 1;
    for (const v of values) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ v;
        for (let i = 0; i < 5; i++) {
            if ((top >> i) & 1) {
                chk ^= GENERATOR[i];
            }
        }
    }
    return chk;
}

/**
 * Expand HRP for checksum computation
 * @param {string} hrp - Human-readable part (lowercase)
 * @returns {number[]} - Expanded values
 */
function hrpExpand(hrp) {
    const result = [];
    for (let i = 0; i < hrp.length; i++) {
        result.push(hrp.charCodeAt(i) >> 5);
    }
    result.push(0);
    for (let i = 0; i < hrp.length; i++) {
        result.push(hrp.charCodeAt(i) & 31);
    }
    return result;
}

/**
 * Verify checksum of a Bech32/Bech32m string
 * @param {string} hrp - Human-readable part (lowercase)
 * @param {number[]} data - Data including checksum (5-bit values)
 * @param {string} encoding - "Bech32" or "Bech32m"
 * @returns {boolean} - True if checksum is valid
 */
function verifyChecksum(hrp, data, encoding) {
    const constant = encoding === "Bech32m" ? BECH32M_CONST : BECH32_CONST;
    return polymod(hrpExpand(hrp).concat(data)) === constant;
}

/**
 * Create checksum for Bech32/Bech32m encoding
 * @param {string} hrp - Human-readable part (lowercase)
 * @param {number[]} data - Data values (5-bit)
 * @param {string} encoding - "Bech32" or "Bech32m"
 * @returns {number[]} - 6 checksum values
 */
function createChecksum(hrp, data, encoding) {
    const constant = encoding === "Bech32m" ? BECH32M_CONST : BECH32_CONST;
    const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
    const mod = polymod(values) ^ constant;
    const result = [];
    for (let i = 0; i < 6; i++) {
        result.push((mod >> (5 * (5 - i))) & 31);
    }
    return result;
}

/**
 * Convert 8-bit bytes to 5-bit words
 * @param {number[]|Uint8Array} data - Input bytes
 * @returns {number[]} - 5-bit words
 */
export function toWords(data) {
    let value = 0;
    let bits = 0;
    const result = [];

    for (let i = 0; i < data.length; i++) {
        value = (value << 8) | data[i];
        bits += 8;

        while (bits >= 5) {
            bits -= 5;
            result.push((value >> bits) & 31);
        }
    }

    // Pad remaining bits
    if (bits > 0) {
        result.push((value << (5 - bits)) & 31);
    }

    return result;
}

/**
 * Convert 5-bit words to 8-bit bytes
 * @param {number[]} words - 5-bit words
 * @returns {number[]} - Output bytes
 */
export function fromWords(words) {
    let value = 0;
    let bits = 0;
    const result = [];

    for (let i = 0; i < words.length; i++) {
        value = (value << 5) | words[i];
        bits += 5;

        while (bits >= 8) {
            bits -= 8;
            result.push((value >> bits) & 255);
        }
    }

    // Check for invalid padding per BIP-0173
    // Condition 1: Cannot have 5+ bits remaining (would indicate incomplete byte)
    if (bits >= 5) {
        throw new OperationError("Invalid padding: too many bits remaining");
    }
    // Condition 2: Remaining padding bits must all be zero
    if (bits > 0) {
        const paddingValue = (value << (8 - bits)) & 255;
        if (paddingValue !== 0) {
            throw new OperationError("Invalid padding: non-zero bits in padding");
        }
    }

    return result;
}

/**
 * Encode data to Bech32/Bech32m string
 *
 * @param {string} hrp - Human-readable part
 * @param {number[]|Uint8Array} data - Data bytes to encode
 * @param {string} encoding - "Bech32" or "Bech32m"
 * @param {boolean} segwit - If true, treat first byte as witness version (for Bitcoin SegWit)
 * @returns {string} - Encoded Bech32/Bech32m string
 */
export function encode(hrp, data, encoding = "Bech32", segwit = false) {
    // Validate HRP
    if (!hrp || hrp.length === 0) {
        throw new OperationError("Human-Readable Part (HRP) cannot be empty.");
    }

    // Check HRP characters (ASCII 33-126)
    for (let i = 0; i < hrp.length; i++) {
        const c = hrp.charCodeAt(i);
        if (c < 33 || c > 126) {
            throw new OperationError(`HRP contains invalid character at position ${i}. Only printable ASCII characters (33-126) are allowed.`);
        }
    }

    // Convert HRP to lowercase
    const hrpLower = hrp.toLowerCase();

    let words;
    if (segwit && data.length >= 2) {
        // SegWit encoding: first byte is witness version (0-16), rest is witness program
        const witnessVersion = data[0];
        if (witnessVersion > 16) {
            throw new OperationError(`Invalid witness version: ${witnessVersion}. Must be 0-16.`);
        }
        const witnessProgram = Array.prototype.slice.call(data, 1);

        // Validate witness program length per BIP-0141
        if (witnessProgram.length < 2 || witnessProgram.length > 40) {
            throw new OperationError(`Invalid witness program length: ${witnessProgram.length}. Must be 2-40 bytes.`);
        }
        if (witnessVersion === 0 && witnessProgram.length !== 20 && witnessProgram.length !== 32) {
            throw new OperationError(`Invalid witness program length for v0: ${witnessProgram.length}. Must be 20 or 32 bytes.`);
        }

        // Witness version is kept as single 5-bit value, program is converted
        words = [witnessVersion].concat(toWords(witnessProgram));
    } else {
        // Generic encoding: convert all bytes to 5-bit words
        words = toWords(data);
    }

    // Create checksum
    const checksum = createChecksum(hrpLower, words, encoding);

    // Build result string
    let result = hrpLower + "1";
    for (const w of words.concat(checksum)) {
        result += CHARSET[w];
    }

    // Check maximum length (90 characters)
    if (result.length > 90) {
        throw new OperationError(`Encoded string exceeds maximum length of 90 characters (got ${result.length}). Consider using smaller input data.`);
    }

    return result;
}

/**
 * Decode a Bech32/Bech32m string
 *
 * @param {string} str - Bech32/Bech32m encoded string
 * @param {string} encoding - "Bech32", "Bech32m", or "Auto-detect"
 * @returns {{hrp: string, data: number[]}} - Decoded HRP and data bytes
 */
export function decode(str, encoding = "Auto-detect") {
    // Check for empty input
    if (!str || str.length === 0) {
        throw new OperationError("Input cannot be empty.");
    }

    // Check maximum length
    if (str.length > 90) {
        throw new OperationError(`Invalid Bech32 string: exceeds maximum length of 90 characters (got ${str.length}).`);
    }

    // Check for mixed case
    const hasUpper = /[A-Z]/.test(str);
    const hasLower = /[a-z]/.test(str);
    if (hasUpper && hasLower) {
        throw new OperationError("Invalid Bech32 string: mixed case is not allowed. Use all uppercase or all lowercase.");
    }

    // Convert to lowercase for processing
    str = str.toLowerCase();

    // Find separator (last occurrence of '1')
    const sepIndex = str.lastIndexOf("1");
    if (sepIndex === -1) {
        throw new OperationError("Invalid Bech32 string: no separator '1' found.");
    }

    if (sepIndex === 0) {
        throw new OperationError("Invalid Bech32 string: Human-Readable Part (HRP) cannot be empty.");
    }

    if (sepIndex + 7 > str.length) {
        throw new OperationError("Invalid Bech32 string: data part is too short (minimum 6 characters for checksum).");
    }

    // Extract HRP and data part
    const hrp = str.substring(0, sepIndex);
    const dataPart = str.substring(sepIndex + 1);

    // Validate HRP characters
    for (let i = 0; i < hrp.length; i++) {
        const c = hrp.charCodeAt(i);
        if (c < 33 || c > 126) {
            throw new OperationError(`HRP contains invalid character at position ${i}.`);
        }
    }

    // Decode data characters to 5-bit values
    const data = [];
    for (let i = 0; i < dataPart.length; i++) {
        const c = dataPart[i];
        if (CHARSET_REV[c] === undefined) {
            throw new OperationError(`Invalid character '${c}' at position ${sepIndex + 1 + i}.`);
        }
        data.push(CHARSET_REV[c]);
    }

    // Verify checksum
    let usedEncoding;
    if (encoding === "Bech32") {
        if (!verifyChecksum(hrp, data, "Bech32")) {
            throw new OperationError("Invalid Bech32 checksum.");
        }
        usedEncoding = "Bech32";
    } else if (encoding === "Bech32m") {
        if (!verifyChecksum(hrp, data, "Bech32m")) {
            throw new OperationError("Invalid Bech32m checksum.");
        }
        usedEncoding = "Bech32m";
    } else {
        // Auto-detect: try Bech32 first, then Bech32m
        if (verifyChecksum(hrp, data, "Bech32")) {
            usedEncoding = "Bech32";
        } else if (verifyChecksum(hrp, data, "Bech32m")) {
            usedEncoding = "Bech32m";
        } else {
            throw new OperationError("Invalid Bech32/Bech32m string: checksum verification failed.");
        }
    }

    // Remove checksum (last 6 values)
    const words = data.slice(0, data.length - 6);

    // Check if this is likely a SegWit address (Bitcoin, Litecoin, etc.)
    // For SegWit, the first 5-bit word is the witness version (0-16)
    // and should be extracted separately, not bit-converted with the rest
    const segwitHrps = ["bc", "tb", "ltc", "tltc", "bcrt"];
    const couldBeSegWit = segwitHrps.includes(hrp) && words.length > 0 && words[0] <= 16;

    let bytes;
    let witnessVersion = null;

    if (couldBeSegWit) {
        // Try SegWit decode first
        try {
            witnessVersion = words[0];
            const programWords = words.slice(1);
            const programBytes = fromWords(programWords);

            // Validate SegWit witness program length (20 or 32 bytes for v0, 2-40 for others)
            const validV0 = witnessVersion === 0 && (programBytes.length === 20 || programBytes.length === 32);
            const validOther = witnessVersion !== 0 && programBytes.length >= 2 && programBytes.length <= 40;

            if (validV0 || validOther) {
                // Valid SegWit address
                bytes = [witnessVersion, ...programBytes];
            } else {
                // Not valid SegWit, fall back to generic decode
                witnessVersion = null;
                bytes = fromWords(words);
            }
        } catch (e) {
            // SegWit decode failed, try generic decode
            witnessVersion = null;
            try {
                bytes = fromWords(words);
            } catch (e2) {
                throw new OperationError(`Failed to decode data: ${e2.message}`);
            }
        }
    } else {
        // Generic Bech32: convert all words
        try {
            bytes = fromWords(words);
        } catch (e) {
            throw new OperationError(`Failed to decode data: ${e.message}`);
        }
    }

    return {
        hrp: hrp,
        data: bytes,
        encoding: usedEncoding,
        witnessVersion: witnessVersion
    };
}
