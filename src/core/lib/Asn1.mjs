/**
 * ASN.1 / OID / PEM helpers.
 *
 * Helpers used by the HexToObjectIdentifier, ObjectIdentifierToHex,
 * HexToPEM and ParseASN1HexString operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { fromBER } from "asn1js";
import OperationError from "../errors/OperationError.mjs";

/**
 * Convert a BER-encoded OID (as a hex string) to its dotted-decimal form.
 *
 * @param {string} hex
 * @returns {string}
 */
export function oidHexToInt(hex) {
    const cleaned = hex.replace(/\s/g, "").toLowerCase();
    if (cleaned.length === 0 || cleaned.length % 2 !== 0 || !/^[0-9a-f]+$/.test(cleaned)) {
        throw new OperationError("Invalid hex string");
    }

    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
    }

    const varints = [];
    let value = 0n;
    for (const b of bytes) {
        value = (value << 7n) | BigInt(b & 0x7f);
        if ((b & 0x80) === 0) {
            varints.push(value);
            value = 0n;
        }
    }
    if (value !== 0n) {
        throw new OperationError("Malformed OID: ends with continuation byte");
    }
    if (varints.length === 0) {
        throw new OperationError("Empty OID");
    }

    const arcs = [];
    const first = varints[0];
    if (first < 40n) {
        arcs.push("0", first.toString());
    } else if (first < 80n) {
        arcs.push("1", (first - 40n).toString());
    } else {
        arcs.push("2", (first - 80n).toString());
    }
    for (let i = 1; i < varints.length; i++) {
        arcs.push(varints[i].toString());
    }
    return arcs.join(".");
}

/**
 * Convert a dotted-decimal OID to its BER hex encoding.
 *
 * @param {string} oid
 * @returns {string}
 */
export function oidIntToHex(oid) {
    if (typeof oid !== "string" || oid.length === 0) {
        throw new OperationError("Empty OID");
    }
    const arcs = oid.split(".").map(a => {
        if (!/^\d+$/.test(a)) {
            throw new OperationError(`Invalid OID arc: ${a}`);
        }
        return BigInt(a);
    });
    if (arcs.length < 2) {
        throw new OperationError("OID must have at least two arcs");
    }
    if (arcs[0] > 2n) {
        throw new OperationError("First arc must be 0, 1 or 2");
    }
    if (arcs[0] < 2n && arcs[1] > 39n) {
        throw new OperationError("Second arc must be ≤ 39 when first arc is 0 or 1");
    }

    const values = [arcs[0] * 40n + arcs[1], ...arcs.slice(2)];
    const out = [];
    for (const v of values) {
        if (v === 0n) {
            out.push(0);
            continue;
        }
        const parts = [];
        let n = v;
        while (n > 0n) {
            parts.unshift(Number(n & 0x7fn));
            n >>= 7n;
        }
        for (let i = 0; i < parts.length - 1; i++) parts[i] |= 0x80;
        out.push(...parts);
    }
    return out.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Wrap a hex-encoded DER blob in a PEM envelope.
 *
 * Uses LF line endings only.
 *
 * Input parsing is intentionally lenient: whitespace is stripped, an
 * odd-length string is left-padded with a zero, and characters that are not
 * hex digits are treated as the nibble `0`. This keeps the operation usable
 * as a generic byte-emitter inside larger recipes where the upstream stage
 * may not produce strict hex.
 *
 * @param {string} hex
 * @param {string} label
 * @returns {string}
 */
export function derToPem(hex, label) {
    let cleaned = hex.replace(/\s/g, "");
    if (cleaned.length % 2 !== 0) cleaned = "0" + cleaned;

    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        const v = parseInt(cleaned.substr(i * 2, 2), 16);
        bytes[i] = Number.isNaN(v) ? 0 : v;
    }

    let b64;
    if (typeof Buffer !== "undefined") {
        b64 = Buffer.from(bytes).toString("base64");
    } else {
        let bin = "";
        for (const b of bytes) bin += String.fromCharCode(b);
        b64 = btoa(bin);
    }

    const lines = b64.length === 0 ? [""] : b64.match(/.{1,64}/g);
    return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

/**
 * Walk an asn1js parse tree and produce an indented dump.
 *
 * @param {string} hex
 * @param {Object} [options]
 * @param {number} [options.truncate=32] - max bytes of an OCTET/BIT/printable value shown before truncating
 * @param {number} [options.startIndex=0] - hex-character offset to start parsing at
 * @returns {string}
 */
export function dumpAsn1Hex(hex, options = {}) {
    const truncate = options.truncate ?? 32;
    const startIndex = options.startIndex ?? 0;

    let cleaned = hex.replace(/\s/g, "").toLowerCase();
    if (cleaned.length % 2 !== 0) cleaned = "0" + cleaned;
    const slice = cleaned.slice(startIndex);
    const bytes = new Uint8Array(slice.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        const v = parseInt(slice.substr(i * 2, 2), 16);
        bytes[i] = Number.isNaN(v) ? 0 : v;
    }

    const result = fromBER(bytes.buffer);
    const lines = [];
    if (result.offset === -1 || !result.result || (result.result.error && !result.result.idBlock)) {
        return `ASN.1 parse error: ${(result.result && result.result.error) || "unknown"}`;
    }
    formatAsn1Node(result.result, 0, truncate, lines);
    if (result.offset === -1 && result.result && result.result.error) {
        lines.push(`(parse warning: ${result.result.error})`);
    }
    return lines.join("\n");
}

/**
 * Recursively format one asn1js node.
 *
 * @param {Object} node
 * @param {number} depth
 * @param {number} truncate
 * @param {string[]} out
 */
function formatAsn1Node(node, depth, truncate, out) {
    const pad = "  ".repeat(depth);
    const idBlock = node.idBlock || {};
    const valueBlock = node.valueBlock || {};
    const tagClass = idBlock.tagClass;
    const tagNumber = idBlock.tagNumber;
    const isConstructed = !!idBlock.isConstructed;

    if (tagClass !== 1) {
        const className = ["", "UNIVERSAL", "APPLICATION", "CONTEXT", "PRIVATE"][tagClass] || "UNKNOWN";
        const label = `[${className} ${tagNumber}]${isConstructed ? " (constructed)" : ""}`;
        if (isConstructed && Array.isArray(valueBlock.value)) {
            out.push(`${pad}${label}`);
            for (const child of valueBlock.value) formatAsn1Node(child, depth + 1, truncate, out);
        } else {
            out.push(`${pad}${label} ${truncateHex(extractHex(valueBlock), truncate)}`);
        }
        return;
    }

    const ctorName = node.constructor && node.constructor.name;
    switch (ctorName) {
        case "Sequence":
            out.push(`${pad}SEQUENCE`);
            for (const child of valueBlock.value || []) formatAsn1Node(child, depth + 1, truncate, out);
            return;
        case "Set":
            out.push(`${pad}SET`);
            for (const child of valueBlock.value || []) formatAsn1Node(child, depth + 1, truncate, out);
            return;
        case "Null":
            out.push(`${pad}NULL`);
            return;
        case "Boolean":
            out.push(`${pad}BOOLEAN ${valueBlock.value ? "TRUE" : "FALSE"}`);
            return;
        case "Integer":
            out.push(`${pad}INTEGER ${formatIntegerValue(valueBlock)}`);
            return;
        case "ObjectIdentifier":
            out.push(`${pad}ObjectIdentifier ${valueBlock.toJSON().value}`);
            return;
        case "OctetString":
            out.push(`${pad}OCTET STRING ${truncateHex(extractHex(valueBlock), truncate)}`);
            return;
        case "BitString":
            out.push(`${pad}BIT STRING ${truncateHex(extractHex(valueBlock), truncate)}`);
            return;
        case "Utf8String":
        case "PrintableString":
        case "Ia5String":
        case "IA5String":
        case "VisibleString":
        case "TeletexString":
        case "UniversalString":
        case "BmpString":
        case "BMPString":
        case "NumericString":
        case "GeneralString":
        case "CharacterString":
        case "GraphicString":
        case "VideotexString":
            out.push(`${pad}${ctorName} "${truncateText(valueBlock.value || "", truncate)}"`);
            return;
        case "UTCTime":
        case "GeneralizedTime":
            out.push(`${pad}${ctorName} ${valueBlock.toString ? node.toString() : truncateHex(extractHex(valueBlock), truncate)}`);
            return;
        default: {
            const label = ctorName || `UNIVERSAL ${tagNumber}`;
            if (isConstructed && Array.isArray(valueBlock.value)) {
                out.push(`${pad}${label}`);
                for (const child of valueBlock.value) formatAsn1Node(child, depth + 1, truncate, out);
            } else {
                out.push(`${pad}${label} ${truncateHex(extractHex(valueBlock), truncate)}`);
            }
        }
    }
}

/**
 * Extract the hex representation of an asn1js value block.
 *
 * @param {Object} valueBlock
 * @returns {string}
 */
function extractHex(valueBlock) {
    if (!valueBlock) return "";
    const view = valueBlock.valueHexView;
    if (view && view.length) return bufToHex(view);
    return "";
}

/**
 * Convert a Uint8Array view to a lowercase hex string.
 *
 * @param {Uint8Array} buf
 * @returns {string}
 */
function bufToHex(buf) {
    let out = "";
    for (const b of buf) out += b.toString(16).padStart(2, "0");
    return out;
}

/**
 * Truncate hex string to at most `truncate` bytes, appending an ellipsis marker.
 *
 * @param {string} hex
 * @param {number} truncate
 * @returns {string}
 */
function truncateHex(hex, truncate) {
    const maxChars = truncate * 2;
    if (maxChars > 0 && hex.length > maxChars) {
        return `${hex.slice(0, maxChars)}... (${hex.length / 2} bytes)`;
    }
    return hex;
}

/**
 * Truncate a text string to at most `truncate` characters.
 *
 * @param {string} text
 * @param {number} truncate
 * @returns {string}
 */
function truncateText(text, truncate) {
    if (truncate > 0 && text.length > truncate) {
        return `${text.slice(0, truncate)}... (${text.length} chars)`;
    }
    return text;
}

/**
 * Format an Integer's value. asn1js exposes a small int as `valueDec`; for
 * arbitrary-length ints we fall back to the raw hex view.
 *
 * @param {Object} valueBlock
 * @returns {string}
 */
function formatIntegerValue(valueBlock) {
    if (valueBlock.isHexOnly) return extractHex(valueBlock);
    if (typeof valueBlock.valueDec === "number" && Number.isFinite(valueBlock.valueDec)) {
        return valueBlock.valueDec.toString();
    }
    return extractHex(valueBlock);
}
