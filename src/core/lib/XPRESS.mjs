/**
 * XPRESS (MS-XCA) decompression.
 *
 * @author MP Gowtham [gowthamrockerzzz@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 *
 * Implements the two XPRESS variants from:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-xca/
 * (2.1 XPRESS Algorithm Details, 2.2 LZ77+Huffman Algorithm Details)
 *
 * Cross-validated against the reference decoder in The Sleuth Kit
 * (tsk/fs/xpress.c) and go-ntfs (parser/xpress.go).
 */

import OperationError from "../errors/OperationError.mjs";

/** Maximum output per call (Windows sizes XPRESS blocks at up to
 *  32 MiB for WIM chunks and up to 1 MiB for WOF chunks). */
const MAX_DECOMPRESSED = 32 * 1024 * 1024;

/**
 * Decompress an XPRESS plain-LZ77 stream.
 *
 * The stream is self-terminating: a sequence of 32-bit flag groups
 * tested from bit 31 down. A clear bit is a literal byte. A set bit is
 * a match described by an LE16 word, (offset-1) in the top 13 bits and
 * (length-3) in the low 3 bits. A match whose low 3 bits are 7 uses the
 * shared-nibble form: the low nibble of the next stream byte extends
 * the length, and its high nibble extends the next match that also uses
 * this form. A nibble of 15 selects a raw length: a byte, an LE16 if
 * the byte is 255, or an LE32 if the LE16 is 0. The final flag group
 * is padded with set bits; a match flag with no input left is the
 * end-of-data marker.
 *
 * @param {byteArray} input
 * @returns {byteArray} decompressed data
 */
export function decompress(input) {
    const out = [];
    let pending = -1; // offset of the shared-nibble byte, -1 when none pending
    let flags = 0;
    let flagsLeft = 0;
    let i = 0;

    while (true) {
        if (flagsLeft === 0) {
            if (input.length - i < 4)
                throw new OperationError("XPRESS: truncated flag group");
            flags = (input[i] | (input[i + 1] << 8) |
                     (input[i + 2] << 16) | (input[i + 3] << 24)) >>> 0;
            i += 4;
            flagsLeft = 32;
        }
        flagsLeft--;
        if (((flags >>> flagsLeft) & 1) === 0) {
            if (i >= input.length)
                throw new OperationError("XPRESS: truncated literal");
            out.push(input[i++]);
            continue;
        }

        // A set flag with no input left is the end-of-data marker.
        if (i >= input.length)
            return out;
        if (input.length - i < 2)
            throw new OperationError("XPRESS: truncated match");
        const mb = input[i] | (input[i + 1] << 8);
        i += 2;
        const moff = (mb >>> 3) + 1;
        let mlen = (mb & 7) + 3;

        if ((mb & 7) === 7) {
            let nib;
            if (pending === -1) {
                if (i >= input.length)
                    throw new OperationError("XPRESS: truncated shared nibble");
                nib = input[i] & 0x0f;
                pending = i++;
            } else {
                nib = input[pending] >>> 4;
                pending = -1;
            }
            if (nib === 15) {
                let v = 0;
                if (i >= input.length)
                    throw new OperationError("XPRESS: truncated raw length");
                v = input[i++];
                if (v === 255) {
                    if (input.length - i < 2)
                        throw new OperationError("XPRESS: truncated raw length");
                    v = input[i] | (input[i + 1] << 8);
                    i += 2;
                    if (v === 0) {
                        if (input.length - i < 4)
                            throw new OperationError("XPRESS: truncated raw length");
                        v = (input[i] | (input[i + 1] << 8) |
                             (input[i + 2] << 16) | (input[i + 3] << 24)) >>> 0;
                        i += 4;
                    }
                    if (v < 22)
                        throw new OperationError("XPRESS: invalid match length");
                    mlen = v + 3;
                } else {
                    mlen = v + 25;
                }
            } else {
                mlen = nib + 10;
            }
        }

        if (moff > 8192 || moff > out.length)
            throw new OperationError("XPRESS: match offset out of range");
        if (out.length + mlen > MAX_DECOMPRESSED)
            throw new OperationError("XPRESS: decompression ratio too large");

        const start = out.length - moff;
        for (let j = 0; j < mlen; j++)
            out.push(out[start + j]);
    }
}

/**
 * Decompress an XPRESS LZ77+Huffman stream into exactly
 * decompressedSize bytes.
 *
 * The first 256 bytes hold 512 4-bit code lengths, the even symbol in
 * the low nibble and the odd in the high. Canonical codes are assigned
 * in (length, symbol) order, most-significant bit first. The bit stream
 * follows as LE16 words, MSB first, read through a 32-bit register
 * refilled while fewer than 15 bits remain. Symbols 0..255 are
 * literals. Symbol 256 is end-of-data; mid-stream it decodes as a match
 * of length 3 at offset 1. Symbols 257..511 are matches: ((s-256)>>4)
 * selects the offset bit width, ((s-256)&15) the base length, with a
 * nibble of 15 selecting a raw length byte (an LE16 if 255, an LE32 if
 * the LE16 is 0).
 *
 * @param {byteArray} input
 * @param {number} decompressedSize
 * @returns {byteArray} decompressed data
 */
export function decompressHuffman(input, decompressedSize) {
    if (decompressedSize <= 0 || decompressedSize > MAX_DECOMPRESSED)
        throw new OperationError("XPRESS: invalid decompressed size");
    if (input.length < 256)
        throw new OperationError("XPRESS: truncated Huffman table");

    const lens = new Array(512);
    for (let l = 0; l < 256; l++) {
        lens[l * 2] = input[l] & 0x0f;
        lens[l * 2 + 1] = input[l] >>> 4;
    }

    // Decode table in canonical (length, symbol) order, MSB first.
    const TABLE_BITS = 15;
    const TABLE_SIZE = 1 << TABLE_BITS;
    const table = new Array(TABLE_SIZE);
    let e = 0;
    for (let l = 1; l <= TABLE_BITS; l++) {
        for (let s = 0; s < 512; s++) {
            if (lens[s] === l) {
                const n = 1 << (TABLE_BITS - l);
                for (let k = 0; k < n; k++)
                    table[e++] = s;
            }
        }
    }
    if (e !== TABLE_SIZE)
        throw new OperationError("XPRESS: invalid Huffman code lengths");

    // Preload two LE16 words, most-significant bit first.
    let bits = 0;
    let nbits = 0;
    let i = 256;
    while (nbits < 32) {
        if (input.length - i < 2)
            throw new OperationError("XPRESS: truncated bit stream");
        bits = ((bits >>> 0) | (input[i] | (input[i + 1] << 8)) << (16 - nbits)) >>> 0;
        i += 2;
        nbits += 16;
    }

    const out = [];
    for (;;) {
        while (nbits < 15) {
            if (input.length - i < 2)
                throw new OperationError("XPRESS: truncated bit stream");
            bits = ((bits >>> 0) | (input[i] | (input[i + 1] << 8)) << (16 - nbits)) >>> 0;
            i += 2;
            nbits += 16;
        }
        const sym = table[(bits >>> 17) & 0x7fff];
        const clen = lens[sym];
        bits = (bits >>> 0) << clen;
        nbits -= clen;

        if (sym < 256) {
            out.push(sym);
            if (out.length > decompressedSize)
                throw new OperationError("XPRESS: output exceeds declared size");
            continue;
        }

        if (sym === 256) {
            // End of data; mid-stream it decodes as a match(3, 1).
            if (out.length === decompressedSize)
                break;
            if (out.length === 0 || decompressedSize - out.length < 3)
                throw new OperationError("XPRESS: corrupt end-of-data marker");
            const start = out.length - 1;
            for (let j = 0; j < 3; j++)
                out.push(out[start + j]);
            continue;
        }

        const hb = (sym - 256) >>> 4;
        let mlen = (sym - 256) & 15;
        if (mlen === 15) {
            let v = 0;
            if (i >= input.length)
                throw new OperationError("XPRESS: truncated raw length");
            v = input[i++];
            if (v === 255) {
                if (input.length - i < 2)
                    throw new OperationError("XPRESS: truncated raw length");
                v = input[i] | (input[i + 1] << 8);
                i += 2;
                if (v === 0) {
                    if (input.length - i < 4)
                        throw new OperationError("XPRESS: truncated raw length");
                    v = (input[i] | (input[i + 1] << 8) |
                         (input[i + 2] << 16) | (input[i + 3] << 24)) >>> 0;
                    i += 4;
                }
                mlen = v + 3;
            } else {
                mlen = v + 18;
            }
        } else {
            mlen += 3;
        }

        while (nbits < hb) {
            if (input.length - i < 2)
                throw new OperationError("XPRESS: truncated bit stream");
            bits = ((bits >>> 0) | (input[i] | (input[i + 1] << 8)) << (16 - nbits)) >>> 0;
            i += 2;
            nbits += 16;
        }
        let moff = 0;
        if (hb > 0) {
            moff = (bits >>> (32 - hb)) & ((1 << hb) - 1);
            bits = (bits >>> 0) << hb;
            nbits -= hb;
        }
        moff += 1 << hb;

        if (moff > out.length)
            throw new OperationError("XPRESS: match offset out of range");
        if (out.length + mlen > MAX_DECOMPRESSED)
            throw new OperationError("XPRESS: decompression ratio too large");
        if (out.length + mlen > decompressedSize)
            throw new OperationError("XPRESS: output exceeds declared size");

        const start = out.length - moff;
        for (let j = 0; j < mlen; j++)
            out.push(out[start + j]);
    }
    return out;
}
