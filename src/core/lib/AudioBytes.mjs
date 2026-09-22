/**
 * Byte-reading and text-decoding utilities for audio metadata parsing.
 *
 * @author d0s1nt [d0s1nt@cyberchefaudio]
 * @copyright Crown Copyright 2025
 * @license Apache-2.0
 */

/** @returns {string} 4-byte ASCII at offset, or "" if out of bounds. */
export function ascii4(b, off) {
    if (off + 4 > b.length) return "";
    return String.fromCharCode(b[off], b[off + 1], b[off + 2], b[off + 3]);
}

/** @returns {number} Byte offset of ASCII needle `s`, or -1. */
export function indexOfAscii(b, s, start, end) {
    const limit = Math.max(0, Math.min(end, b.length) - s.length);
    for (let i = start; i <= limit; i++) {
        let ok = true;
        for (let j = 0; j < s.length; j++) {
            if (b[i + j] !== s.charCodeAt(j)) {
                ok = false;
                break;
            }
        }
        if (ok) return i;
    }
    return -1;
}

/** @returns {number} Unsigned 32-bit big-endian read. */
export function u32be(bytes, off) {
    return ((bytes[off] << 24) >>> 0) | (bytes[off + 1] << 16) | (bytes[off + 2] << 8) | bytes[off + 3];
}

/** @returns {number} Unsigned 32-bit little-endian read. */
export function u32le(bytes, off) {
    return (bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24)) >>> 0;
}

/** @returns {number} Unsigned 16-bit little-endian read. */
export function u16le(bytes, off) {
    return bytes[off] | (bytes[off + 1] << 8);
}

/** @returns {BigInt} Unsigned 64-bit little-endian read. */
export function u64le(bytes, off) {
    return BigInt(u32le(bytes, off)) | (BigInt(u32le(bytes, off + 4)) << 32n);
}

/** @returns {number} Decoded ID3v2 synchsafe integer from four 7-bit bytes. */
export function synchsafeToInt(b0, b1, b2, b3) {
    return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

/** @returns {string} Decoded UTF-16LE byte range, nulls stripped. */
export function decodeUtf16LE(b, off, len) {
    if (len <= 0 || off + len > b.length) return "";
    try {
        return new TextDecoder("utf-16le").decode(b.slice(off, off + len)).replace(/\u0000/g, "").trim();
    } catch {
        return "";
    }
}

/** @returns {{valueBytes: Uint8Array, next: number}} Bytes until null terminator, UTF-16 aware. */
export function readNullTerminated(bytes, start, encoding) {
    const isUtf16 = encoding === 1 || encoding === 2;
    if (!isUtf16) {
        let i = start;
        while (i < bytes.length && bytes[i] !== 0x00) i++;
        return { valueBytes: bytes.slice(start, i), next: i + 1 };
    }
    let i = start;
    while (i + 1 < bytes.length && !(bytes[i] === 0x00 && bytes[i + 1] === 0x00)) i += 2;
    return { valueBytes: bytes.slice(start, i), next: i + 2 };
}

const ID3_ENCODINGS = ["iso-8859-1", "utf-16", "utf-16be", "utf-8"];

/** @returns {string} Text decoded using ID3v2 encoding byte (0=latin1, 1=utf16, 2=utf16be, 3=utf8). */
export function decodeText(bytes, encoding) {
    if (!bytes || bytes.length === 0) return "";
    try {
        return new TextDecoder(ID3_ENCODINGS[encoding] || "utf-16").decode(bytes);
    } catch {
        return safeUtf8(bytes);
    }
}

/** @returns {string} UTF-8 decode with replacement (never throws). */
export function safeUtf8(bytes) {
    try {
        return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
        return "";
    }
}

/** @returns {string} ISO-8859-1 decode, nulls stripped, trimmed. */
export function decodeLatin1Trim(bytes) {
    return decodeText(bytes, 0).replace(/\u0000/g, "").trim();
}
