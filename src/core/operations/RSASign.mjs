/**
 * @author Matt C [me@mitt.dev]
 * @author gchq77703 []
 * @copyright Crown Copyright 2020
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import forge from "node-forge";
import { MD_ALGORITHMS } from "../lib/RSA.mjs";

/**
 * RSA Sign operation
 */
class RSASign extends Operation {
    /**
     * RSASign constructor
     */
    constructor() {
        super();

        this.name = "RSA Sign";
        this.module = "Ciphers";
        this.description = "Sign a plaintext message with a PEM encoded RSA key.";
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
        const [key, password, mdAlgo] = args;
        if (key.replace("-----BEGIN RSA PRIVATE KEY-----", "").length === 0) {
            throw new OperationError("Please enter a private key.");
        }
        try {
            const privateKey = forge.pki.decryptRsaPrivateKey(key, password);
            // Generate message hash
            const md = MD_ALGORITHMS[mdAlgo].create();
            md.update(input, "utf8");
            // Sign message hash
            const sig = privateKey.sign(md);
            return sig;
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default RSASign;
