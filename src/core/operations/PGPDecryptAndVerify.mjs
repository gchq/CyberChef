/**
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */

import Operation from "../Operation";
import kbpgp from "kbpgp";
import { ASP, importPrivateKey, importPublicKey } from "../lib/PGP";
import promisifyDefault from "es6-promisify";
const promisify = promisifyDefault.promisify;

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
        this.description = "Input: the ASCII-armoured encrypted PGP message you want to verify.\n<br><br>\nArguments: the ASCII-armoured PGP public key of the signer, \nthe ASCII-armoured private key of the recipient (and the private key password if necessary).\n<br><br>\nThis operation uses PGP to decrypt and verify an encrypted digital signature.\n<br><br>\nPretty Good Privacy is an encryption standard (OpenPGP) used for encrypting, decrypting, and signing messages.\n<br><br>\nThis function uses the Keybase implementation of PGP.";
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
            publicKey = args[0],
            privateKey = args[1],
            passphrase = args[2],
            keyring = new kbpgp.keyring.KeyRing();
        let unboxedLiterals;

        if (!publicKey) return "Enter the public key of the signer.";
        if (!privateKey) return "Enter the private key of the recipient.";
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
                    return "Could not identify a key manager.";
                }
            } else {
                return "The data does not appear to be signed.";
            }
        } catch (err) {
            return `Couldn't verify message: ${err}`;
        }
    }

}

export default PGPDecryptAndVerify;
