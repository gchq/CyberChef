/**
 * Asymmetric key conversion helpers built on @peculiar/asn1-* and asn1js.
 *
 * Shared by the PEM to JWK / JWK to PEM / Public Key from Private Key
 * operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import { AsnParser, AsnSerializer, OctetString } from "@peculiar/asn1-schema";
import * as rsaSchemas from "@peculiar/asn1-rsa";
import { PrivateKeyInfo } from "@peculiar/asn1-pkcs8";
import { AlgorithmIdentifier, SubjectPublicKeyInfo } from "@peculiar/asn1-x509";
import { Sequence, Integer, fromBER } from "asn1js";
import OperationError from "../errors/OperationError.mjs";
import {
    getCurveByName,
    loadEcKey,
    publicKeyToSpkiPem,
    privateKeyToPkcs8Pem,
} from "./Ecdsa.mjs";

const { RSAPrivateKey, RSAPublicKey } = rsaSchemas;
const ID_RSA_ENCRYPTION = rsaSchemas.id_rsaEncryption;
const ID_DSA = "1.2.840.10040.4.1";

// DER NULL — used as the `parameters` field of the rsaEncryption algorithm
// identifier in RSA SPKI/PKCS#8 envelopes.
const DER_NULL = new Uint8Array([0x05, 0x00]).buffer;

const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";


// ----- public API -----------------------------------------------------------

/**
 * Parse a PEM-encoded asymmetric key blob.  Recognised labels are
 * `RSA PRIVATE KEY`, `RSA PUBLIC KEY`, `DSA PRIVATE KEY`, `EC PRIVATE KEY`,
 * `PRIVATE KEY` (PKCS#8) and `PUBLIC KEY` (SPKI).
 *
 * @param {string} pem
 * @returns {object}
 */
export function parseKeyPem(pem) {
    const { label, bytes } = pemToDer(pem);
    switch (label) {
        case "RSA PRIVATE KEY":
            return rsaPrivateFromBytes(parseRsaPrivateKey(bytes));
        case "RSA PUBLIC KEY":
            return rsaPublicFromBytes(parseRsaPublicKey(bytes));
        case "EC PRIVATE KEY":
            return ecInfoFromLoad(loadEcKey(pem));
        case "DSA PRIVATE KEY":
            return parseDsaTraditional(bytes);
        case "PRIVATE KEY":
            return parsePkcs8(bytes);
        case "PUBLIC KEY":
            return parseSpki(bytes);
        default:
            throw new OperationError(`Unsupported PEM label: '${label}'`);
    }
}

/**
 * Parse a single X.509 certificate PEM and return the normalised public key
 * info of its subject.
 *
 * @param {string} certPem
 * @returns {object}
 */
export function parseCertPublicKey(certPem) {
    const { bytes } = pemToDer(certPem);
    // Certificate ::= SEQUENCE { tbsCertificate ::= SEQUENCE { version?, serial,
    //   sigAlg, issuer, validity, subject, spki, ... }, ... }
    const parsed = fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (parsed.offset === -1) throw new OperationError("Invalid certificate DER");
    const cert = parsed.result;
    const tbs = cert.valueBlock.value[0];
    if (!tbs) throw new OperationError("Certificate is missing TBSCertificate");

    let idx = 0;
    const first = tbs.valueBlock.value[0];
    // Skip explicit [0] version tag if present
    if (first && first.idBlock && first.idBlock.tagClass === 3 && first.idBlock.tagNumber === 0) {
        idx = 1;
    }
    // tbs layout: [version?] serial sigAlg issuer validity subject spki ...
    const spkiNode = tbs.valueBlock.value[idx + 5];
    if (!spkiNode) throw new OperationError("Could not locate SubjectPublicKeyInfo in certificate");

    const spkiBytes = derOf(spkiNode);
    return parseSpki(spkiBytes);
}

/**
 * Convert normalised key info to a JWK object (built in the canonical
 * field order so `JSON.stringify` emits a deterministic string).
 *
 * @param {object} info
 * @returns {object}
 */
export function keyToJwk(info) {
    switch (info.kty) {
        case "RSA": {
            const jwk = { kty: "RSA", n: b64url(info.n), e: b64url(info.e) };
            if (info.isPrivate) {
                jwk.d = b64url(info.d);
                jwk.p = b64url(info.p);
                jwk.q = b64url(info.q);
                jwk.dp = b64url(info.dp);
                jwk.dq = b64url(info.dq);
                jwk.qi = b64url(info.qi);
            }
            return jwk;
        }
        case "EC": {
            const jwk = {
                kty: "EC",
                crv: info.curveName,
                x: b64url(info.x),
                y: b64url(info.y),
            };
            if (info.isPrivate) jwk.d = b64url(info.d);
            return jwk;
        }
        default:
            throw new OperationError(`Cannot build JWK for key type '${info.kty}'`);
    }
}

/**
 * Build a normalised key info object from a JWK.
 *
 * @param {object} jwk
 * @returns {object}
 */
export function keyFromJwk(jwk) {
    if (!jwk || typeof jwk !== "object" || typeof jwk.kty !== "string") {
        throw new OperationError("Invalid JWK format");
    }

    if (jwk.kty === "RSA") {
        if (typeof jwk.n !== "string" || typeof jwk.e !== "string") {
            throw new OperationError("RSA JWK is missing required fields");
        }
        const info = {
            kty: "RSA",
            isPrivate: typeof jwk.d === "string",
            n: b64urlToBytes(jwk.n),
            e: b64urlToBytes(jwk.e),
        };
        if (info.isPrivate) {
            if (
                typeof jwk.d !== "string" || typeof jwk.p !== "string" ||
                typeof jwk.q !== "string" || typeof jwk.dp !== "string" ||
                typeof jwk.dq !== "string" || typeof jwk.qi !== "string"
            ) {
                throw new OperationError("RSA private JWK is missing CRT components");
            }
            info.d = b64urlToBytes(jwk.d);
            info.p = b64urlToBytes(jwk.p);
            info.q = b64urlToBytes(jwk.q);
            info.dp = b64urlToBytes(jwk.dp);
            info.dq = b64urlToBytes(jwk.dq);
            info.qi = b64urlToBytes(jwk.qi);
        }
        return info;
    }

    if (jwk.kty === "EC") {
        if (typeof jwk.crv !== "string" || typeof jwk.x !== "string" || typeof jwk.y !== "string") {
            throw new OperationError("EC JWK is missing required fields");
        }
        const curve = getCurveByName(jwk.crv);
        const x = b64urlToBytes(jwk.x);
        const y = b64urlToBytes(jwk.y);
        if (x.length !== curve.byteLen || y.length !== curve.byteLen) {
            throw new OperationError(`EC JWK coords have wrong length for curve ${jwk.crv}`);
        }
        const publicKey = new Uint8Array(1 + 2 * curve.byteLen);
        publicKey[0] = 0x04;
        publicKey.set(x, 1);
        publicKey.set(y, 1 + curve.byteLen);
        const info = {
            kty: "EC",
            curveName: jwk.crv,
            byteLen: curve.byteLen,
            isPrivate: typeof jwk.d === "string",
            isPublic: typeof jwk.d !== "string",
            publicKey,
            x,
            y,
        };
        if (info.isPrivate) {
            const d = b64urlToBytes(jwk.d);
            if (d.length !== curve.byteLen) {
                throw new OperationError(`EC JWK 'd' has wrong length for curve ${jwk.crv}`);
            }
            info.d = d;
        } else {
            info.d = null;
        }
        return info;
    }

    throw new OperationError(`Unsupported JWK key type '${jwk.kty}'`);
}

/**
 * Encode normalised key info as a PEM blob.  Private keys come out as
 * PKCS#8; public keys come out as SPKI.  Both use LF line endings.
 *
 * @param {object} info
 * @returns {string}
 */
export function keyInfoToPem(info) {
    if (info.kty === "RSA") {
        return info.isPrivate ? rsaPkcs8Pem(info) : rsaSpkiPem(info);
    }
    if (info.kty === "EC") {
        return info.isPrivate ? privateKeyToPkcs8Pem(info) : publicKeyToSpkiPem(info);
    }
    if (info.kty === "DSA") {
        if (!info.isPrivate) return dsaSpkiPem(info);
        throw new OperationError("Building DSA private-key PEMs is not supported");
    }
    throw new OperationError(`Cannot serialise key of type '${info.kty}'`);
}

/**
 * Derive the public-key info from a private-key info.  RSA keeps `n`/`e`,
 * EC re-derives `(x,y)` via the curve, DSA keeps `(p,q,g,y)`.
 *
 * @param {object} info
 * @returns {object}
 */
export function derivePublicKeyInfo(info) {
    if (!info.isPrivate) return info;
    if (info.kty === "RSA") {
        return { kty: "RSA", isPrivate: false, n: info.n, e: info.e };
    }
    if (info.kty === "EC") {
        const curve = getCurveByName(info.curveName);
        return {
            kty: "EC",
            curveName: info.curveName,
            byteLen: curve.byteLen,
            isPrivate: false,
            isPublic: true,
            d: null,
            publicKey: info.publicKey,
            x: info.x,
            y: info.y,
        };
    }
    if (info.kty === "DSA") {
        if (!info.y) {
            throw new OperationError(`DSA Private Key in PKCS#8 is not supported`);
        }
        return {
            kty: "DSA",
            isPrivate: false,
            p: info.p,
            q: info.q,
            g: info.g,
            y: info.y,
        };
    }
    throw new OperationError(`Unsupported key type: ${info.kty}`);
}


// ----- format-specific decoding ---------------------------------------------

/**
 * Decode a PKCS#1 RSAPrivateKey blob.
 *
 * @param {Uint8Array} bytes
 * @returns {RSAPrivateKey}
 */
function parseRsaPrivateKey(bytes) {
    try {
        return AsnParser.parse(bytes, RSAPrivateKey);
    } catch (e) {
        throw new OperationError(`Could not parse RSA private key: ${e.message}`);
    }
}

/**
 * Decode a PKCS#1 RSAPublicKey blob.
 *
 * @param {Uint8Array} bytes
 * @returns {RSAPublicKey}
 */
function parseRsaPublicKey(bytes) {
    try {
        return AsnParser.parse(bytes, RSAPublicKey);
    } catch (e) {
        throw new OperationError(`Could not parse RSA public key: ${e.message}`);
    }
}

/**
 * Build the normalised info object for an RSA private key.
 *
 * @param {RSAPrivateKey} rsa
 * @returns {object}
 */
function rsaPrivateFromBytes(rsa) {
    return {
        kty: "RSA",
        isPrivate: true,
        n: stripLeadingZero(abufToBytes(rsa.modulus)),
        e: stripLeadingZero(abufToBytes(rsa.publicExponent)),
        d: stripLeadingZero(abufToBytes(rsa.privateExponent)),
        p: stripLeadingZero(abufToBytes(rsa.prime1)),
        q: stripLeadingZero(abufToBytes(rsa.prime2)),
        dp: stripLeadingZero(abufToBytes(rsa.exponent1)),
        dq: stripLeadingZero(abufToBytes(rsa.exponent2)),
        qi: stripLeadingZero(abufToBytes(rsa.coefficient)),
    };
}

/**
 * Build the normalised info object for an RSA public key.
 *
 * @param {RSAPublicKey} rsa
 * @returns {object}
 */
function rsaPublicFromBytes(rsa) {
    return {
        kty: "RSA",
        isPrivate: false,
        n: stripLeadingZero(abufToBytes(rsa.modulus)),
        e: stripLeadingZero(abufToBytes(rsa.publicExponent)),
    };
}

/**
 * Reshape an `loadEcKey` return value to the normalised format used here
 * (adds the `kty` field).
 *
 * @param {object} ecInfo
 * @returns {object}
 */
function ecInfoFromLoad(ecInfo) {
    return { kty: "EC", ...ecInfo };
}

/**
 * Decode a PKCS#8 blob.  Dispatches on the algorithm OID to the
 * RSA/EC parsers.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parsePkcs8(bytes) {
    let info;
    try {
        info = AsnParser.parse(bytes, PrivateKeyInfo);
    } catch (e) {
        throw new OperationError(`Could not parse PKCS#8 key: ${e.message}`);
    }
    const alg = info.privateKeyAlgorithm.algorithm;
    if (alg === ID_RSA_ENCRYPTION) {
        const inner = abufToBytes(info.privateKey.buffer);
        return rsaPrivateFromBytes(parseRsaPrivateKey(inner));
    }
    if (alg === ID_DSA) {
        // DSA PKCS#8 carries only x (with p/q/g in the algorithm
        // parameters). Without y, deriving the public key is unsupported;
        // mark the info accordingly and let derivePublicKeyInfo throw.
        return { kty: "DSA", isPrivate: true, y: null };
    }
    // EC and everything else delegate to the existing EC loader by
    // re-wrapping the bytes as a PKCS#8 PEM.  loadEcKey will surface its
    // own "not an EC key" error for unsupported algorithms.
    return ecInfoFromLoad(loadEcKey(derToPem(bytes, "PRIVATE KEY")));
}

/**
 * Decode a SubjectPublicKeyInfo blob.  Dispatches on the algorithm OID.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parseSpki(bytes) {
    let spki;
    try {
        spki = AsnParser.parse(bytes, SubjectPublicKeyInfo);
    } catch (e) {
        throw new OperationError(`Could not parse SubjectPublicKeyInfo: ${e.message}`);
    }
    const alg = spki.algorithm.algorithm;
    if (alg === ID_RSA_ENCRYPTION) {
        return rsaPublicFromBytes(parseRsaPublicKey(abufToBytes(spki.subjectPublicKey)));
    }
    if (alg === ID_DSA) {
        if (!spki.algorithm.parameters) {
            throw new OperationError("DSA SubjectPublicKeyInfo is missing DSS-Parms");
        }
        const { p, q, g } = parseDssParms(abufToBytes(spki.algorithm.parameters));
        const y = parseIntegerBitString(abufToBytes(spki.subjectPublicKey));
        return { kty: "DSA", isPrivate: false, p, q, g, y };
    }
    return ecInfoFromLoad(loadEcKey(derToPem(bytes, "PUBLIC KEY")));
}

/**
 * Decode a traditional OpenSSL DSAPrivateKey blob.
 *
 * @param {Uint8Array} bytes
 * @returns {object}
 */
function parseDsaTraditional(bytes) {
    const parsed = fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (parsed.offset === -1) throw new OperationError("Invalid DSA private key DER");
    const seq = parsed.result;
    const items = seq.valueBlock && seq.valueBlock.value;
    if (!items || items.length < 6) throw new OperationError("Malformed DSA private key");
    return {
        kty: "DSA",
        isPrivate: true,
        p: extractIntegerBytes(items[1]),
        q: extractIntegerBytes(items[2]),
        g: extractIntegerBytes(items[3]),
        y: extractIntegerBytes(items[4]),
        x: extractIntegerBytes(items[5]),
    };
}

/**
 * Decode the DSS-Parms (p, q, g) SEQUENCE from a DSA algorithm parameters
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
function parseIntegerBitString(bytes) {
    const parsed = fromBER(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (parsed.offset === -1) throw new OperationError("Invalid INTEGER in SPKI");
    return extractIntegerBytes(parsed.result);
}

/**
 * Pull the raw INTEGER bytes out of an asn1js Integer node (without the
 * DER 2's-complement leading 00 when present).
 *
 * @param {Object} node
 * @returns {Uint8Array}
 */
function extractIntegerBytes(node) {
    const view = node.valueBlock && node.valueBlock.valueHexView;
    if (!view) throw new OperationError("Missing INTEGER value");
    return stripLeadingZero(new Uint8Array(view));
}


// ----- format-specific encoding ---------------------------------------------

/**
 * Encode an RSA private-key info object as a PKCS#8 PEM.
 *
 * @param {object} info
 * @returns {string}
 */
function rsaPkcs8Pem(info) {
    const rsa = new RSAPrivateKey({
        version: 0,
        modulus: bytesToAbuf(prefixForDerInt(info.n)),
        publicExponent: bytesToAbuf(prefixForDerInt(info.e)),
        privateExponent: bytesToAbuf(prefixForDerInt(info.d)),
        prime1: bytesToAbuf(prefixForDerInt(info.p)),
        prime2: bytesToAbuf(prefixForDerInt(info.q)),
        exponent1: bytesToAbuf(prefixForDerInt(info.dp)),
        exponent2: bytesToAbuf(prefixForDerInt(info.dq)),
        coefficient: bytesToAbuf(prefixForDerInt(info.qi)),
    });
    const pkcs8 = new PrivateKeyInfo({
        version: 0,
        privateKeyAlgorithm: new AlgorithmIdentifier({
            algorithm: ID_RSA_ENCRYPTION,
            parameters: DER_NULL,
        }),
        privateKey: new OctetString(AsnSerializer.serialize(rsa)),
    });
    return derToPem(new Uint8Array(AsnSerializer.serialize(pkcs8)), "PRIVATE KEY");
}

/**
 * Encode an RSA public-key info object as an SPKI PEM.
 *
 * @param {object} info
 * @returns {string}
 */
function rsaSpkiPem(info) {
    const rsa = new RSAPublicKey({
        modulus: bytesToAbuf(prefixForDerInt(info.n)),
        publicExponent: bytesToAbuf(prefixForDerInt(info.e)),
    });
    const spki = new SubjectPublicKeyInfo({
        algorithm: new AlgorithmIdentifier({
            algorithm: ID_RSA_ENCRYPTION,
            parameters: DER_NULL,
        }),
        subjectPublicKey: AsnSerializer.serialize(rsa),
    });
    return derToPem(new Uint8Array(AsnSerializer.serialize(spki)), "PUBLIC KEY");
}

/**
 * Encode a DSA public-key info object as an SPKI PEM.
 *
 * @param {object} info
 * @returns {string}
 */
function dsaSpkiPem(info) {
    const params = buildDssParms(info.p, info.q, info.g);
    const innerY = buildDerInteger(info.y);
    const spki = new SubjectPublicKeyInfo({
        algorithm: new AlgorithmIdentifier({
            algorithm: ID_DSA,
            parameters: params,
        }),
        subjectPublicKey: innerY,
    });
    return derToPem(new Uint8Array(AsnSerializer.serialize(spki)), "PUBLIC KEY");
}

/**
 * Build the DER encoding of an INTEGER from its raw magnitude bytes.
 *
 * @param {Uint8Array} bytes
 * @returns {ArrayBuffer}
 */
function buildDerInteger(bytes) {
    const node = new Integer({ valueHex: prefixForDerInt(bytes) });
    return node.toBER(false);
}

/**
 * Build the DER encoding of DSS-Parms (SEQUENCE { p, q, g }).
 *
 * @param {Uint8Array} p
 * @param {Uint8Array} q
 * @param {Uint8Array} g
 * @returns {ArrayBuffer}
 */
function buildDssParms(p, q, g) {
    const seq = new Sequence({
        value: [
            new Integer({ valueHex: prefixForDerInt(p) }),
            new Integer({ valueHex: prefixForDerInt(q) }),
            new Integer({ valueHex: prefixForDerInt(g) }),
        ],
    });
    return seq.toBER(false);
}


// ----- byte/PEM utilities ---------------------------------------------------

/**
 * Decode a PEM blob to its raw DER bytes and label.
 *
 * @param {string} pem
 * @returns {{label: string, bytes: Uint8Array}}
 */
export function pemToDer(pem) {
    const match = pem.match(/-----BEGIN ([A-Z0-9 ]+)-----([\s\S]+?)-----END \1-----/);
    if (!match) throw new OperationError("Not a valid PEM blob");
    const body = match[2].replace(/\s+/g, "");
    let bin;
    if (typeof Buffer !== "undefined") {
        bin = Buffer.from(body, "base64");
    } else {
        const decoded = atob(body);
        bin = new Uint8Array(decoded.length);
        for (let i = 0; i < decoded.length; i++) bin[i] = decoded.charCodeAt(i);
    }
    return {
        label: match[1],
        bytes: new Uint8Array(bin.buffer || bin, bin.byteOffset || 0, bin.byteLength || bin.length),
    };
}

/**
 * Wrap raw DER bytes in a PEM envelope with LF line endings.
 *
 * @param {Uint8Array} bytes
 * @param {string} label
 * @returns {string}
 */
export function derToPem(bytes, label) {
    let b64;
    if (typeof Buffer !== "undefined") {
        b64 = Buffer.from(bytes).toString("base64");
    } else {
        let bin = "";
        for (const b of bytes) bin += String.fromCharCode(b);
        b64 = btoa(bin);
    }
    const lines = b64.match(/.{1,64}/g) || [""];
    return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

/**
 * Encode a byte array as base64url (no padding).
 *
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function b64url(bytes) {
    if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
    let out = "";
    let i = 0;
    while (i < bytes.length) {
        const b1 = bytes[i++];
        const b2 = i < bytes.length ? bytes[i++] : -1;
        const b3 = i < bytes.length ? bytes[i++] : -1;
        out += BASE64URL_ALPHABET[b1 >> 2];
        out += BASE64URL_ALPHABET[((b1 & 0x03) << 4) | (b2 < 0 ? 0 : (b2 >> 4))];
        if (b2 < 0) break;
        out += BASE64URL_ALPHABET[((b2 & 0x0f) << 2) | (b3 < 0 ? 0 : (b3 >> 6))];
        if (b3 < 0) break;
        out += BASE64URL_ALPHABET[b3 & 0x3f];
    }
    return out;
}

/**
 * Decode a base64url-encoded string to bytes.  Strips standard base64
 * padding if present.
 *
 * @param {string} str
 * @returns {Uint8Array}
 */
export function b64urlToBytes(str) {
    const cleaned = str.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
    const pad = cleaned.length % 4 === 0 ? "" : "=".repeat(4 - (cleaned.length % 4));
    const padded = cleaned + pad;
    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(padded, "base64"));
    }
    const bin = atob(padded);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

/**
 * Strip a single leading 0x00 byte from a buffer when it's only present
 * to keep a DER INTEGER positive (i.e. the next byte's MSB is set).
 *
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function stripLeadingZero(bytes) {
    if (bytes.length > 1 && bytes[0] === 0 && (bytes[1] & 0x80)) {
        return bytes.slice(1);
    }
    return bytes;
}

/**
 * Add a leading 0x00 byte to a buffer when its MSB is set, so it survives
 * round-tripping through a DER INTEGER without being interpreted as a
 * negative value.
 *
 * @param {Uint8Array} bytes
 * @returns {Uint8Array}
 */
function prefixForDerInt(bytes) {
    if (bytes.length === 0) return new Uint8Array([0]);
    if (bytes[0] & 0x80) {
        const out = new Uint8Array(bytes.length + 1);
        out.set(bytes, 1);
        return out;
    }
    return bytes;
}

/**
 * Convert an ArrayBuffer / Uint8Array / typed view to a Uint8Array.
 *
 * @param {ArrayBuffer|ArrayBufferView} abuf
 * @returns {Uint8Array}
 */
function abufToBytes(abuf) {
    if (abuf instanceof Uint8Array) return abuf;
    if (ArrayBuffer.isView(abuf)) return new Uint8Array(abuf.buffer, abuf.byteOffset, abuf.byteLength);
    return new Uint8Array(abuf);
}

/**
 * Wrap a Uint8Array in a freshly allocated ArrayBuffer.
 *
 * @param {Uint8Array} bytes
 * @returns {ArrayBuffer}
 */
function bytesToAbuf(bytes) {
    const copy = new Uint8Array(bytes);
    return copy.buffer;
}

/**
 * Re-serialise a parsed asn1js node to its DER bytes.
 *
 * @param {Object} node
 * @returns {Uint8Array}
 */
function derOf(node) {
    return new Uint8Array(node.toBER(false));
}
