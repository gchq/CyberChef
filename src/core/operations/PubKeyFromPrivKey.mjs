/**
 * @author cplussharp
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import {
    parseKeyPem,
    derivePublicKeyInfo,
    keyInfoToPem,
} from "../lib/KeyConvert.mjs";

/**
 * Public Key from Private Key operation
 */
class PubKeyFromPrivKey extends Operation {

    /**
     * PubKeyFromPrivKey constructor
     */
    constructor() {
        super();

        this.name = "Public Key from Private Key";
        this.module = "PublicKey";
        this.description = "Extracts the Public Key from a Private Key.";
        this.infoURL = "https://en.wikipedia.org/wiki/PKCS_8";
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
        const regex = /-----BEGIN ((RSA |EC |DSA )?PRIVATE KEY)-----/g;
        while ((match = regex.exec(input)) !== null) {
            const indexBase64 = match.index + match[0].length;
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`PEM footer '${footer}' not found`);
            }

            const privKeyPem = input.substring(match.index, indexFooter + footer.length);
            let privInfo;
            try {
                privInfo = parseKeyPem(privKeyPem);
            } catch (err) {
                throw new OperationError(`Unsupported key type: ${err}`);
            }

            const pubInfo = derivePublicKeyInfo(privInfo);
            output += keyInfoToPem(pubInfo);
        }
        return output;
    }
}

export default PubKeyFromPrivKey;
