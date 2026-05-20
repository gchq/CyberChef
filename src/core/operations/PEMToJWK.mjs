/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import { parseKeyPem, parseCertPublicKey, keyToJwk } from "../lib/KeyConvert.mjs";

/**
 * PEM to JWK operation
 */
class PEMToJWK extends Operation {

    /**
     * PEMToJWK constructor
     */
    constructor() {
        super();

        this.name = "PEM to JWK";
        this.module = "PublicKey";
        this.description = "Converts Keys in PEM format to a JSON Web Key format.";
        this.infoURL = "https://datatracker.ietf.org/doc/html/rfc7517";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
        this.checks = [
            {
                "pattern": "-----BEGIN ((RSA |EC )?(PRIVATE|PUBLIC) KEY|CERTIFICATE)-----",
                "args": []
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        let output = "";
        let match;
        const regex = /-----BEGIN ([A-Z][A-Z ]+[A-Z])-----/g;
        while ((match = regex.exec(input)) !== null) {
            // find corresponding end tag
            const indexBase64 = match.index + match[0].length;
            const header = input.substring(match.index, indexBase64);
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`PEM footer '${footer}' not found`);
            }

            const pem = input.substring(match.index, indexFooter + footer.length);

            let info;
            if (match[1].indexOf("KEY") !== -1) {
                if (header === "-----BEGIN RSA PUBLIC KEY-----") {
                    throw new OperationError("Unsupported RSA public key format. Only PKCS#8 is supported.");
                }
                info = parseKeyPem(pem);
            } else if (match[1] === "CERTIFICATE") {
                info = parseCertPublicKey(pem);
            } else {
                throw new OperationError(`Unsupported PEM type '${match[1]}'`);
            }

            if (info.kty === "DSA") {
                throw new OperationError("DSA keys are not supported for JWK");
            }

            if (output.length > 0) output += "\n";
            output += JSON.stringify(keyToJwk(info));
        }
        return output;
    }
}

export default PEMToJWK;
