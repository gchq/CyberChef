/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 * @license Apache-2.0
 */

import Operation from "../Operation";
import forge from "node-forge/dist/forge.min.js";

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
        this.outputType = "byteArray";
        this.args = [
            {
                name: "RSA Private Key (PEM)",
                type: "text",
                value: "-----BEGIN RSA PRIVATE KEY-----"
            },
            {
                name: "Password",
                type: "text",
                value: ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [key, password] = args;

        const privateKey = forge.pki.decryptRsaPrivateKey(key, password);

        const md = forge.md.sha1.create();
        md.update(input, "utf8");
        const signature = privateKey.sign(md);

        return signature.split("").map(char => char.charCodeAt());
    }

}

export default RSASign;
