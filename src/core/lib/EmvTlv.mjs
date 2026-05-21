/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 *
 * BER-TLV parser for EMV data. Handles:
 *  - 1- and 2-byte tags (short-form and long-form tags up to 2 bytes)
 *  - Short-form and long-form lengths (up to 3 length bytes)
 *  - Recursive constructed-tag parsing
 *  - EMV tag dictionary enrichment (name, source, format, class)
 */

import OperationError from "../errors/OperationError.mjs";
import EMV_TAG_DICTIONARY from "./EmvTlvDictionary.mjs";

/**
 * Parse a hex string into a Uint8Array of bytes.
 * @param {string} hex
 * @returns {Uint8Array}
 */
function hexToBytes(hex) {
    const h = hex.replace(/\s+/g, "").toUpperCase();
    if (!/^[0-9A-F]*$/.test(h) || h.length % 2 !== 0)
        throw new OperationError("Input is not valid hex (odd length or non-hex chars).");
    const bytes = new Uint8Array(h.length / 2);
    for (let i = 0; i < bytes.length; i++)
        bytes[i] = parseInt(h.substring(i * 2, i * 2 + 2), 16);
    return bytes;
}

/**
 * Determine tag class name from the high two bits of the first tag byte.
 * @param {number} firstByte
 * @returns {string}
 */
function tagClassName(firstByte) {
    switch ((firstByte & 0xC0) >> 6) {
        case 0: return "Universal";
        case 1: return "Application";
        case 2: return "Context-Specific";
        case 3: return "Private";
    }
}

/**
 * Read one BER-TLV record starting at `offset` in `bytes`.
 * Returns { tag, tagHex, rawBytes, constructed, class, length, valueBytes, offset: nextOffset }.
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {object}
 */
function readTlv(bytes, offset) {
    if (offset >= bytes.length)
        throw new OperationError(`Unexpected end of data at offset ${offset}.`);

    const firstByte = bytes[offset];
    const isConstructed = !!(firstByte & 0x20);
    const cls = tagClassName(firstByte);

    // Tag: 1 or 2 bytes
    let tagHex;
    if ((firstByte & 0x1F) === 0x1F) {
        // Long-form tag: second byte follows
        if (offset + 1 >= bytes.length)
            throw new OperationError(`Truncated long-form tag at offset ${offset}.`);
        tagHex = bytes[offset].toString(16).padStart(2, "0").toUpperCase() +
                 bytes[offset + 1].toString(16).padStart(2, "0").toUpperCase();
        offset += 2;
    } else {
        tagHex = firstByte.toString(16).padStart(2, "0").toUpperCase();
        offset += 1;
    }

    // Length
    if (offset >= bytes.length)
        throw new OperationError(`Missing length byte for tag ${tagHex}.`);

    const lenByte = bytes[offset++];
    let length;
    if (lenByte === 0x80) {
        throw new OperationError(`Indefinite-length form is not supported (tag ${tagHex}).`);
    } else if (lenByte > 0x80) {
        const numLenBytes = lenByte & 0x7F;
        if (numLenBytes > 3)
            throw new OperationError(`Length encoding too long (${numLenBytes} bytes) for tag ${tagHex}.`);
        if (offset + numLenBytes > bytes.length)
            throw new OperationError(`Truncated length field for tag ${tagHex}.`);
        length = 0;
        for (let i = 0; i < numLenBytes; i++)
            length = (length << 8) | bytes[offset++];
    } else {
        length = lenByte;
    }

    if (offset + length > bytes.length)
        throw new OperationError(`Value of tag ${tagHex} extends past end of data (need ${length} bytes at offset ${offset}, have ${bytes.length - offset}).`);

    const valueBytes = bytes.slice(offset, offset + length);
    offset += length;

    return { tagHex, isConstructed, class: cls, length, valueBytes, nextOffset: offset };
}

/**
 * Recursively parse all BER-TLV records in `bytes[start..end]`.
 * @param {Uint8Array} bytes
 * @param {number} start
 * @param {number} end
 * @param {number} depth
 * @returns {object[]}
 */
function parseTlvSequence(bytes, start, end, depth) {
    const records = [];
    let offset = start;
    while (offset < end) {
        // Skip 0x00 padding bytes (common in EMV records)
        if (bytes[offset] === 0x00) { offset++; continue; }

        const tlv = readTlv(bytes, offset);
        offset = tlv.nextOffset;

        const valueHex = Array.from(tlv.valueBytes)
            .map(b => b.toString(16).padStart(2, "0").toUpperCase())
            .join("");

        const dict = EMV_TAG_DICTIONARY[tlv.tagHex] || null;

        const record = {
            tag:         tlv.tagHex,
            name:        dict ? dict.name : "Unknown",
            constructed: tlv.isConstructed,
            class:       dict ? dict.class : tlv.class,
            source:      dict ? dict.source : null,
            format:      dict ? dict.format : null,
            length:      tlv.length,
            valueHex,
        };

        if (tlv.isConstructed && tlv.length > 0) {
            try {
                record.children = parseTlvSequence(tlv.valueBytes, 0, tlv.valueBytes.length, depth + 1);
            } catch (_) {
                record.children = [];
                record.parseWarning = "Could not parse constructed value as BER-TLV.";
            }
        }

        records.push(record);
    }
    return records;
}

/**
 * Entry point: parse a hex-encoded EMV TLV blob.
 * @param {string} hex
 * @returns {object[]} parsed TLV records
 */
function parseEmvTlv(hex) {
    const bytes = hexToBytes(hex);
    if (bytes.length === 0) throw new OperationError("Input is empty.");
    return parseTlvSequence(bytes, 0, bytes.length, 0);
}

export { parseEmvTlv, EMV_TAG_DICTIONARY };
