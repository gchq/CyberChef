/**
 * Shared ECDSA helpers built on @noble/curves and @peculiar/asn1-*.
 *
 * Used by the ECDSA Sign/Verify/Signature Conversion/Generate Key Pair
 * operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { p256, p384, p521 } from "@noble/curves/nist.js";
import { DER } from "@noble/curves/abstract/weierstrass.js";
import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { AsnParser, AsnSerializer, OctetString } from "@peculiar/asn1-schema";
import { derBytesToPem } from "./Asn1.mjs";
import * as ecc from "@peculiar/asn1-ecc";
const { ECPrivateKey, ECParameters } = ecc;
const ID_EC_PUBLIC_KEY = ecc.id_ecPublicKey;
const ID_SECP256R1 = ecc.id_secp256r1;
const ID_SECP384R1 = ecc.id_secp384r1;
const ID_SECP521R1 = ecc.id_secp521r1;
import { PrivateKeyInfo } from "@peculiar/asn1-pkcs8";
import { AlgorithmIdentifier, SubjectPublicKeyInfo } from "@peculiar/asn1-x509";
import { fromBER } from "asn1js";
import OperationError from "../errors/OperationError.mjs";

const CURVES = {
    "P-256": { oid: ID_SECP256R1, curve: p256, byteLen: 32 },
    "P-384": { oid: ID_SECP384R1, curve: p384, byteLen: 48 },
    "P-521": { oid: ID_SECP521R1, curve: p521, byteLen: 66 },
};

const OID_TO_CURVE = {
    [ID_SECP256R1]: "P-256",
    [ID_SECP384R1]: "P-384",
    [ID_SECP521R1]: "P-521",
};

const HASHES = {
    "MD5":     md5,
    "SHA-1":   sha1,
    "SHA-256": sha256,
    "SHA-384": sha384,
    "SHA-512": sha512,
};

/**
 * Return the @noble/curves ECDSA instance for a curve name.
 *
 * @param {string} name - One of "P-256", "P-384", "P-521".
 * @returns {{oid: string, curve: object, byteLen: number, name: string}}
 */
export function getCurveByName(name) {
    const entry = CURVES[name];
    if (!entry) throw new OperationError(`Unsupported curve: ${name}`);
    return { ...entry, name };
}

/**
 * Hash a byte string with one of the supported digests.
 *
 * @param {string} algo - "MD5", "SHA-1", "SHA-256", "SHA-384" or "SHA-512".
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
export function digestBytes(algo, bytes) {
    const fn = HASHES[algo];
    if (!fn) throw new OperationError(`Unsupported digest: ${algo}`);
    return fn(bytes);
}

/**
 * Convert a JS string to bytes by Latin-1 truncation of each code unit (i.e.
 * `charCodeAt(i) & 0xff`). This preserves the operation's byte-string
 * semantics for inputs coming out of upstream byte-producing ops, including
 * the questionable UTF-16 truncation for free-text inputs.
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function strToBytesLatin1(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
}

/**
 * Parse a PEM-encoded EC key (SEC1, PKCS#8 or SPKI).
 *
 * @param {string} pem
 * @returns {{
 *   curveName: string,
 *   curve: object,
 *   byteLen: number,
 *   isPrivate: boolean,
 *   isPublic: boolean,
 *   d: Uint8Array|null,
 *   publicKey: Uint8Array
 * }}
 */
export function loadEcKey(pem) {
    const { label, bytes } = pemToDer(pem);

    if (label === "EC PRIVATE KEY") {
        return parseSec1PrivateKey(bytes);
    }
    if (label === "PRIVATE KEY") {
        return parsePkcs8PrivateKey(bytes);
    }
    if (label === "PUBLIC KEY") {
        return parseSpkiPublicKey(bytes);
    }
    if (label === "RSA PRIVATE KEY" || label === "RSA PUBLIC KEY") {
        throw new OperationError("Provided key is not an EC key.");
    }
    throw new OperationError("Provided key is not an EC key.");
}

/**
 * Sign a digest with an EC private key.
 *
 * @param {object} keyInfo - Output of {@link loadEcKey}.
 * @param {Uint8Array} digest
 * @returns {string} ASN.1 DER signature, hex-encoded.
 */
export function signEcdsa(keyInfo, digest) {
    if (!keyInfo.isPrivate || !keyInfo.d) {
        throw new OperationError("Provided key is not a private key.");
    }
    const sig = keyInfo.curve.sign(digest, keyInfo.d, {
        prehash: false,
        lowS: false,
        format: "der",
    });
    return bytesToHex(sig);
}

/**
 * Verify a DER-encoded ECDSA signature against a digest and public key.
 *
 * @param {object} keyInfo - Output of {@link loadEcKey}.
 * @param {Uint8Array} digest
 * @param {string} asn1Hex - DER signature, hex-encoded.
 * @returns {boolean}
 */
export function verifyEcdsa(keyInfo, digest, asn1Hex) {
    if (!keyInfo.isPublic) {
        throw new OperationError("Provided key is not a public key.");
    }
    try {
        return keyInfo.curve.verify(hexToBytes(asn1Hex), digest, keyInfo.publicKey, {
            prehash: false,
            lowS: false,
            format: "der",
        });
    } catch {
        return false;
    }
}

/**
 * Quick test for whether a hex string parses as a single DER-encoded ASN.1
 * value.
 *
 * @param {string} hex
 * @returns {boolean}
 */
export function isAsn1Hex(hex) {
    if (typeof hex !== "string" || hex.length === 0 || hex.length % 2 !== 0) return false;
    if (!/^[0-9a-f]+$/i.test(hex)) return false;
    const bytes = hexToBytes(hex);
    try {
        const result = fromBER(bytes.buffer);
        return result.offset !== -1;
    } catch {
        return false;
    }
}

/**
 * Parse an ASN.1 DER-encoded ECDSA signature and return the raw r/s INTEGER
 * bytes as hex. Preserves the DER 2's-complement leading 0x00 when present
 * (i.e. r/s may have a leading "00" pair) because the raw-signature fixtures
 * assert the INTEGER byte strings, not canonicalized scalar values.
 *
 * @param {string} asn1Hex
 * @returns {{r: string, s: string}}
 */
export function parseAsn1SigToHexRS(asn1Hex) {
    const bytes = hexToBytes(asn1Hex);
    let i = 0;
    if (bytes[i++] !== 0x30) throw new OperationError("Signature is not an ASN.1 SEQUENCE");
    const seq = readLength(bytes, i);
    i = seq.next;
    if (i + seq.value !== bytes.length) throw new OperationError("Trailing bytes after SEQUENCE");

    if (bytes[i++] !== 0x02) throw new OperationError("First element is not an INTEGER");
    const rLen = readLength(bytes, i);
    i = rLen.next;
    const r = bytes.slice(i, i + rLen.value);
    i += rLen.value;

    if (bytes[i++] !== 0x02) throw new OperationError("Second element is not an INTEGER");
    const sLen = readLength(bytes, i);
    i = sLen.next;
    const s = bytes.slice(i, i + sLen.value);

    return { r: bytesToHex(r), s: bytesToHex(s) };
}

/**
 * Convert hex r/s pair to a DER-encoded ECDSA signature hex string.
 *
 * @param {string} rHex
 * @param {string} sHex
 * @returns {string}
 */
export function hexRSToAsn1Sig(rHex, sHex) {
    const r = BigInt("0x" + rHex);
    const s = BigInt("0x" + sHex);
    return DER.hexFromSig({ r, s });
}

/**
 * Convert a DER-encoded ECDSA signature (hex) to the P1363 / IEEE concat
 * form (r || s, each fixed-width). The signature's curve is inferred from
 * the integer sizes — supports P-256/P-384/P-521.
 *
 * @param {string} asn1Hex
 * @returns {string}
 */
export function asn1SigToConcatHex(asn1Hex) {
    const { r, s } = parseAsn1SigToHexRS(asn1Hex);
    const rStripped = stripDerLeadingZero(r);
    const sStripped = stripDerLeadingZero(s);
    const maxBytes = Math.max(rStripped.length, sStripped.length) / 2;

    let coordBytes;
    if (maxBytes <= 32) coordBytes = 32;
    else if (maxBytes <= 48) coordBytes = 48;
    else if (maxBytes <= 66) coordBytes = 66;
    else throw new OperationError(`Unsupported ECDSA signature size (${maxBytes} bytes per component)`);

    const width = coordBytes * 2;
    return rStripped.padStart(width, "0") + sStripped.padStart(width, "0");
}

/**
 * Convert a concat (P1363) ECDSA signature hex back to ASN.1 DER hex.
 *
 * @param {string} concatHex
 * @returns {string}
 */
export function concatHexToAsn1Sig(concatHex) {
    if (concatHex.length % 4 !== 0) {
        throw new OperationError("Concat signature length must be a multiple of 4 hex chars");
    }
    const half = concatHex.length / 2;
    return hexRSToAsn1Sig(concatHex.slice(0, half), concatHex.slice(half));
}

/**
 * Generate an EC key pair on the named curve.
 *
 * @param {string} curveName - "P-256", "P-384" or "P-521".
 * @returns {{
 *   curveName: string,
 *   byteLen: number,
 *   d: Uint8Array,
 *   publicKey: Uint8Array,
 *   x: Uint8Array,
 *   y: Uint8Array
 * }}
 */
export function generateEcKeyPair(curveName) {
    const info = getCurveByName(curveName);
    const { secretKey, publicKey } = info.curve.keygen();
    const { x, y } = splitUncompressedPoint(publicKey, info.byteLen);
    return {
        curveName,
        byteLen: info.byteLen,
        d: secretKey,
        publicKey,
        x,
        y,
    };
}

/**
 * Encode the public key half of a generated key pair as SPKI PEM.
 *
 * @param {object} pair - Output of {@link generateEcKeyPair}.
 * @returns {string}
 */
export function publicKeyToSpkiPem(pair) {
    const info = getCurveByName(pair.curveName);
    const params = new ECParameters({ namedCurve: info.oid });
    const spki = new SubjectPublicKeyInfo({
        algorithm: new AlgorithmIdentifier({
            algorithm: ID_EC_PUBLIC_KEY,
            parameters: AsnSerializer.serialize(params),
        }),
        subjectPublicKey: pair.publicKey.slice().buffer,
    });
    return derBytesToPem(new Uint8Array(AsnSerializer.serialize(spki)), "PUBLIC KEY");
}

/**
 * Encode the private key half of a generated key pair as PKCS#8 PEM.
 *
 * @param {object} pair - Output of {@link generateEcKeyPair}.
 * @returns {string}
 */
export function privateKeyToPkcs8Pem(pair) {
    const info = getCurveByName(pair.curveName);
    const params = new ECParameters({ namedCurve: info.oid });
    const ecKey = new ECPrivateKey({
        version: 1,
        privateKey: new OctetString(pair.d),
        publicKey: pair.publicKey.slice().buffer,
    });
    const pkcs8 = new PrivateKeyInfo({
        version: 0,
        privateKeyAlgorithm: new AlgorithmIdentifier({
            algorithm: ID_EC_PUBLIC_KEY,
            parameters: AsnSerializer.serialize(params),
        }),
        privateKey: new OctetString(AsnSerializer.serialize(ecKey)),
    });
    return derBytesToPem(new Uint8Array(AsnSerializer.serialize(pkcs8)), "PRIVATE KEY");
}


// ---- internals --------------------------------------------------------------

/**
 * Parse a PEM blob and return the decoded body bytes plus the label
 * (e.g. "EC PRIVATE KEY").
 *
 * @param {string} pem
 * @returns {{label: string, bytes: Uint8Array}}
 */
function pemToDer(pem) {
    const match = pem.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]+?)-----END \1-----/);
    if (!match) throw new OperationError("Not a valid PEM");
    const body = match[2].replace(/\s+/g, "");
    let bin;
    if (typeof Buffer !== "undefined") {
        bin = Buffer.from(body, "base64");
    } else {
        const decoded = atob(body);
        bin = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bin[i] = decoded.charCodeAt(i);
    }
    return { label: match[1], bytes: new Uint8Array(bin.buffer || bin, bin.byteOffset || 0, bin.byteLength || bin.length) };
}

/**
 * Parse a SEC1 ECPrivateKey blob.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parseSec1PrivateKey(bytes) {
    let ec;
    try {
        ec = AsnParser.parse(bytes, ECPrivateKey);
    } catch (e) {
        throw new OperationError(`Could not parse EC private key: ${e.message}`);
    }
    const curveName = curveFromParameters(ec.parameters);
    if (!curveName) throw new OperationError("EC private key missing curve parameters");
    return buildPrivateKeyInfo(curveName, ec);
}

/**
 * Parse a PKCS#8 PrivateKeyInfo blob.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parsePkcs8PrivateKey(bytes) {
    let info;
    try {
        info = AsnParser.parse(bytes, PrivateKeyInfo);
    } catch (e) {
        throw new OperationError(`Could not parse PKCS#8 key: ${e.message}`);
    }
    if (info.privateKeyAlgorithm.algorithm !== ID_EC_PUBLIC_KEY) {
        throw new OperationError("Provided key is not an EC key.");
    }
    const params = info.privateKeyAlgorithm.parameters;
    if (!params) throw new OperationError("EC private key missing curve parameters");
    const ecParams = AsnParser.parse(params, ECParameters);
    const curveName = curveFromParameters(ecParams);
    if (!curveName) throw new OperationError("Unsupported EC curve");

    const innerBytes = new Uint8Array(info.privateKey.buffer, info.privateKey.byteOffset, info.privateKey.byteLength);
    let ec;
    try {
        ec = AsnParser.parse(innerBytes, ECPrivateKey);
    } catch (e) {
        throw new OperationError(`Could not parse EC private key: ${e.message}`);
    }
    return buildPrivateKeyInfo(curveName, ec);
}

/**
 * Parse a SubjectPublicKeyInfo blob.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parseSpkiPublicKey(bytes) {
    let spki;
    try {
        spki = AsnParser.parse(bytes, SubjectPublicKeyInfo);
    } catch (e) {
        throw new OperationError(`Could not parse SPKI: ${e.message}`);
    }
    if (spki.algorithm.algorithm !== ID_EC_PUBLIC_KEY) {
        throw new OperationError("Provided key is not an EC key.");
    }
    const params = spki.algorithm.parameters;
    if (!params) throw new OperationError("EC public key missing curve parameters");
    const ecParams = AsnParser.parse(params, ECParameters);
    const curveName = curveFromParameters(ecParams);
    if (!curveName) throw new OperationError("Unsupported EC curve");
    const info = getCurveByName(curveName);

    const pub = new Uint8Array(spki.subjectPublicKey);
    if (pub[0] !== 0x04) {
        throw new OperationError("Only uncompressed EC public keys are supported");
    }
    if (pub.length !== 1 + info.byteLen * 2) {
        throw new OperationError("EC public key has the wrong length for the named curve");
    }
    const { x, y } = splitUncompressedPoint(pub, info.byteLen);
    return {
        curveName,
        curve: info.curve,
        byteLen: info.byteLen,
        isPrivate: false,
        isPublic: true,
        d: null,
        publicKey: pub,
        x,
        y,
    };
}

/**
 * Build the loadEcKey return value for a parsed ECPrivateKey.
 *
 * @param {string} curveName
 * @param {object} ec
 * @returns {object}
 */
function buildPrivateKeyInfo(curveName, ec) {
    const info = getCurveByName(curveName);
    const d = leftPadTo(
        new Uint8Array(ec.privateKey.buffer, ec.privateKey.byteOffset, ec.privateKey.byteLength),
        info.byteLen,
    );
    const publicKey = info.curve.getPublicKey(d, false);
    const { x, y } = splitUncompressedPoint(publicKey, info.byteLen);
    return {
        curveName,
        curve: info.curve,
        byteLen: info.byteLen,
        isPrivate: true,
        isPublic: false,
        d,
        publicKey,
        x,
        y,
    };
}

/**
 * Pad a byte array on the left with zeros to reach `length` bytes.
 *
 * @param {Uint8Array} bytes
 * @param {number} length
 * @returns {Uint8Array}
 */
function leftPadTo(bytes, length) {
    if (bytes.length === length) return bytes;
    if (bytes.length > length) throw new OperationError("EC scalar is longer than the curve allows");
    const out = new Uint8Array(length);
    out.set(bytes, length - bytes.length);
    return out;
}

/**
 * Map an ECParameters object's namedCurve OID to our short curve name.
 *
 * @param {object|null|undefined} ecParams
 * @returns {string|null}
 */
function curveFromParameters(ecParams) {
    if (!ecParams || !ecParams.namedCurve) return null;
    return OID_TO_CURVE[ecParams.namedCurve] || null;
}

/**
 * Split an uncompressed SEC1 point (04 || X || Y) into its X and Y bytes.
 *
 * @param {Uint8Array} pub
 * @param {number} byteLen
 * @returns {{x: Uint8Array, y: Uint8Array}}
 */
function splitUncompressedPoint(pub, byteLen) {
    return {
        x: pub.slice(1, 1 + byteLen),
        y: pub.slice(1 + byteLen, 1 + 2 * byteLen),
    };
}

/**
 * Strip a single leading "00" byte from a DER INTEGER hex if it's only there
 * to keep the value positive — i.e. when the next byte's MSB is set.
 *
 * @param {string} hex
 * @returns {string}
 */
function stripDerLeadingZero(hex) {
    if (hex.length >= 4 && hex.slice(0, 2) === "00") {
        const second = parseInt(hex.slice(2, 4), 16);
        if (second & 0x80) return hex.slice(2);
    }
    return hex;
}

/**
 * Read a BER/DER length octet sequence.
 *
 * @param {Uint8Array} bytes
 * @param {number} offset
 * @returns {{value: number, next: number}}
 */
function readLength(bytes, offset) {
    const first = bytes[offset];
    if (first < 0x80) return { value: first, next: offset + 1 };
    const n = first & 0x7f;
    let value = 0;
    for (let i = 0; i < n; i++) value = (value << 8) | bytes[offset + 1 + i];
    return { value, next: offset + 1 + n };
}

