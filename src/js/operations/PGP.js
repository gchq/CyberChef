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
     * @constant
     * @default
     */
    ARMOR_TYPES: [
        "Message",
        "Public key",
        "Private key",
    ],


    /**
     * @constant
     * @default
     */
    ARMOR_TYPE_MAPPING: {
        "Message": 3,
        "Public key": 4,
        "Private key": 5,
    },


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
                var publicKeys = openpgp.key.readArmored(publicKey).keys;
            } catch (err) {
                return reject("Cannot read public key: " + err);
            }

            var options = {
                data: plaintext,
                publicKeys: publicKeys,
            };

            openpgp.encrypt(options)
                .then(function(ciphertext) {
                    resolve(ciphertext.data);
                })
                .catch(function(err) {
                    reject("Could not encrypt text: " + err);
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
            } catch (err) {
                return reject("Cannot read private key: " + err);
            }

            try {
                var message = openpgp.message.readArmored(input);
            } catch (err) {
                return reject("Cannot read message: " + err);
            }

            var options = {
                message: message,
                privateKey: privateKey,
            };

            try {
                if (password) {
                    privateKey.decrypt(password);
                }
            } catch (err) {
                return reject("Cannot decrypt password: " + err);
            }

            openpgp.decrypt(options)
                .then(function(plaintext) {
                    resolve(plaintext.data);
                })
                .catch(function(err) {
                    reject("Could not decrypt message: " + err);
                });
        });
    },


    /**
     * Signs the input using PGP.
     *
     * @param {string} input - data to be signed
     * @param {Object[]} args
     * @returns {string}
     */
    runSign: function (input, args) {
        var publicKey = args[0],
            privateKey = args[1],
            password = args[2];

        return new Promise(function(resolve, reject) {
            try {
                var publicKeys = openpgp.key.readArmored(publicKey).keys;
            } catch (err) {
                return reject("Could not read public key: " + err);
            }

            try {
                var privateKeys = openpgp.key.readArmored(privateKey).keys;
            } catch (err) {
                return reject("Could not read private key: " + err);
            }

            try {
                if (password) {
                    privateKeys[0].decrypt(password);
                }
            } catch (err) {
                return reject("Cannot decrypt password: " + err);
            }

            var options = {
                data: input,
                publicKeys: publicKeys,
                privateKeys: privateKeys,
            };

            openpgp.encrypt(options)
                .then(function(signedData) {
                    resolve(signedData.data);
                })
                .catch(function(err) {
                    reject("Could not sign input: " + err);
                });
        });
    },


    /**
     * Verifies the signed input using PGP.
     *
     * @param {string} input - signed input to verify
     * @param {Object[]} args
     * @returns {string} - "true" or "false" depending on the validity of the signature
     */
    runVerify: function (input, args) {
        var publicKey = args[0],
            privateKey = args[1],
            password = args[2],
            displayDecrypt = args[3];

        return new Promise(function(resolve, reject) {
            try {
                var publicKeys = openpgp.key.readArmored(publicKey).keys;
            } catch (err) {
                return reject("Could not read public key: " + err);
            }

            try {
                var privateKeys = openpgp.key.readArmored(privateKey).keys;
            } catch (err) {
                return reject("Could not read private key: " + err);
            }

            try {
                if (password) {
                    privateKeys[0].decrypt(password);
                }
            } catch (err) {
                return reject("Cannot decrypt password: " + err);
            }

            try {
                var message = openpgp.message.readArmored(input);
            } catch (err) {
                return reject("Could not read encrypted message: " + err);
            }

            var verification = {
                verified: false,
                author: publicKeys[0].users[0].userId.userid,
                recipient: privateKeys[0].users[0].userId.userid,
                date: "",
                keyID: "",
                message: "",
            };

            openpgp.decrypt({
                message: message,
                publicKeys: publicKeys,
                privateKey: privateKeys[0],
            })
                .then(function(decrypted) {
                    if (decrypted.signatures) {
                        // valid is either true or null, casting required.
                        verification.verified = !!decrypted.signatures[0].valid;
                        verification.keyID = decrypted.signatures[0].keyid.toHex();
                    }

                    resolve([
                        "Verified: " + verification.verified,
                        "Key ID: " + verification.keyID,
                        "Encrypted for: " + verification.recipient,
                        "Signed on: " + verification.date,
                        "Signed by: " + verification.author,
                        "Signed with: ",
                        "\n",
                        displayDecrypt ? decrypted.data : "",
                    ].join("\n"));

                })
                .catch(function(err) {
                    reject("Could not decrypt and verify message: " + err);
                });
        });
    },


    /**
     * Clearsigns the input using PGP.
     *
     * @param {string} input - data to be signed
     * @param {Object[]} args
     * @returns {string}
     */
    runSignCleartext: function (input, args) {
        var privateKey = args[0],
            password = args[1];


        return new Promise(function(resolve, reject) {
            var privateKeys = openpgp.key.readArmored(privateKey).keys;

            try {
                if (password) {
                    privateKeys[0].decrypt(password);
                }
            } catch (err) {
                return reject("Cannot decrypt password: " + err);
            }

            var options = {
                data: input,
                privateKeys: privateKeys,
            };

            openpgp.sign(options)
                .then(function(signedData) {
                    resolve(signedData.data);
                })
                .catch(function(err) {
                    reject("Could not clearsign input: " + err);
                });
        });
    },


    /**
     * Verifies the clearsigned input using PGP.
     *
     * @param {string} input - signed input to verify
     * @param {Object[]} args
     * @returns {string} - "true" or "false" depending on the validity of the signature
     */
    runVerifyCleartext: function (input, args) {
        var publicKey = args[0],
            displayDecrypt = args[1];

        return new Promise(function(resolve, reject) {

            try {
                var publicKeys = openpgp.key.readArmored(publicKey).keys;
            } catch (err) {
                return reject("Could not read public key: " + err);
            }

            try {
                var message = openpgp.cleartext.readArmored(input);
            } catch (err) {
                return reject("Could not read input message: " + err);
            }

            var verification = {
                verified: false,
                author: publicKeys[0].users[0].userId.userid,
                date: "",
                keyID: "",
                message: message.text,
            };

            openpgp.verify({
                message: message,
                publicKeys: publicKeys,
            })
                .then(function(verifiedData) {

                    if (verifiedData.signatures) {
                        // valid is either true or null, casting required.
                        verification.verified = !!verifiedData.signatures[0].valid;
                        verification.keyID = verifiedData.signatures[0].keyid.toHex();
                    }

                    resolve([
                        "Verified: " + verification.verified,
                        "Key ID: " + verification.keyID,
                        "Signed on: " + verification.date,
                        "Signed by: " + verification.author,
                        "Signed with: ",
                        "\n",
                        displayDecrypt ? verification.message : "",
                    ].join("\n"));
                })
                .catch(function(err) {
                    reject("Could not verify message: " + err);
                });
        });
    },


    /**
     * Generates a PGP key pair.
     *
     * @param {string} input is ignored
     * @param {Object[]} args
     * @returns {string} - armored public key and private key separated by whitespace.
     */
    runGenKeyPair: function (input, args) {
        var password = args[0],
            keySize = parseInt(args[1], 10),
            name = args[2],
            email = args[3];

        return new Promise(function(resolve, reject) {
            var options = {
                numBits: keySize,
                userIds: [{name: name, email: email}],
            };

            if (password) {
                options.password = password;
            }

            openpgp.generateKey(options)
                .then(function(key) {
                    var output = [
                        key.publicKeyArmored,
                        key.privateKeyArmored,
                    ].join(""); // Preceding and trailing newlines are already generated.
                    resolve(output);
                })
                .catch(function(err) {
                    reject("Could not generate key pair: " + err);
                });
        });
    },


    /**
     * Turns raw PGP bytes into an ASCII armored string.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string} - armored public key and private key separated by whitespace.
     */
    runAddArmor: function (input, args) {
        var armorType = PGP.ARMOR_TYPE_MAPPING[args[0]];
        return openpgp.armor.encode(armorType, input);
    },


    /**
     * Turns an ASCII armored string into raw PGP bytes.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray} - armored public key and private key separated by whitespace.
     */
    runRemoveArmor: function (input, args) {
        var decoded = openpgp.armor.decode(input);
        var uint8bytes = decoded.data;
        var bytes = Array.prototype.slice.call(uint8bytes);
        return bytes;
    },
};