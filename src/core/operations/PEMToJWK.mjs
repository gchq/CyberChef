/**
 * @author cplussharp
 * @copyright Crown Copyright 2021
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
            if (match[1].indexOf("KEY") !== -1) {
                if (header === "-----BEGIN RSA PUBLIC KEY-----") {
                    throw new OperationError("Unsupported RSA public key format. Only PKCS#8 is supported.");
                }

                const key = r.KEYUTIL.getKey(pem);
                if (key.type === "DSA") {
                    throw new OperationError("DSA keys are not supported for JWK");
                }
                const jwk = r.KEYUTIL.getJWKFromKey(key);
                if (output.length > 0) {
                    output += "\n";
                }
                output += JSON.stringify(jwk);
            } else if (match[1] === "CERTIFICATE") {
                const cert = new r.X509();
                cert.readCertPEM(pem);
                const key = cert.getPublicKey();
                const jwk = r.KEYUTIL.getJWKFromKey(key);
                if (output.length > 0) {
                    output += "\n";
                }
                output += JSON.stringify(jwk);
            } else {
                throw new OperationError(`Unsupported PEM type '${match[1]}'`);
            }
        }
        return output;
    }
}

export default PEMToJWK;
