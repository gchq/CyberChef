/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";
import { MD_ALGORITHMS } from "../lib/RSA.mjs";
import Utils from "../Utils.mjs";

/**
 * RSA Verify operation
 */
class RSAVerify extends Operation {

    /**
     * RSAVerify constructor
     */
    constructor() {
        super();

        this.name = "RSA Verify";
        this.module = "Ciphers";
        this.description = "Verify a message against a signature and a public PEM encoded RSA key.";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "RSA Public Key (PEM)",
                type: "text",
                value: "-----BEGIN RSA PUBLIC KEY-----"
            },
            {
                name: "Message",
                type: "text",
                value: ""
            },
            {
                name: "Message format",
                type: "option",
                value: ["Raw", "Hex", "Base64"]
            },
            {
                name: "Message Digest Algorithm",
                type: "option",
                value: Object.keys(MD_ALGORITHMS)
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pemKey, message, format, mdAlgo] = args;
        if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("Please enter a public key.");
        }
        try {
            // Load public key
            const pubKey = forge.pki.publicKeyFromPem(pemKey);
            // Generate message digest
            const md = MD_ALGORITHMS[mdAlgo].create();
            const messageStr = Utils.convertToByteString(message, format);
            md.update(messageStr, "raw");
            // Verify by re-encoding rather than parsing the decrypted DigestInfo.
            // node-forge's parser accepts malformed DigestInfo structures
            // (GHSA-86w9-cpqp-85rv), which allows signature forgery with
            // low-exponent keys. RFC 8017 section 8.2.2 compares encodings instead.
            const k = Math.ceil(pubKey.n.bitLength() / 8);
            const em = forge.pki.rsa.decrypt(input, pubKey, true, false);
            const expected = emsaPkcs1v15Encode(md, k);
            return constantTimeEqual(em, expected) ? "Verified OK" : "Verification Failure";
        } catch (err) {
            if (err instanceof OperationError) throw err;
            if (err.message === "Encrypted message length is invalid.") {
                throw new OperationError(`Signature length (${err.length}) does not match expected length based on key (${err.expected}).`);
            }
            throw new OperationError(err);
        }
    }

}

/**
 * EMSA-PKCS1-v1_5 encoding as defined in RFC 8017 section 9.2.
 *
 * @param {Object} md - forge message digest containing the hashed message
 * @param {number} k - Length of the RSA modulus in bytes
 * @returns {string} Encoded message as a byte string
 */
function emsaPkcs1v15Encode(md, k) {
    const asn1 = forge.asn1,
        UNIVERSAL = asn1.Class.UNIVERSAL,
        Type = asn1.Type;
    const digestInfo = asn1.create(UNIVERSAL, Type.SEQUENCE, true, [
        asn1.create(UNIVERSAL, Type.SEQUENCE, true, [
            asn1.create(UNIVERSAL, Type.OID, false, asn1.oidToDer(forge.pki.oids[md.algorithm]).getBytes()),
            asn1.create(UNIVERSAL, Type.NULL, false, "")
        ]),
        asn1.create(UNIVERSAL, Type.OCTETSTRING, false, md.digest().getBytes())
    ]);
    const t = asn1.toDer(digestInfo).getBytes();
    if (k < t.length + 11) {
        throw new OperationError("Key is too short for the selected message digest algorithm.");
    }
    return "\x00\x01" + "\xff".repeat(k - t.length - 3) + "\x00" + t;
}

/**
 * Compares two byte strings without exiting early on the first difference.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function constantTimeEqual(a, b) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

export default RSAVerify;
