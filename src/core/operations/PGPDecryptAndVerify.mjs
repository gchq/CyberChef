/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import kbpgp from "kbpgp";
import { ASP, importPrivateKey, importPublicKey } from "../lib/PGP";
import OperationError from "../errors/OperationError";
import * as es6promisify from "es6-promisify";
const promisify = es6promisify.default ? es6promisify.default.promisify : es6promisify.promisify;

/**
 * PGP Decrypt and Verify operation
 */
class PGPDecryptAndVerify extends Operation {

    /**
     * PGPDecryptAndVerify constructor
     */
    constructor() {
        super();

        this.name = "PGP Decrypt and Verify";
        this.module = "PGP";
        this.description = [
            "Input: the ASCII-armoured encrypted PGP message you want to verify.",
            "<br><br>",
            "Arguments: the ASCII-armoured PGP public key of the signer, ",
            "the ASCII-armoured private key of the recipient (and the private key password if necessary).",
            "<br><br>",
            "This operation uses PGP to decrypt and verify an encrypted digital signature.",
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
                "name": "Public key of signer",
                "type": "text",
                "value": ""
            },
            {
                "name": "Private key of recipient",
                "type": "text",
                "value": ""
            },
            {
                "name": "Private key password",
                "type": "string",
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
        const signedMessage = input,
            [publicKey, privateKey, passphrase] = args,
            keyring = new kbpgp.keyring.KeyRing();
        let unboxedLiterals;

        if (!publicKey) throw new OperationError("Enter the public key of the signer.");
        if (!privateKey) throw new OperationError("Enter the private key of the recipient.");
        const privKey = await importPrivateKey(privateKey, passphrase);
        const pubKey = await importPublicKey(publicKey);
        keyring.add_key_manager(privKey);
        keyring.add_key_manager(pubKey);

        try {
            unboxedLiterals = await promisify(kbpgp.unbox)({
                armored: signedMessage,
                keyfetch: keyring,
                asp: ASP
            });
            const ds = unboxedLiterals[0].get_data_signer();
            if (ds) {
                const km = ds.get_key_manager();
                if (km) {
                    const signer = km.get_userids_mark_primary()[0].components;
                    let text = "Signed by ";
                    if (signer.email || signer.username || signer.comment) {
                        if (signer.username) {
                            text += `${signer.username} `;
                        }
                        if (signer.comment) {
                            text += `${signer.comment} `;
                        }
                        if (signer.email) {
                            text += `<${signer.email}>`;
                        }
                        text += "\n";
                    }
                    text += [
                        `PGP fingerprint: ${km.get_pgp_fingerprint().toString("hex")}`,
                        `Signed on ${new Date(ds.sig.hashed_subpackets[0].time * 1000).toUTCString()}`,
                        "----------------------------------\n"
                    ].join("\n");
                    text += unboxedLiterals.toString();
                    return text.trim();
                } else {
                    throw new OperationError("Could not identify a key manager.");
                }
            } else {
                throw new OperationError("The data does not appear to be signed.");
            }
        } catch (err) {
            throw new OperationError(`Couldn't verify message: ${err}`);
        }
    }

}

export default PGPDecryptAndVerify;
