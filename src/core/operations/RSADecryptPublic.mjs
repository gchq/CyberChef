/**
 * @author Fra3zz
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

/**
 * RSA Decrypt Public Key operation
 */
class RSADecryptPublic extends Operation {

    /**
     * RSADecryptPublic constructor
     */
    constructor() {
        super();

        this.name = "RSA Decrypt Public Key";
        this.module = "Ciphers";
        this.description = "Decrypt a message that was encrypted with an RSA private key, using the corresponding public key. Supports PKCS#1 (<code>BEGIN RSA PUBLIC KEY</code>) and X.509 SubjectPublicKeyInfo (<code>BEGIN PUBLIC KEY</code>) formats.<br><br>This is the complement of the <b>RSA Encrypt Private Key</b> operation. Standard RSA decryption uses a private key; this operation uses the public key to reverse a private-key-encrypted ciphertext.";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "RSA Public Key (PEM)",
                type: "text",
                value: "-----BEGIN PUBLIC KEY-----"
            },
            {
                name: "Encryption Scheme",
                type: "option",
                value: ["PKCS1 v1.5", "RAW"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [pemKey, scheme] = args;

        if (!pemKey.startsWith("-----BEGIN")) {
            throw new OperationError("Please enter a public key.");
        }

        let pubKey;
        try {
            pubKey = forge.pki.publicKeyFromPem(pemKey);
        } catch (err) {
            throw new OperationError(`Unable to load public key: ${err.message}`);
        }

        try {
            if (scheme === "PKCS1 v1.5") {
                const decrypted = forge.pki.rsa.decrypt(input, pubKey, true, true);
                return forge.util.decodeUtf8(decrypted);
            } else {

                return forge.pki.rsa.decrypt(input, pubKey, true, false);
            }
        } catch (err) {
            if (err.message === "Encrypted message length is invalid.") {
                throw new OperationError(`Input length (${err.length} bytes) does not match key size (${err.expected} bytes). Ensure the input is raw ciphertext, not base64 or hex encoded.`);
            }
            throw new OperationError(err);
        }
    }

}

export default RSADecryptPublic;
