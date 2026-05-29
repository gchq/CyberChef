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
 * Convert PKCS#1 RSA private key (PEM) to PKCS#8 PEM
 * @param {string} originalPem
 * @returns {string}
 */
export function pkcs1ToPkcs8(originalPem) {
    // remove PEM headers
    const b64 = originalPem
        .replace(/-----BEGIN RSA PRIVATE KEY-----/g, "")
        .replace(/-----END RSA PRIVATE KEY-----/g, "")
        .replace(/\s+/g, "");

    const pkcs1Der = Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;

    // PKCS#8 structure:
    // PrivateKeyInfo ::= SEQUENCE {
    //   version                   INTEGER,
    //   privateKeyAlgorithm       AlgorithmIdentifier,
    //   privateKey                OCTET STRING
    // }

    const pkcs8Schema = new asn1js.Sequence({
        value: [
            new asn1js.Integer({ value: 0 }),
            new asn1js.Sequence({
                value: [
          // rsaEncryption OID
                    new asn1js.ObjectIdentifier({ value: rsaEncryptionOID }),
                    new asn1js.Null()
                ]
            }),
            new asn1js.OctetString({ valueHex: pkcs1Der })
        ]
    });

    const pkcs8Der = pkcs8Schema.toBER(false);

    const pkcs8B64 = btoa(
        String.fromCharCode(...new Uint8Array(pkcs8Der))
    );

    const lines = pkcs8B64.match(/.{1,64}/g).join("\n");

    return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
}
