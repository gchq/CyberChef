import * as kbpgp from "kbpgp";

const ECC_SIZES = ["256", "384"];
const RSA_SIZES = ["1024", "2048", "4096"];
const KEY_SIZES = RSA_SIZES.concat(ECC_SIZES);
const KEY_TYPES = ["RSA", "ECC"];

/**
 * PGP operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const PGP = {
    KEY_SIZES: KEY_SIZES,

    /**
     * Validate PGP Key Size
     * @param {string} keySize
     * @returns {Integer}
     */
    validateKeySize(keySize, keyType) {
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
     * @param {Integer} keySize
     * @returns {Integer}
     */
    getSubkeySize(keySize) {
	return {
	    1024: 1024,
	    2048: 1024,
	    4096: 2048,
	    256:   256,
	    384:   256,
	}[keySize]
    },


    KEY_TYPES: KEY_TYPES,

    /**
     * Validate PGP Key Type
     * @param {string} keyType
     * @returns {string}
     */
    validateKeyType(keyType) {
        if (KEY_TYPES.indexOf(keyType) >= 0) return keyType.toLowerCase();
	throw `Invalid key type ${keyType}, must be in ${JSON.stringify(KEY_TYPES)}`;
    },

    /**
     * Generate PGP Key Pair operation.
     *
     * @author tlwr [toby@toby.codes]
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
	
	keyType = PGP.validateKeyType(keyType);
	keySize = PGP.validateKeySize(keySize, keyType);

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
	        nbits: PGP.getSubkeySize(keySize),
		flags: kbpgp.const.openpgp.sign_data,
		expire_in: 86400 * 365 * 8 // 8 years from kbpgp defaults
	    }, {
	        nbits: PGP.getSubkeySize(keySize),
		flags: kbpgp.const.openpgp.encrypt_comm | kbpgp.const.openpgp.encrypt_storage,
		expire_in: 86400 * 365 * 2 // 2 years from kbpgp defaults
	    }],
	};

	return new Promise((resolve, reject) => {
	    kbpgp.KeyManager.generate(keyGenerationOptions, (genErr, unsignedKey) => {
		if (genErr) {
		    return reject(`Error from kbpgp whilst generating key: ${genErr}`);
		}

		unsignedKey.sign({}, signErr => {
		    let signedKey = unsignedKey;
		    if (signErr) {
		        return reject(`Error from kbpgp whilst signing the generated key: ${signErr}`);
		    }

		    let privateKeyExportOptions = {};
		    if (password) privateKeyExportOptions.passphrase = password;

		    signedKey.export_pgp_private(privateKeyExportOptions, (privateExportErr, privateKey) => {
		        if (privateExportErr) {
		            return reject(`Error from kbpgp whilst exporting the private part of the signed key: ${privateExportErr}`);
			}

			signedKey.export_pgp_public({}, (publicExportErr, publicKey) => {
		            if (publicExportErr) {
		                return reject(`Error from kbpgp whilst exporting the public part of the signed key: ${publicExportErr}`);
			    }

			    return resolve(privateKey + "\n" + publicKey);
			});
		    });

		});
	    })
	});
    },

};

export default PGP;
