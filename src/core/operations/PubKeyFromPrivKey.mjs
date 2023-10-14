/**
 * @author cplussharp
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import r from "jsrsasign";
import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";

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
            // find corresponding end tag
            const indexBase64 = match.index + match[0].length;
            const footer = `-----END ${match[1]}-----`;
            const indexFooter = input.indexOf(footer, indexBase64);
            if (indexFooter === -1) {
                throw new OperationError(`PEM footer '${footer}' not found`);
            }

            const privKeyPem = input.substring(match.index, indexFooter + footer.length);
            let privKey;
            try {
                privKey = r.KEYUTIL.getKey(privKeyPem);
            } catch (err) {
                throw new OperationError(`Unsupported key type: ${err}`);
            }
            let pubKey;
            if (privKey.type && privKey.type === "EC") {
                pubKey = new r.KJUR.crypto.ECDSA({ curve: privKey.curve });
                pubKey.setPublicKeyHex(privKey.generatePublicKeyHex());
            } else if (privKey.type && privKey.type === "DSA") {
                if (!privKey.y) {
                    throw new OperationError(`DSA Private Key in PKCS#8 is not supported`);
                }
                pubKey = new r.KJUR.crypto.DSA();
                pubKey.setPublic(privKey.p, privKey.q, privKey.g, privKey.y);
            } else if (privKey.n && privKey.e) {
                pubKey = new r.RSAKey();
                pubKey.setPublic(privKey.n, privKey.e);
            } else {
                throw new OperationError(`Unsupported key type`);
            }
            const pubKeyPem = r.KEYUTIL.getPEM(pubKey);

            // PEM ends with '\n', so a new key always starts on a new line
            output += pubKeyPem;
        }
        return output;
    }
}

export default PubKeyFromPrivKey;
