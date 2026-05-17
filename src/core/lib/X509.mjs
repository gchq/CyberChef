/**
 * Shared X.509 / CSR / CRL helpers built on @peculiar/x509 + @peculiar/asn1-*.
 *
 * Used by ParseX509Certificate / PubKeyFromCert / ParseCSR / ParseX509CRL.
 * Replaces the jsrsasign X.509 plumbing.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { AsnParser } from "@peculiar/asn1-schema";
import * as asn1X509 from "@peculiar/asn1-x509";
import * as ecc from "@peculiar/asn1-ecc";
import * as rsaSchemas from "@peculiar/asn1-rsa";
import { fromBER, Utf8String, BmpString, PrintableString, IA5String } from "asn1js";
import OperationError from "../errors/OperationError.mjs";
import { fromBase64 } from "./Base64.mjs";
import { fromHex } from "./Hex.mjs";
import Utils from "../Utils.mjs";

const { SubjectPublicKeyInfo, DirectoryString } = asn1X509;
const { ECParameters } = ecc;
const { RSAPublicKey } = rsaSchemas;

const ID_RSA_ENCRYPTION   = "1.2.840.113549.1.1.1";
const ID_EC_PUBLIC_KEY    = ecc.id_ecPublicKey;
const ID_DSA              = "1.2.840.10040.4.1";
const ID_ED25519          = "1.3.101.112";
const ID_ED448            = "1.3.101.113";

const SIG_ALG_OID_TO_NAME = {
    "1.2.840.113549.1.1.4":   "MD5withRSA",
    "1.2.840.113549.1.1.5":   "SHA1withRSA",
    "1.2.840.113549.1.1.11":  "SHA256withRSA",
    "1.2.840.113549.1.1.12":  "SHA384withRSA",
    "1.2.840.113549.1.1.13":  "SHA512withRSA",
    "1.2.840.113549.1.1.14":  "SHA224withRSA",
    "1.2.840.113549.1.1.10":  "SHA256withRSAandMGF1",
    "1.2.840.10045.4.1":      "SHA1withECDSA",
    "1.2.840.10045.4.3.1":    "SHA224withECDSA",
    "1.2.840.10045.4.3.2":    "SHA256withECDSA",
    "1.2.840.10045.4.3.3":    "SHA384withECDSA",
    "1.2.840.10045.4.3.4":    "SHA512withECDSA",
    "1.2.840.10040.4.3":      "SHA1withDSA",
    "2.16.840.1.101.3.4.3.1": "SHA224withDSA",
    "2.16.840.1.101.3.4.3.2": "SHA256withDSA",
    "2.16.840.1.101.3.4.3.3": "SHA384withDSA",
    "2.16.840.1.101.3.4.3.4": "SHA512withDSA",
    [ID_ED25519]:             "Ed25519",
    [ID_ED448]:               "Ed448",
};

const EC_CURVE_OID_TO_NAMES = {
    "1.2.840.10045.3.1.1": { asn1: "secp192r1", nist: "P-192", byteLen: 24, bits: 192 },
    "1.3.132.0.33":        { asn1: "secp224r1", nist: "P-224", byteLen: 28, bits: 224 },
    "1.2.840.10045.3.1.7": { asn1: "secp256r1", nist: "P-256", byteLen: 32, bits: 256 },
    "1.3.132.0.34":        { asn1: "secp384r1", nist: "P-384", byteLen: 48, bits: 384 },
    "1.3.132.0.35":        { asn1: "secp521r1", nist: "P-521", byteLen: 66, bits: 521 },
};

const OID_TO_SHORT_NAME = {
    "2.5.4.3":  "CN",
    "2.5.4.4":  "SN",
    "2.5.4.5":  "serialNumber",
    "2.5.4.6":  "C",
    "2.5.4.7":  "L",
    "2.5.4.8":  "ST",
    "2.5.4.9":  "street",
    "2.5.4.10": "O",
    "2.5.4.11": "OU",
    "2.5.4.12": "T",
    "2.5.4.42": "G",
    "2.5.4.43": "I",
    "2.5.4.44": "generationQualifier",
    "2.5.4.45": "x500UniqueIdentifier",
    "2.5.4.46": "dnQualifier",
    "2.5.4.65": "pseudonym",
    "1.2.840.113549.1.9.1":       "E",
    "0.9.2342.19200300.100.1.25": "DC",
    "0.9.2342.19200300.100.1.1":  "UID",
};


// ----- input decoding -------------------------------------------------------

/**
 * Decode the X.509 input string in the requested wire format into a Uint8Array
 * of DER bytes.  Accepts "PEM", "DER Hex", "Base64", "Raw".
 *
 * @param {string} input
 * @param {string} format
 * @returns {Uint8Array}
 */
export function decodeX509Input(input, format) {
    switch (format) {
        case "PEM": {
            const stripped = input
                .replace(/-----BEGIN [^-]+-----/g, "")
                .replace(/-----END [^-]+-----/g, "")
                .replace(/\s+/g, "");
            return new Uint8Array(fromBase64(stripped, null, "byteArray"));
        }
        case "DER Hex":
            return new Uint8Array(fromHex(input.replace(/\s/g, "")));
        case "Base64":
            return new Uint8Array(fromBase64(input, null, "byteArray"));
        case "Raw":
            return new Uint8Array(Utils.strToArrayBuffer(input));
        default:
            throw new OperationError(`Undefined input format: ${format}`);
    }
}


// ----- signature algorithm --------------------------------------------------

/**
 * Map a signature-algorithm OID to the jsrsasign-style display name
 * (e.g. "1.2.840.113549.1.1.11" -> "SHA256withRSA").  Falls back to the
 * raw OID if unknown.
 *
 * @param {string} oid
 * @returns {string}
 */
export function sigAlgOidToName(oid) {
    return SIG_ALG_OID_TO_NAME[oid] || oid;
}


// ----- public key info extraction -------------------------------------------

/**
 * Decode a SubjectPublicKeyInfo DER blob and return a normalised description.
 *
 * The return shape varies by algorithm:
 *   RSA:  { type: "RSA", nHex, eValue, bitLength }
 *   EC:   { type: "EC",  curveOid, asn1Curve, nistCurve, pubKeyHex, bitLength, x, y }
 *   DSA:  { type: "DSA", yHex, pHex, qHex, gHex, bitLength }
 *   Ed25519/Ed448: { type: "EdDSA", curveName, pubKeyHex }
 *   Other: { type: "Unknown", algorithm }
 *
 * @param {Uint8Array} spkiBytes
 * @returns {object}
 */
export function describeSpki(spkiBytes) {
    const spki = AsnParser.parse(spkiBytes, SubjectPublicKeyInfo);
    const alg = spki.algorithm.algorithm;
    const keyBytes = new Uint8Array(spki.subjectPublicKey);

    if (alg === ID_RSA_ENCRYPTION) {
        const rsa = AsnParser.parse(keyBytes, RSAPublicKey);
        const n = stripDerLeadingZero(new Uint8Array(rsa.modulus));
        const e = stripDerLeadingZero(new Uint8Array(rsa.publicExponent));
        return {
            type: "RSA",
            nHex: bytesToHex(n),
            eValue: Number(BigInt("0x" + (bytesToHex(e) || "0"))),
            bitLength: n.length === 0 ? 0 : ((n.length - 1) * 8) + (32 - Math.clz32(n[0])),
        };
    }

    if (alg === ID_EC_PUBLIC_KEY) {
        if (!spki.algorithm.parameters) throw new OperationError("EC SubjectPublicKeyInfo missing parameters");
        const params = AsnParser.parse(new Uint8Array(spki.algorithm.parameters), ECParameters);
        const curveOid = params.namedCurve;
        const info = EC_CURVE_OID_TO_NAMES[curveOid] || { asn1: curveOid, nist: curveOid, byteLen: null, bits: null };
        if (keyBytes[0] !== 0x04) {
            throw new OperationError("Only uncompressed EC public keys are supported");
        }
        const byteLen = info.byteLen || ((keyBytes.length - 1) / 2);
        return {
            type: "EC",
            curveOid,
            asn1Curve: info.asn1,
            nistCurve: info.nist,
            pubKeyHex: bytesToHex(keyBytes),
            bitLength: info.bits || byteLen * 8,
            x: keyBytes.slice(1, 1 + byteLen),
            y: keyBytes.slice(1 + byteLen, 1 + 2 * byteLen),
        };
    }

    if (alg === ID_DSA) {
        if (!spki.algorithm.parameters) throw new OperationError("DSA SubjectPublicKeyInfo missing DSS-Parms");
        const { p, q, g } = parseDssParms(new Uint8Array(spki.algorithm.parameters));
        const y = parseIntegerBitStringBytes(keyBytes);
        const pStripped = stripDerLeadingZero(p);
        return {
            type: "DSA",
            yHex: bytesToHex(y),
            pHex: bytesToHex(p),
            qHex: bytesToHex(q),
            gHex: bytesToHex(g),
            bitLength: pStripped.length * 8,
        };
    }

    if (alg === ID_ED25519 || alg === ID_ED448) {
        return {
            type: "EdDSA",
            curveName: alg === ID_ED25519 ? "Ed25519" : "Ed448",
            pubKeyHex: bytesToHex(keyBytes),
        };
    }

    return { type: "Unknown", algorithm: alg };
}


// ----- signature value parsing ----------------------------------------------

/**
 * Parse a DER-encoded ECDSA/DSA signature (SEQUENCE { r INTEGER, s INTEGER })
 * and return r and s as hex strings (without the DER 2's-complement leading
 * 0x00, when present).
 *
 * @param {string} sigHex
 * @returns {{r: string, s: string}}
 */
export function parseDerEcdsaSignature(sigHex) {
    const bytes = fromHex(sigHex);
    let i = 0;
    if (bytes[i++] !== 0x30) throw new OperationError("Signature is not an ASN.1 SEQUENCE");
    const seqLen = readDerLength(bytes, i); i = seqLen.next;
    if (i + seqLen.value !== bytes.length) throw new OperationError("Trailing bytes after SEQUENCE");

    if (bytes[i++] !== 0x02) throw new OperationError("First element is not an INTEGER");
    const rLen = readDerLength(bytes, i); i = rLen.next;
    const r = bytes.slice(i, i + rLen.value); i += rLen.value;

    if (bytes[i++] !== 0x02) throw new OperationError("Second element is not an INTEGER");
    const sLen = readDerLength(bytes, i); i = sLen.next;
    const s = bytes.slice(i, i + sLen.value);

    return {
        r: bytesToHex(stripDerLeadingZero(Uint8Array.from(r))),
        s: bytesToHex(stripDerLeadingZero(Uint8Array.from(s))),
    };
}

/**
 * Returns true if the supplied hex bytes parse as a SEQUENCE of two INTEGERs
 * (the wire format used for ECDSA/DSA signatures).
 *
 * @param {string} sigHex
 * @returns {boolean}
 */
export function isDerEcdsaSignature(sigHex) {
    try {
        parseDerEcdsaSignature(sigHex);
        return true;
    } catch {
        return false;
    }
}


// ----- formatters -----------------------------------------------------------

/**
 * Format a peculiar/x509 `JsonName` (the array-of-records form returned by
 * `name.toJSON()`) as a multi-line string of `KEY = value` pairs, indented.
 *
 * @param {Array<Record<string, string[]>>} jsonName
 * @param {number} indent
 * @returns {string}
 */
export function formatJsonName(jsonName, indent) {
    if (!Array.isArray(jsonName) || jsonName.length === 0) return "";
    const rows = [];
    for (const rdn of jsonName) {
        for (const key of Object.keys(rdn)) {
            const values = rdn[key];
            for (const value of values) rows.push({ key, value });
        }
    }
    if (rows.length === 0) return "";
    const maxKey = rows.reduce((m, row) => Math.max(m, row.key.length), 0);
    const pad = " ".repeat(indent);
    return rows.map(({ key, value }) => `${pad}${key.padEnd(maxKey, " ")} = ${value}`).join("\n");
}

/**
 * Convert peculiar/x509's `JsonName` into the OpenSSL-style
 * "/C=…/ST=…/O=…/CN=…" single-line representation.
 *
 * @param {Array<Record<string, string[]>>} jsonName
 * @returns {string}
 */
export function jsonNameToSlashString(jsonName) {
    if (!Array.isArray(jsonName) || jsonName.length === 0) return "";
    let out = "";
    for (const rdn of jsonName) {
        for (const key of Object.keys(rdn)) {
            for (const value of rdn[key]) out += "/" + key + "=" + value;
        }
    }
    return out;
}

/**
 * Format a hex string as `aa:bb:cc:...` groups of `bytesPerLine` bytes per
 * line, with each line after the first prefixed by `indent` spaces.
 *
 * @param {string} hex
 * @param {number} bytesPerLine
 * @param {number} indent
 * @returns {string}
 */
export function formatHexByteLines(hex, bytesPerLine, indent) {
    if (hex.length % 2 !== 0) hex = "0" + hex;
    const colonHex = hex.replace(/(..)/g, "$1:");
    const trimmed = colonHex.slice(0, -1);
    const lineLen = bytesPerLine * 3;
    let out = "";
    for (let i = 0; i < trimmed.length; i += lineLen) {
        const chunk = trimmed.slice(i, i + lineLen) + "\n";
        out += i === 0 ? chunk : " ".repeat(indent) + chunk;
    }
    return out.slice(0, -1);
}

/**
 * Format a hex string as colon-delimited bytes wrapped to `maxLineChars`
 * characters per line, with continuation lines indented by `indent` spaces.
 *
 * Used by ParseCSR / ParseX509CRL where the wrap width is measured in
 * characters rather than bytes per line.
 *
 * @param {string} hex
 * @param {number} maxLineChars
 * @param {number} indent
 * @returns {string}
 */
export function formatHexColonWrapped(hex, maxLineChars, indent) {
    if (hex.length % 2 !== 0) hex = "0" + hex;
    const colonHex = hex.replace(/(..)/g, "$1:");
    const trimmed = colonHex.slice(0, -1);
    const lines = [];
    for (let i = 0; i < trimmed.length; i += maxLineChars) {
        lines.push(trimmed.substring(i, i + maxLineChars));
    }
    const pad = " ".repeat(indent);
    return lines.join("\n" + pad);
}


// ----- SAN / GeneralName formatting -----------------------------------------

/**
 * Format a single ASN.1 GeneralName (from `@peculiar/asn1-x509`).  The
 * `flavor` arg controls the punctuation: "csr" produces "KEY: value" (with
 * a space), "crl" produces "KEY:value" (no space and slightly different
 * label set).
 *
 * @param {object} gn - An asn1-x509 GeneralName instance.
 * @param {"csr"|"crl"} flavor
 * @returns {string}
 */
export function formatGeneralName(gn, flavor) {
    const sep = flavor === "crl" ? ":" : ": ";
    if (gn.dNSName !== undefined) return `DNS${sep}${gn.dNSName}`;
    if (gn.iPAddress !== undefined) return `IP${sep}${gn.iPAddress}`;
    if (gn.rfc822Name !== undefined) return `EMAIL${sep}${gn.rfc822Name}`;
    if (gn.uniformResourceIdentifier !== undefined) return `URI${sep}${gn.uniformResourceIdentifier}`;
    if (gn.directoryName !== undefined) {
        return `DIR${sep}${jsonNameToSlashString(asnNameToJson(gn.directoryName))}`;
    }
    if (gn.registeredID !== undefined) return `ID${sep}${gn.registeredID}`;
    if (gn.otherName !== undefined) {
        const value = otherNameValueToString(gn.otherName);
        const label = flavor === "crl" ? "OtherName" : "Other";
        return `${label}${sep}${gn.otherName.typeId}::${value}`;
    }
    return `(unsupported general name)`;
}

/**
 * Attempt to extract a printable string from an OtherName's ANY-typed value.
 *
 * @param {{typeId: string, value: ArrayBuffer}} otherName
 * @returns {string}
 */
function otherNameValueToString(otherName) {
    const bytes = new Uint8Array(otherName.value);
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const parsed = fromBER(ab);
    if (parsed.offset === -1) return bytesToHex(bytes);
    const node = parsed.result;
    if (node instanceof Utf8String || node instanceof BmpString ||
        node instanceof PrintableString || node instanceof IA5String) {
        return node.valueBlock.value;
    }
    try {
        const ds = AsnParser.parse(bytes, DirectoryString);
        return ds.toString();
    } catch { /* fall through */ }
    return bytesToHex(bytes);
}

/**
 * Convert an asn1-x509 Name (CHOICE { RDNSequence }) into the JsonName
 * representation used by `formatJsonName` / `jsonNameToSlashString`.  Uses
 * the same field-name vocabulary as peculiar/x509's `Name.toJSON()`.
 *
 * @param {object} asnName
 * @returns {Array<Record<string, string[]>>}
 */
export function asnNameToJson(asnName) {
    const out = [];
    if (!asnName || typeof asnName[Symbol.iterator] !== "function") return out;
    for (const rdn of asnName) {
        const obj = {};
        for (const atv of rdn) {
            const key = OID_TO_SHORT_NAME[atv.type] || atv.type;
            const val = atv.value.toString();
            if (!obj[key]) obj[key] = [];
            obj[key].push(val);
        }
        out.push(obj);
    }
    return out;
}


// ----- byte helpers ---------------------------------------------------------

/**
 * Convert a Uint8Array to a lowercase hex string.
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function bytesToHex(bytes) {
    let out = "";
    for (const b of bytes) out += b.toString(16).padStart(2, "0");
    return out;
}

/**
 * Strip a single leading 0x00 byte from a buffer when it's only present to
 * keep a DER INTEGER positive (i.e. the next byte's MSB is set).
 *
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
export function stripDerLeadingZero(bytes) {
    if (bytes.length > 1 && bytes[0] === 0 && (bytes[1] & 0x80)) {
        return bytes.slice(1);
    }
    return bytes;
}

/**
 * Read a BER/DER length octet sequence.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {{value: number, next: number}}
 */
function readDerLength(bytes, offset) {
    const first = bytes[offset];
    if (first < 0x80) return { value: first, next: offset + 1 };
    const n = first & 0x7f;
    let value = 0;
    for (let i = 0; i < n; i++) value = (value << 8) | bytes[offset + 1 + i];
    return { value, next: offset + 1 + n };
}

/**
 * Parse the DSS-Parms (p, q, g) SEQUENCE from a DSA algorithm parameters
 * blob.
 *
 * @param {Uint8Array} bytes
 * @returns {{p: Uint8Array, q: Uint8Array, g: Uint8Array}}
 */
function parseDssParms(bytes) {
    const parsed = fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (parsed.offset === -1) throw new OperationError("Invalid DSS-Parms");
    const items = parsed.result.valueBlock && parsed.result.valueBlock.value;
    if (!items || items.length < 3) throw new OperationError("Malformed DSS-Parms");
    return {
        p: extractIntegerBytes(items[0]),
        q: extractIntegerBytes(items[1]),
        g: extractIntegerBytes(items[2]),
    };
}

/**
 * Decode an INTEGER wrapped in a BIT STRING (used for DSA subjectPublicKey).
 *
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function parseIntegerBitStringBytes(bytes) {
    const parsed = fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (parsed.offset === -1) throw new OperationError("Invalid INTEGER in SPKI");
    return extractIntegerBytes(parsed.result);
}

/**
 * Pull the raw INTEGER bytes out of an asn1js Integer node (preserving the
 * DER 2's-complement leading 00 — callers strip it if they need a magnitude).
 *
 * @param {object} node
 * @returns {Uint8Array}
 */
function extractIntegerBytes(node) {
    const view = node.valueBlock && node.valueBlock.valueHexView;
    if (!view) throw new OperationError("Missing INTEGER value");
    return new Uint8Array(view);
}
