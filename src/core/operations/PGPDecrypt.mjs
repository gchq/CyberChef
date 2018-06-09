/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import kbpgp from "kbpgp";
import { ASP, importPrivateKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import * as es6promisify from "es6-promisify";
const promisify = es6promisify.default ? es6promisify.default.promisify : es6promisify.promisify;

/**
 * PGP Decrypt operation
 */
class PGPDecrypt extends Operation {

    /**
     * PGPDecrypt constructor
     */
    constructor() {
        super();

        this.name = "PGP Decrypt";
        this.module = "PGP";
        this.description = [
            "Input: the ASCII-armoured PGP message you want to decrypt.",
            "<br><br>",
            "Arguments: the ASCII-armoured PGP private key of the recipient, ",
            "(and the private key password if necessary).",
            "<br><br>",
            "Pretty Good Privacy is an encryption standard (OpenPGP) used for encrypting, decrypting, and signing messages.",
            "<br><br>",
            "This function uses the Keybase implementation of PGP.",
        ].join("\n");
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Private key of recipient",
                "type": "text",
                "value": ""
            },
            {
                "name": "Private key passphrase",
                "type": "string",
                "value": ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     *
     * @throws {OperationError} if invalid private key
     */
    async run(input, args) {
        const encryptedMessage = input,
            [privateKey, passphrase] = args,
            keyring = new kbpgp.keyring.KeyRing();
        let plaintextMessage;

        if (!privateKey) throw new OperationError("Enter the private key of the recipient.");

        const key = await importPrivateKey(privateKey, passphrase);
        keyring.add_key_manager(key);

        try {
            plaintextMessage = await promisify(kbpgp.unbox)({
                armored: encryptedMessage,
                keyfetch: keyring,
                asp: ASP
            });
        } catch (err) {
            throw new OperationError(`Couldn't decrypt message with provided private key: ${err}`);
        }

        return plaintextMessage.toString();
    }

}

export default PGPDecrypt;
