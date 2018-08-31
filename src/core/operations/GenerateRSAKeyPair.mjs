/**
 * @author gchq77703 []
 * @copyright Crown Copyright 2018
 ` * @license Apache-2.0
 */

import Operation from "../Operation";
import forge from "node-forge/dist/forge.min.js";
import PrimeWorker from "node-forge/dist/prime.worker.min.js";

/**
 * Generate RSA Key Pair operation
 */
class GenerateRSAKeyPair extends Operation {

    /**
     * GenerateRSAKeyPair constructor
     */
    constructor() {
        super();

        this.name = "Generate RSA Key Pair";
        this.module = "Ciphers";
        this.description = "Generate an RSA key pair with a given number of bits";
        this.infoURL = "https://wikipedia.org/wiki/RSA_(cryptosystem)";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                name: "RSA Key Length",
                type: "option",
                value: [
                    "1024",
                    "2048",
                    "4096"
                ]
            },
            {
                name: "Output Format",
                type: "option",
                value: [
                    "PEM",
                    "JSON",
                    "DER"
                ]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const [keyLength, outputFormat] = args;
        let workerScript;

        return new Promise((resolve, reject) => {
            if (ENVIRONMENT_IS_WORKER || window) {
                workerScript = ENVIRONMENT_IS_WORKER() ? self.URL.createObjectURL(new Blob([PrimeWorker])) : window.URL.createObjectURL(new Blob([PrimeWorker]));
            }
            forge.pki.rsa.generateKeyPair({ bits: Number(keyLength), workers: 2, workerScript}, (err, keypair) => {
                if (err) return reject(err);

                let result;

                switch (outputFormat) {
                    case "PEM":
                        result = forge.pki.publicKeyToPem(keypair.publicKey) + "\n" + forge.pki.privateKeyToPem(keypair.privateKey);
                        break;
                    case "JSON":
                        result = JSON.stringify(keypair);
                        break;
                    case "DER":
                        result = forge.asn1.toDer(forge.pki.privateKeyToAsn1(keypair.privateKey)).getBytes();
                        break;
                }

                resolve(result);
            });
        });
    }

}

export default GenerateRSAKeyPair;
