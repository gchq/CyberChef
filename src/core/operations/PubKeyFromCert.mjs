/**
 * @author cplussharp
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import { X509Certificate } from "@peculiar/x509";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * Public Key from Certificate operation
 */
class PubKeyFromCert extends Operation {

    /**
     * PubKeyFromCert constructor
     */
    constructor() {
        super();

        this.name = "Public Key from Certificate";
        this.module = "PublicKey";
        this.description = "Extracts the Public Key from a Certificate.";
        this.infoURL = "https://en.wikipedia.org/wiki/X.509";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let output = "";
        let match;
        const regex = /-----BEGIN CERTIFICATE-----/g;
        while ((match = regex.exec(input)) !== null) {
            const indexBase64 = match.index + match[0].length;
            const footer = "-----END CERTIFICATE-----";
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`PEM footer '${footer}' not found`);
            }
            const certPem = input.substring(match.index, indexFooter + footer.length);

            let cert;
            try {
                cert = new X509Certificate(certPem);
            } catch {
                throw new OperationError("Unsupported public key type");
            }

            let pubKeyPem;
            try {
                pubKeyPem = cert.publicKey.toString("pem");
            } catch {
                throw new OperationError("Unsupported public key type");
            }

            // Normalise to LF endings + trailing newline so multi-cert input
            // produces a clean separator between successive keys.
            output += pubKeyPem.replace(/\r\n/g, "\n").replace(/\n?$/, "\n");
        }
        return output;
    }
}

export default PubKeyFromCert;
