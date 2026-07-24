/**
 * RSA resources.
 *
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import forge from "node-forge";
import * as asn1js from "asn1js";

export const MD_ALGORITHMS = {
    "SHA-1": forge.md.sha1,
    "MD5": forge.md.md5,
    "SHA-256": forge.md.sha256,
    "SHA-384": forge.md.sha384,
    "SHA-512": forge.md.sha512,
};

const rsaEncryptionOID = "1.2.840.113549.1.1.1";

/**
 * Convert PKCS#1 RSA public key (PEM) to SPKI PEM
 * @param {string} originalPem
 * @returns {string}
 */
export function pkcs1ToSpki(originalPem) {
    // remove PEM headers
    const b64 = originalPem
        .replace(/-----BEGIN RSA PUBLIC KEY-----/g, "")
        .replace(/-----END RSA PUBLIC KEY-----/g, "")
        .replace(/\s+/g, "");

    const pkcs1Der = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;

    // SubjectPublicKeyInfo ::= SEQUENCE {
    //   algorithm         AlgorithmIdentifier,
    //   subjectPublicKey  BIT STRING
    // }

    const spkiSchema = new asn1js.Sequence({
        value: [
            new asn1js.Sequence({
                value: [
                    // rsaEncryption OID
                    new asn1js.ObjectIdentifier({ value: rsaEncryptionOID }),
                    new asn1js.Null()
                ]
            }),
            new asn1js.BitString({ valueHex: pkcs1Der })
        ]
    });

    const spkiDer = spkiSchema.toBER(false);

    const spkiB64 = btoa(
        String.fromCharCode(...new Uint8Array(spkiDer))
    );

    const lines = spkiB64.match(/.{1,64}/g).join("\n");

    return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}
