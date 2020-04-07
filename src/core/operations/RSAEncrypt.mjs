/**
 * @author Matt C [me@mitt.dev]
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge/dist/forge.min.js";
import { MD_ALGORITHMS } from "../lib/RSA.mjs";

/**
 * RSA Encrypt operation
 */
class RSAEncrypt extends Operation {

    /**
     * RSAEncrypt constructor
     */
    constructor() {
        super();

        this.name = "RSA Encrypt";
        this.module = "Ciphers";
        this.description = "Encrypt a message with a PEM encoded RSA public key.";
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
                name: "Encryption Scheme",
                type: "argSelector",
                value: [
                    {
                        name: "RSA-OAEP",
                        on: [2]
                    },
                    {
                        name: "RSAES-PKCS1-V1_5",
                        off: [2]
                    },
                    {
                        name: "RAW",
                        off: [2]
                    }]
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
        const [pemKey, scheme, md] = args;

        if (pemKey.replace("-----BEGIN RSA PUBLIC KEY-----", "").length === 0) {
            throw new OperationError("Please enter a public key.");
        }
        try {
            // Load public key
            const pubKey = forge.pki.publicKeyFromPem(pemKey);
            // Encrypt message
            const eMsg = pubKey.encrypt(input, scheme, {md: MD_ALGORITHMS[md].create()});
            return eMsg;
        } catch (err) {
            throw new OperationError(err);
        }
    }

}

export default RSAEncrypt;
