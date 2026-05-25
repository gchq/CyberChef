/**
 * @author engrach
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import kbpgp from "kbpgp";
import { ASP, importPrivateKey } from "../lib/PGP.mjs";
import OperationError from "../errors/OperationError.mjs";
import * as es6promisify from "es6-promisify";
const promisify = es6promisify.default ? es6promisify.default.promisify : es6promisify.promisify;

/**
 * PGP Encrypt and Sign operation
 */
class PGPSign extends Operation {

    /**
     * PGPSign constructor
     */
    constructor() {
        super();

        this.name = "PGP Sign";
        this.module = "PGP";
        this.description = [
            "Input: the cleartext you want to sign.",
            "<br><br>",
            "Arguments: the ASCII-armoured private key of the signer (plus the private key password if necessary).",
            "<br><br>",
            "This operation uses PGP to produce a PGP signed message.",
            "<br><br>",
            "Pretty Good Privacy is an encryption standard (OpenPGP) used for encrypting, decrypting, and signing messages.",
            "<br><br>",
            "This function uses the Keybase implementation of PGP.",
        ].join("\n");
        this.infoURL = "https://wikipedia.org/wiki/Pretty_Good_Privacy";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Private key of signer",
                "type": "text",
                "value": ""
            },
            {
                "name": "Private key passphrase",
                "type": "string",
                "value": ""
            },
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if failure to sign message
     */
    async run(input, args) {
        const message = input,
            [privateKey, passphrase] = args;
        let signedMessage;

        if (!privateKey) throw new OperationError("Enter the private key of the signer.");
        const privKey = await importPrivateKey(privateKey, passphrase);

        try {
            signedMessage = await promisify(kbpgp.box)({
                "msg": message,
                "sign_with": privKey,
                "asp": ASP
            });
        } catch (err) {
            throw new OperationError(`Couldn't sign message: ${err}`);
        }

        return signedMessage;
    }

}

export default PGPSign;
