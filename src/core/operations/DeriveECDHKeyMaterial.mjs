/**
 * @license Apache-2.0
 * @author Jacob Marks [https://jacobmarks.com]
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import r from "jsrsasign";
import { fromBase64, toBase64 } from "../lib/Base64.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * Parses a PEM or hex-encoded DER key into bytes.
 *
 * @param {string} input
 * @param {string} format
 * @param {string} pemLabel
 * @returns {Uint8Array}
 */
function parsePemOrHex(input, format, pemLabel) {
    const value = (input || "").trim();
    if (!value.length) throw new OperationError("Missing key input.");

    if (format === "PEM") {
        const normalized = value
            .replace(new RegExp(`-----BEGIN ${pemLabel}-----`, "g"), "")
            .replace(new RegExp(`-----END ${pemLabel}-----`, "g"), "")
            .replace(/\s+/g, "");
        return new Uint8Array(fromBase64(normalized, undefined, "byteArray"));
    }

    const hex = value.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0)
        throw new OperationError("Expected hex input.");

    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++)
        out[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    return out;
}

/**
 * Normalizes PEM private keys to PKCS#8 DER for WebCrypto import.
 * Accepts PKCS#8 PEM, SEC1 EC PEM (BEGIN EC PRIVATE KEY), or raw hex.
 *
 * @param {string} input
 * @returns {Uint8Array}
 */
function parsePrivateKey(input) {
    const value = (input || "").trim();
    if (!value.length) throw new OperationError("Missing key input.");

    if (!value.includes("-----BEGIN"))
        return parsePemOrHex(value, "HEX", "PRIVATE KEY");

    if (value.includes("-----BEGIN PRIVATE KEY-----"))
        return parsePemOrHex(value, "PEM", "PRIVATE KEY");

    try {
        const key = r.KEYUTIL.getKey(value);
        const pkcs8Pem = r.KEYUTIL.getPEM(key, "PKCS8PRV");
        return parsePemOrHex(pkcs8Pem, "PEM", "PRIVATE KEY");
    } catch (err) {
        throw new OperationError(`Unsupported private key format: ${err}`);
    }
}

/**
 * Concatenates byte arrays.
 *
 * @param {Uint8Array[]} parts
 * @returns {Uint8Array}
 */
function concatBytes(parts) {
    const total = parts.reduce((sum, p) => sum + p.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const p of parts) { out.set(p, offset); offset += p.length; }
    return out;
}

/**
 * Derives output keying material using NIST SP 800-56A Concat KDF.
 *
 * @param {Uint8Array} rawSecret
 * @param {Uint8Array} sharedInfo
 * @param {string} hashAlg   "SHA-256" or "SHA-512"
 * @param {number} outputLen
 * @returns {Promise<Uint8Array>}
 */
async function concatKdf(rawSecret, sharedInfo, hashAlg, outputLen) {
    let counter = 1;
    const chunks = [];
    let generated = 0;

    while (generated < outputLen) {
        const ctr = new Uint8Array([
            (counter >>> 24) & 0xff,
            (counter >>> 16) & 0xff,
            (counter >>>  8) & 0xff,
             counter         & 0xff,
        ]);
        const data = concatBytes([ctr, rawSecret, sharedInfo]);
        const digest = new Uint8Array(await crypto.subtle.digest(hashAlg, data));
        chunks.push(digest);
        generated += digest.length;
        counter += 1;
    }

    return concatBytes(chunks).slice(0, outputLen);
}

/**
 * Derive ECDH Key Material operation.
 */
class DeriveECDHKeyMaterial extends Operation {

    constructor() {
        super();

        this.name = "Derive ECDH Key Material";
        this.module = "Ciphers";
        this.description = [
            "Paste your EC private key into the input field and provide the peer's public key as an argument.",
            "<br><br>",
            "<b>Input:</b> private key in PEM (<code>BEGIN PRIVATE KEY</code> or <code>BEGIN EC PRIVATE KEY</code>)",
            " or as PKCS#8 DER hex.",
            "<br><b>Arguments:</b> curve, peer public key, optional KDF (NIST SP 800-56A Concat KDF),",
            " shared info, output length, and output format.",
            "<br><br>",
            "Use <b>KDF = None</b> to obtain the raw shared secret (the x-coordinate of the shared EC point).",
            " The output length argument is ignored in None mode.",
        ].join("");
        this.inlineHelp = "<strong>Input:</strong> your EC private key (PEM or PKCS8 DER hex).<br>" +
            "<strong>Args:</strong> pick the curve, paste the peer public key, then choose raw secret or KDF output.";

        this.testDataSamples = [
            {
                name: "P-256 raw shared secret",
                input: "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg4HBsMvgcOvEQBrYJ\ndEXulke/dh5vYiOvfI41AToqfbWhRANCAAQgZgScW2pSpRRTOADLPL5D+8TF6xXx\nx9GDOE8V1xYj7arujDYH5935uCdVxXa84lUEw35+afHuh0bDmBDxolmx\n-----END PRIVATE KEY-----",
                args: ["PEM", "P-256", "PEM",
                    "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEa+FXJzzko0OZ9DcOaXpLzAkSt7bE\nXXVKQqYfsmuelH6QgH86dMR04/bvnhl4bF7YKbMWDlPRHs9haSeR/PhFNg==\n-----END PUBLIC KEY-----",
                    "None", 32, "", "Hex"],
            },
        ];

        this.infoURL = "https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Private key format",
                "type": "option",
                "value": ["PEM", "Hex (PKCS8 DER)"],
                "comment": "PEM may be BEGIN PRIVATE KEY (PKCS#8) or BEGIN EC PRIVATE KEY (SEC1, auto-converted).",
            },
            {
                "name": "Curve",
                "type": "option",
                "value": ["P-256", "P-384", "P-521"],
                "comment": "Must match the actual curve of both keys. The op does not auto-detect the curve.",
            },
            {
                "name": "Peer public key format",
                "type": "option",
                "value": ["PEM", "Hex (SPKI DER)"],
                "comment": "PEM should be an SPKI BEGIN PUBLIC KEY block.",
            },
            {
                "name": "Peer public key",
                "type": "text",
                "value": "-----BEGIN PUBLIC KEY-----",
                "comment": "Paste the full peer public key here.",
            },
            {
                "name": "KDF",
                "type": "option",
                "value": ["None", "Concat KDF SHA-256", "Concat KDF SHA-512"],
                "comment": "None returns the raw shared secret. Concat KDF follows NIST SP 800-56A §5.8.1.",
            },
            {
                "name": "Output length (bytes)",
                "type": "number",
                "value": 32,
                "comment": "Used only with KDF modes. Ignored when KDF is None.",
            },
            {
                "name": "Shared info (hex)",
                "type": "string",
                "value": "",
                "comment": "Optional KDF shared info as hex. Leave blank if not used.",
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Hex", "Base64"],
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [
            privateFmt,
            curve,
            publicFmt,
            peerPublicKey,
            kdf,
            outLenArg,
            sharedInfoHex,
            outputFormat,
        ] = args;

        if (!globalThis.crypto || !globalThis.crypto.subtle)
            throw new OperationError("WebCrypto is not available in this runtime.");

        const privateDer = privateFmt === "PEM"
            ? parsePrivateKey(input)
            : parsePemOrHex(input, "HEX", "PRIVATE KEY");

        const publicDer = parsePemOrHex(
            peerPublicKey,
            publicFmt === "PEM" ? "PEM" : "HEX",
            "PUBLIC KEY"
        );

        const outLen = Math.max(1, Number(outLenArg) || 32);

        const sharedInfoHexNorm = (sharedInfoHex || "").replace(/\s+/g, "");
        if (sharedInfoHexNorm.length % 2 !== 0 ||
            (sharedInfoHexNorm.length > 0 && !/^[0-9a-fA-F]+$/.test(sharedInfoHexNorm)))
            throw new OperationError("Shared info must be hex.");

        const sharedInfo = sharedInfoHexNorm.length
            ? new Uint8Array(sharedInfoHexNorm.match(/.{2}/g).map(h => parseInt(h, 16)))
            : new Uint8Array();

        const privateKey = await crypto.subtle.importKey(
            "pkcs8", privateDer,
            { name: "ECDH", namedCurve: curve },
            false, ["deriveBits"]
        );

        const publicKey = await crypto.subtle.importKey(
            "spki", publicDer,
            { name: "ECDH", namedCurve: curve },
            false, []
        );

        // P-521 has a 521-bit field; deriveBits requires a multiple of 8,
        // so request 528 bits (66 bytes) and WebCrypto returns the full x-coordinate.
        const curveBits = curve === "P-256" ? 256 : curve === "P-384" ? 384 : 528;
        const rawSecret = new Uint8Array(
            await crypto.subtle.deriveBits({ name: "ECDH", public: publicKey }, privateKey, curveBits)
        );

        let out;
        if (kdf === "Concat KDF SHA-256") {
            out = await concatKdf(rawSecret, sharedInfo, "SHA-256", outLen);
        } else if (kdf === "Concat KDF SHA-512") {
            out = await concatKdf(rawSecret, sharedInfo, "SHA-512", outLen);
        } else {
            // None: return the full raw shared secret; output length arg is ignored.
            out = rawSecret;
        }

        return outputFormat === "Base64" ? toBase64(out) : toHexFast(out).toUpperCase();
    }

}

export default DeriveECDHKeyMaterial;
