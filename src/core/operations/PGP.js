import * as kbpgp from "kbpgp";
import {promisify} from "es6-promisify";


/**
 * PGP operations.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 * @namespace
 */
const PGP = {

    /**
     * @constant
     * @default
     */
    KEY_TYPES: ["RSA-1024", "RSA-2048", "RSA-4096", "ECC-256", "ECC-384"],


    /**
     * Get size of subkey
     *
     * @private
     * @param {number} keySize
     * @returns {number}
     */
    _getSubkeySize(keySize) {
        return {
            1024: 1024,
            2048: 1024,
            4096: 2048,
            256:   256,
            384:   256,
        }[keySize];
    },


    /**
     * Progress callback
     *
     * @private
     */
    _ASP: new kbpgp.ASP({
        "progress_hook": info => {
            let msg = "";

            switch (info.what) {
                case "guess":
                    msg = "Guessing a prime";
                    break;
                case "fermat":
                    msg = "Factoring prime using Fermat's factorization method";
                    break;
                case "mr":
                    msg = "Performing Miller-Rabin primality test";
                    break;
                case "passed_mr":
                    msg = "Passed Miller-Rabin primality test";
                    break;
                case "failed_mr":
                    msg = "Failed Miller-Rabin primality test";
                    break;
                case "found":
                    msg = "Prime found";
                    break;
                default:
                    msg = `Stage: ${info.what}`;
            }

            if (ENVIRONMENT_IS_WORKER())
                self.sendStatusMessage(msg);
        }
    }),


    /**
     * Import private key and unlock if necessary
     *
     * @private
     * @param {string} privateKey
     * @param {string} [passphrase]
     * @returns {Object}
     */
    async _importPrivateKey(privateKey, passphrase) {
        try {
            const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
                armored: privateKey,
                opts: {
                    "no_check_keys": true
                }
            });
            if (key.is_pgp_locked()) {
                if (passphrase) {
                    await promisify(key.unlock_pgp.bind(key))({
                        passphrase
                    });
                } else {
                    throw "Did not provide passphrase with locked private key.";
                }
            }
            return key;
        } catch (err) {
            throw `Could not import private key: ${err}`;
        }
    },


    /**
     * Import public key
     *
     * @private
     * @param {string} publicKey
     * @returns {Object}
     */
    async _importPublicKey (publicKey) {
        try {
            const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
                armored: publicKey,
                opts: {
                    "no_check_keys": true
                }
            });
            return key;
        } catch (err) {
            throw `Could not import public key: ${err}`;
        }
    },


    /**
     * Generate PGP Key Pair operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runGenerateKeyPair(input, args) {
        let [keyType, keySize] = args[0].split("-"),
            password = args[1],
            name = args[2],
            email = args[3],
            userIdentifier = "";

        if (name) userIdentifier += name;
        if (email) userIdentifier += ` <${email}>`;

        let flags = kbpgp.const.openpgp.certify_keys;
        flags |= kbpgp.const.openpgp.sign_data;
        flags |= kbpgp.const.openpgp.auth;
        flags |= kbpgp.const.openpgp.encrypt_comm;
        flags |= kbpgp.const.openpgp.encrypt_storage;

        let keyGenerationOptions = {
            userid: userIdentifier,
            ecc: keyType === "ecc",
            primary: {
                "nbits": keySize,
                "flags": flags,
                "expire_in": 0
            },
            subkeys: [{
                "nbits": PGP._getSubkeySize(keySize),
                "flags": kbpgp.const.openpgp.sign_data,
                "expire_in": 86400 * 365 * 8
            }, {
                "nbits": PGP._getSubkeySize(keySize),
                "flags": kbpgp.const.openpgp.encrypt_comm | kbpgp.const.openpgp.encrypt_storage,
                "expire_in": 86400 * 365 * 2
            }],
            asp: PGP._ASP
        };

        return new Promise(async (resolve, reject) => {
            try {
                const unsignedKey = await promisify(kbpgp.KeyManager.generate)(keyGenerationOptions);
                await promisify(unsignedKey.sign.bind(unsignedKey))({});
                let signedKey = unsignedKey;
                let privateKeyExportOptions = {};
                if (password) privateKeyExportOptions.passphrase = password;
                const privateKey = await promisify(signedKey.export_pgp_private.bind(signedKey))(privateKeyExportOptions);
                const publicKey = await promisify(signedKey.export_pgp_public.bind(signedKey))({});
                resolve(privateKey + "\n" + publicKey.trim());
            } catch (err) {
                reject(`Error whilst generating key pair: ${err}`);
            }
        });
    },


    /**
     * PGP Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async runEncrypt(input, args) {
        let plaintextMessage = input,
            plainPubKey = args[0],
            key,
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
                "asp": PGP._ASP
            });
        } catch (err) {
            throw `Couldn't encrypt message with provided public key: ${err}`;
        }

        return encryptedMessage.toString();
    },


    /**
     * PGP Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async runDecrypt(input, args) {
        let encryptedMessage = input,
            privateKey = args[0],
            passphrase = args[1],
            keyring = new kbpgp.keyring.KeyRing(),
            plaintextMessage;

        if (!privateKey) return "Enter the private key of the recipient.";

        const key = await PGP._importPrivateKey(privateKey, passphrase);
        keyring.add_key_manager(key);

        try {
            plaintextMessage = await promisify(kbpgp.unbox)({
                armored: encryptedMessage,
                keyfetch: keyring,
                asp: PGP._ASP
            });
        } catch (err) {
            throw `Couldn't decrypt message with provided private key: ${err}`;
        }

        return plaintextMessage.toString();
    },


    /**
     * PGP Sign Message operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async runSign(input, args) {
        let message = input,
            privateKey = args[0],
            passphrase = args[1],
            publicKey = args[2],
            signedMessage;

        if (!privateKey) return "Enter the private key of the signer.";
        if (!publicKey) return "Enter the public key of the recipient.";
        const privKey = await PGP._importPrivateKey(privateKey, passphrase);
        const pubKey = await PGP._importPublicKey(publicKey);

        try {
            signedMessage = await promisify(kbpgp.box)({
                "msg": message,
                "encrypt_for": pubKey,
                "sign_with": privKey,
                "asp": PGP._ASP
            });
        } catch (err) {
            throw `Couldn't sign message: ${err}`;
        }

        return signedMessage;
    },


    /**
     * PGP Verify Message operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async runVerify(input, args) {
        let signedMessage = input,
            publicKey = args[0],
            privateKey = args[1],
            passphrase = args[2],
            keyring = new kbpgp.keyring.KeyRing(),
            unboxedLiterals;

        if (!publicKey) return "Enter the public key of the signer.";
        if (!privateKey) return "Enter the private key of the recipient.";
        const privKey = await PGP._importPrivateKey(privateKey, passphrase);
        const pubKey = await PGP._importPublicKey(publicKey);
        keyring.add_key_manager(privKey);
        keyring.add_key_manager(pubKey);

        try {
            unboxedLiterals = await promisify(kbpgp.unbox)({
                armored: signedMessage,
                keyfetch: keyring,
                asp: PGP._ASP
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
    },
};

export default PGP;
