/* globals openpgp */

/**
 * PGP operations.
 *
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var PGP = {


    /**
     * Encrypts the input using PGP.
     *
     * @param {string} input - plaintext to encrypt
     * @param {Object[]} args
     * @returns {string}
     */
    runEncrypt: function (plaintext, args) {
        var publicKey = args[0];

        return new Promise(function(resolve, reject) {
            try {
                var options = {
                    data: plaintext,
                    publicKeys: openpgp.key.readArmored(publicKey).keys,
                };
            } catch (error) {
                reject("Failed to read public key", error);
            }

            openpgp.encrypt(options)
                .then(function(ciphertext) {
                    resolve(ciphertext.data);
                })
                .catch(function(error) {
                    reject("Failed to encrypt input", error);
                });
        });
    },


    /**
     * Decrypts the input using PGP.
     *
     * @param {string} input - ciphertext to decrypt
     * @param {Object[]} args
     * @returns {string}
     */
    runDecrypt: function (input, args) {
        var privateKey = args[0],
            password = args[1];


        return new Promise(function(resolve, reject) {
            try {
                privateKey = openpgp.key.readArmored(privateKey).keys[0];
            } catch (error) {
                reject("Failed to read private key", error);
            }

            try {
                if (password && password.length) {
                    privateKey.decrypt(password);
                }
            } catch (error) {
                reject("Failed to decrypt private key", error);
            }

            try {
                var options = {
                    message: openpgp.message.readArmored(input),
                    privateKey: privateKey,
                };
            } catch (error) {
                reject("Failed to read input message", error);
            }

            openpgp.decrypt(options)
                .then(function(plaintext) {
                    resolve(plaintext.data);
                })
                .catch(function(error) {
                    reject("Failed to encrypt input", error);
                });
        });
    },
};
