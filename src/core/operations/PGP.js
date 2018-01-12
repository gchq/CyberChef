/*eslint camelcase: ["error", {properties: "never"}]*/
import * as kbpgp from "kbpgp";
import promisify from "es6-promisify";

const ECC_SIZES = ["256", "384"];
const RSA_SIZES = ["1024", "2048", "4096"];
const KEY_SIZES = RSA_SIZES.concat(ECC_SIZES);
const KEY_TYPES = ["RSA", "ECC"];

/**
 * PGP operations.
 *
 * @author tlwr [toby@toby.codes]
 * @author Matt C [matt@artemisbot.uk]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const PGP = {
    KEY_SIZES: KEY_SIZES,

    /**
     * Validate PGP Key Size
     * 
     * @private
     * @param {string} keySize
     * @returns {Integer}
     */
    _validateKeySize(keySize, keyType) {
        if (KEY_SIZES.indexOf(keySize) < 0) {
            throw `Invalid key size ${keySize}, must be in ${JSON.stringify(KEY_SIZES)}`;
        }

        if (keyType === "ecc") {
            if (ECC_SIZES.indexOf(keySize) >= 0) {
                return parseInt(keySize, 10);
            } else {
                throw `Invalid key size ${keySize}, must be in ${JSON.stringify(ECC_SIZES)} for ECC`;
            }
        } else {
            if (RSA_SIZES.indexOf(keySize) >= 0) {
                return parseInt(keySize, 10);
            } else {
                throw `Invalid key size ${keySize}, must be in ${JSON.stringify(RSA_SIZES)} for RSA`;
            }
        }
    },

    /**
     * Get size of subkey
     * 
     * @private
     * @param {Integer} keySize
     * @returns {Integer}
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


    KEY_TYPES: KEY_TYPES,

    /**
     * Validate PGP Key Type
     * 
     * @private
     * @param {string} keyType
     * @returns {string}
     */
    _validateKeyType(keyType) {
        if (KEY_TYPES.indexOf(keyType) >= 0) return keyType.toLowerCase();
        throw `Invalid key type ${keyType}, must be in ${JSON.stringify(KEY_TYPES)}`;
    },

    /**
     * Import private key and unlock if necessary
     * 
     * @private
     * @param {string} privateKey
     * @param {string} [passphrase]
     * @returns {Object}
     */
    async _importPrivateKey (privateKey, passphrase) {
        try {
            const key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
                armored: privateKey,
            });
            if (key.is_pgp_locked() && passphrase) {
                if (passphrase) {
                    await promisify(key.unlock_pgp, key)({
                        passphrase
                    });
                } else if (!passphrase) {
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
        let keyType  = args[0],
            keySize  = args[1],
            password = args[2],
            name     = args[3],
            email    = args[4];

        keyType = PGP._validateKeyType(keyType);
        keySize = PGP._validateKeySize(keySize, keyType);

        let userIdentifier = "";
        if (name) userIdentifier += name;
        if (email) userIdentifier += ` <${email}>`;

        let flags = kbpgp.const.openpgp.certify_keys;
        flags = flags | kbpgp.const.openpgp.sign_data;
        flags = flags | kbpgp.const.openpgp.auth;
        flags = flags | kbpgp.const.openpgp.encrypt_comm;
        flags = flags | kbpgp.const.openpgp.encrypt_storage;

        let keyGenerationOptions = {
            userid: userIdentifier,
            ecc: keyType === "ecc",
            primary: {
                nbits: keySize,
                flags: flags,
                expire_in: 0
            },
            subkeys: [{
                nbits: PGP._getSubkeySize(keySize),
                flags: kbpgp.const.openpgp.sign_data,
                expire_in: 86400 * 365 * 8
            }, {
                nbits: PGP._getSubkeySize(keySize),
                flags: kbpgp.const.openpgp.encrypt_comm | kbpgp.const.openpgp.encrypt_storage,
                expire_in: 86400 * 365 * 2
            }],
        };
        return new Promise(async (resolve, reject) => {
            try {
                const unsignedKey = await promisify(kbpgp.KeyManager.generate)(keyGenerationOptions);
                await promisify(unsignedKey.sign, unsignedKey)({});
                let signedKey = unsignedKey;
                let privateKeyExportOptions = {};
                if (password) privateKeyExportOptions.passphrase = password;
                const privateKey = await promisify(signedKey.export_pgp_private, signedKey)(privateKeyExportOptions);
                const publicKey = await promisify(signedKey.export_pgp_public, signedKey)({});
                resolve(privateKey + "\n" + publicKey);
            } catch (err) {
                reject(`Error from kbpgp whilst generating key pair: ${err}`);
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
            plainPubKey      = args[0];

        let key, encryptedMessage;

        try {
            key = await promisify(kbpgp.KeyManager.import_from_armored_pgp)({
                armored: plainPubKey,
            });
        } catch (err) {
            throw `Could not import public key: ${err}`;
        }

        try {
            encryptedMessage = await promisify(kbpgp.box)({
                msg:         plaintextMessage,
                encrypt_for: key,
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
            privateKey  = args[0],
            passphrase = args[1],
            keyring          = new kbpgp.keyring.KeyRing();

        let plaintextMessage;
        const key = await PGP._importPrivateKey(privateKey, passphrase);
        keyring.add_key_manager(key);

        try {
            plaintextMessage = await promisify(kbpgp.unbox)({
                armored: encryptedMessage,
                keyfetch: keyring,
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
            privateKey  = args[0],
            passphrase = args[1],
            publicKey = args[2];

        let signedMessage;
        const privKey = await PGP._importPrivateKey(privateKey, passphrase);
        const pubKey = await PGP._importPublicKey(publicKey);

        try {
            signedMessage = await promisify(kbpgp.box)({
                msg: message,
                encrypt_for: pubKey,
                sign_with: privKey
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
            publicKey  = args[0],
            privateKey = args[1],
            passphrase = args[2],
            keyring    = new kbpgp.keyring.KeyRing();

        let unboxedLiterals;
        const privKey = await PGP._importPrivateKey(privateKey, passphrase);
        const pubKey = await PGP._importPublicKey(publicKey);
        keyring.add_key_manager(privKey);
        keyring.add_key_manager(pubKey);

        try {
            unboxedLiterals = await promisify(kbpgp.unbox)({
                armored:  signedMessage,
                keyfetch: keyring
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
                        "----------------------------------"
                    ].join("\n");
                    text += unboxedLiterals.toString();
                    return text.trim();
                }
            }
        } catch (err) {
            throw `Couldn't verify message: ${err}`;
        }
    },
};

export default PGP;
