/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import * as kbpgp from "kbpgp";
import { promisify } from "es6-promisify";
import { ASP } from "../lib/PGP";
/**
 * PGP Encrypt operation
 */
class PGPEncrypt extends Operation {

    /**
     * PGPEncrypt constructor
     */
    constructor() {
        super();

        this.name = "PGP Encrypt";
        this.module = "PGP";
        this.description = "Input: the message you want to encrypt.\n<br><br>\nArguments: the ASCII-armoured PGP public key of the recipient.\n<br><br>\nPretty Good Privacy is an encryption standard (OpenPGP) used for encrypting, decrypting, and signing messages.\n<br><br>\nThis function uses the Keybase implementation of PGP.";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Public key of recipient",
                "type": "text",
                "value": ""
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const plaintextMessage = input,
            plainPubKey = args[0];
        let key,
            encryptedMessage;

        if (!plainPubKey) return "Enter the public key of the recipient.";

        try {
            key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
                armored: plainPubKey,
            });
        } catch (err) {
            throw `Could not import public key: ${err}`;
        }

        try {
            encryptedMessage = await promisify(kbpgp.box)({
                "msg": plaintextMessage,
                "encrypt_for": key,
                "asp": ASP
            });
        } catch (err) {
            throw `Couldn't encrypt message with provided public key: ${err}`;
        }

        return encryptedMessage.toString();
    }

}

export default PGPEncrypt;
