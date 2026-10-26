/**
 * @author Pål Sollie [sollie@gmail.com]
 * @copyright Crown Copyright 2026
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import ParseX509Certificate from "./ParseX509Certificate.mjs";

/**
 * Parse X.509 certificate bundles operation
 */
class ParseX509CertificateBundles extends Operation {

    /**
     * ParseX509CertificateBundles constructor
     */
    constructor() {
        super();

        this.name = "Parse X.509 certificate bundles";
        this.module = "PublicKey";
        this.description = "Parses a PEM file containing one or more X.509 certificates and displays the validity, issuer, subject, extensions and other details of each certificate in order.";
        this.infoURL = "https://wikipedia.org/wiki/X.509";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @returns {string}
     */
    run(input) {
        if (!input.length) return "No input";
        if (input.length > 2_000_000) throw new OperationError("Certificate bundle exceeds 2 MB");

        const begin = "-----BEGIN CERTIFICATE-----";
        const end = "-----END CERTIFICATE-----";
        const parser = new ParseX509Certificate();
        const output = [];
        let position = 0;

        while (position < input.length) {
            const start = input.indexOf(begin, position);
            if (start === -1) break;
            if (input.slice(position, start).trim()) throw new OperationError("Invalid certificate bundle content");
            if (output.length >= 100) throw new OperationError("Certificate bundle exceeds 100 certificates");

            const finish = input.indexOf(end, start + begin.length);
            if (finish === -1) throw new OperationError(`Certificate ${output.length + 1}: PEM footer not found`);

            try {
                if (!/^[A-Za-z0-9+/=\s]+$/.test(input.slice(start + begin.length, finish))) throw new Error("Invalid PEM body");
                output.push(`Certificate ${output.length + 1}:\n${parser.run(input.slice(start, finish + end.length), ["PEM"])}`);
            } catch (err) {
                throw new OperationError(`Certificate ${output.length + 1}: Certificate load error (non-certificate input?)`);
            }
            position = finish + end.length;
        }

        if (input.slice(position).trim() || !output.length) throw new OperationError("Invalid certificate bundle content");
        return output.join("\n\n");
    }

}

export default ParseX509CertificateBundles;
