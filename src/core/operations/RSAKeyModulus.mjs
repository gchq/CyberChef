/**
 * @author rayane-ara []
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

/**
 * RSA Key Modulus operation
 */
class RSAKeyModulus extends Operation {

    /**
     * RSAKeyModulus constructor
     */
    constructor() {
        super();

        this.name = "RSA Key Modulus";
        this.module = "Crypto";
        this.description = "Extracts the modulus from an RSA private key, public key, or X.509 certificate. This is commonly used to verify if a private key corresponds to a specific X.509 certificate.<br><br>This operation provides the same functionality as the <code>openssl rsa -noout -modulus</code> and <code>openssl x509 -noout -modulus</code> commands.<br><br>Accepts PEM-encoded input. Supported formats:<br><ul><li><code>-----BEGIN CERTIFICATE-----</code> (X.509 certificate)</li><li><code>-----BEGIN PRIVATE KEY-----</code> (PKCS#8 unencrypted)</li><li><code>-----BEGIN RSA PRIVATE KEY-----</code> (PKCS#1)</li><li><code>-----BEGIN PUBLIC KEY-----</code> (PKCS#8 / SubjectPublicKeyInfo)</li><li><code>-----BEGIN RSA PUBLIC KEY-----</code> (PKCS#1)</li></ul>";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "Output format",
                type: "option",
                value: ["Hex", "Decimal", "Base64"]
            }
        ];
    }

    /**
     * Extracts the RSA modulus from a PEM-encoded RSA private key, public key,
     * or X.509 certificate.
     *
     * Supports the following PEM headers:
     *   - -----BEGIN CERTIFICATE-----        (X.509 certificate)
     *   - -----BEGIN RSA PRIVATE KEY-----    (PKCS#1 private key)
     *   - -----BEGIN PRIVATE KEY-----        (PKCS#8 unencrypted private key)
     *   - -----BEGIN RSA PUBLIC KEY-----     (PKCS#1 public key)
     *   - -----BEGIN PUBLIC KEY-----         (PKCS#8 / SubjectPublicKeyInfo public key)
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [outputFormat] = args;

        if (!input || input.trim() === "") {
            throw new OperationError("No input provided. Please provide a PEM-encoded RSA key.");
        }

        const pem = input.trim();
        let key = null;

        // Detect key type from PEM header
        if (pem.includes("-----BEGIN CERTIFICATE-----")) {
            // X.509 certificate - extract the embedded RSA public key
            try {
                const cert = forge.pki.certificateFromPem(pem);
                key = cert.publicKey;
                if (!key || !key.n) {
                    throw new OperationError("The certificate does not contain an RSA public key.");
                }
            } catch (err) {
                if (err instanceof OperationError) throw err;
                throw new OperationError(`Failed to parse X.509 certificate: ${err.message}`);
            }
        } else if (pem.includes("-----BEGIN RSA PRIVATE KEY-----")) {
            // PKCS#1 RSA private key
            try {
                key = forge.pki.privateKeyFromPem(pem);
            } catch (err) {
                throw new OperationError(`Failed to parse PKCS#1 RSA private key: ${err.message}`);
            }
        } else if (pem.includes("-----BEGIN PRIVATE KEY-----")) {
            // PKCS#8 unencrypted private key
            try {
                key = forge.pki.privateKeyFromPem(pem);
            } catch (err) {
                throw new OperationError(`Failed to parse PKCS#8 private key: ${err.message}. Note: encrypted private keys (-----BEGIN ENCRYPTED PRIVATE KEY-----) are not supported.`);
            }
        } else if (pem.includes("-----BEGIN RSA PUBLIC KEY-----")) {
            // PKCS#1 RSA public key - forge does not support this header natively.
            // We parse the ASN.1 DER directly to extract n and e, then build a
            // forge public key object from those two integers.
            // PKCS#1 RSAPublicKey ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }
            try {
                const der = forge.util.decode64(
                    pem
                        .replace("-----BEGIN RSA PUBLIC KEY-----", "")
                        .replace("-----END RSA PUBLIC KEY-----", "")
                        .replace(/\s+/g, "")
                );
                const asn1 = forge.asn1.fromDer(der);
                if (
                    asn1.type !== forge.asn1.Type.SEQUENCE ||
                    !asn1.value ||
                    asn1.value.length < 2
                ) {
                    throw new Error("Unexpected ASN.1 structure in PKCS#1 public key.");
                }
                // Each INTEGER value in the ASN.1 tree is a raw DER byte string
                const nDer = asn1.value[0].value;
                const eDer = asn1.value[1].value;

                // forge.jsbn.BigInteger can be constructed directly from a hex string
                const n = new forge.jsbn.BigInteger(forge.util.bytesToHex(nDer), 16);
                const e = new forge.jsbn.BigInteger(forge.util.bytesToHex(eDer), 16);

                key = forge.pki.rsa.setPublicKey(n, e);
            } catch (err) {
                throw new OperationError(`Failed to parse PKCS#1 RSA public key: ${err.message}`);
            }
        } else if (pem.includes("-----BEGIN PUBLIC KEY-----")) {
            // PKCS#8 / SubjectPublicKeyInfo public key
            try {
                key = forge.pki.publicKeyFromPem(pem);
            } catch (err) {
                throw new OperationError(`Failed to parse PKCS#8 public key: ${err.message}`);
            }
        } else if (pem.includes("-----BEGIN ENCRYPTED PRIVATE KEY-----")) {
            throw new OperationError("Encrypted private keys are not supported. Please decrypt your key first (e.g. with openssl pkcs8 -in key.pem -out decrypted.pem).");
        } else {
            throw new OperationError("Unrecognised PEM header. Supported types:\n  -----BEGIN CERTIFICATE-----\n  -----BEGIN RSA PRIVATE KEY-----\n  -----BEGIN PRIVATE KEY-----\n  -----BEGIN RSA PUBLIC KEY-----\n  -----BEGIN PUBLIC KEY-----");
        }

        // Extract the modulus BigInteger from the parsed key
        // For both public and private forge keys the modulus is exposed as key.n
        const n = key.n;
        if (!n) {
            throw new OperationError("Could not extract modulus from key. The key may not be an RSA key.");
        }

        // Convert the forge BigInteger to a hex string (unsigned, big-endian)
        // n.toString(16) returns lowercase hex without leading zeros
        let hexModulus = n.toString(16);

        // Ensure even number of hex characters (full bytes)
        if (hexModulus.length % 2 !== 0) {
            hexModulus = "0" + hexModulus;
        }

        // Format output according to user preference
        switch (outputFormat) {
            case "Hex":
                // Match openssl output style: uppercase hex
                return "Modulus=" + hexModulus.toUpperCase();

            case "Decimal":
                return n.toString(10);

            case "Base64": {
                // Convert hex string to binary then base64
                const bytes = hexModulus.match(/.{2}/g).map(b => parseInt(b, 16));
                const binary = bytes.map(b => String.fromCharCode(b)).join("");
                return forge.util.encode64(binary);
            }

            default:
                return hexModulus.toUpperCase();
        }
    }

}

export default RSAKeyModulus;

