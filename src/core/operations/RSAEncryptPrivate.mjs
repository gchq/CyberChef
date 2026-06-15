/**
 * @author Fra3zz
 * @copyright Crown Copyright 2024
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";

/**
 * RSA Encrypt Private Key operation
 */
class RSAEncryptPrivate extends Operation {

    /**
     * RSAEncryptPrivate constructor
     */
    constructor() {
        super();

        this.name = "RSA Encrypt Private Key";
        this.module = "Ciphers";
        this.description = "Encrypt a message with a PEM encoded RSA private key using the private key transform. Supports PKCS#1 and PKCS#8 key formats, including password-protected keys. The resulting ciphertext can be decrypted by anyone holding the corresponding public key.<br><br>Note: standard RSA encryption uses a public key. This operation applies the private key transform (equivalent to signing without hashing) and is sometimes required for compatibility with specific systems.";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "RSA Private Key (PEM)",
                type: "text",
                value: "-----BEGIN RSA PRIVATE KEY-----"
            },
            {
                name: "Key Password",
                type: "text",
                value: ""
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
        const [pemKey, password, scheme] = args;

        if (!pemKey.startsWith("-----BEGIN")) {
            throw new OperationError("Please enter a private key.");
        }

        let privKey;
        try {
            privKey = forge.pki.decryptRsaPrivateKey(pemKey, password);
        } catch (err) {}

        if (!privKey) {
            try {
                privKey = forge.pki.privateKeyFromPem(pemKey);
            } catch (err) {
                throw new OperationError(`Unable to load private key: ${err.message}`);
            }
        }

        if (!privKey) {
            throw new OperationError("Unable to load private key. Check the key format and password.");
        }

        try {
            const plaintextBytes = forge.util.encodeUtf8(input);
            const bt = scheme === "PKCS1 v1.5" ? 0x01 : false;
            return forge.pki.rsa.encrypt(plaintextBytes, privKey, bt);
        } catch (err) {
            if (err.message && err.message.includes("too long")) {
                throw new OperationError(`Message is too long for this key size.`);
            }
            throw new OperationError(err);
        }
    }

}

export default RSAEncryptPrivate;
