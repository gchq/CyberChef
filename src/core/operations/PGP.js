import * as openpgp from "openpgp";
import Utils from "../Utils.js";

/**
 * PGP operations.
 *
 * @author tlwr [toby@toby.codes]
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
    ARMOUR_TYPES: [
        "Message",
        "Public key",
        "Private key",
    ],


    /**
     * @constant
     * @default
     */
    ARMOUR_TYPE_MAPPING: {
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
        let publicKey = args[0],
            publicKeys;

        try {
            publicKeys = openpgp.key.readArmored(publicKey).keys;
        } catch (err) {
            throw "Cannot read public key: " + err;
        }

        let options = {
            data: plaintext,
            publicKeys: publicKeys,
        };

        return openpgp.encrypt(options)
        .then(ciphertext => ciphertext.data)
        .catch(function(err) {
            throw "Could not encrypt text: " + err;
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
        let privateKey = args[0],
            password = args[1],
            message;

        try {
            privateKey = openpgp.key.readArmored(privateKey).keys[0];
        } catch (err) {
            throw "Cannot read private key: " + err;
        }

        try {
            message = openpgp.message.readArmored(input);
        } catch (err) {
            throw "Cannot read message: " + err;
        }

        let options = {
            message: message,
            privateKey: privateKey,
        };

        if (password) {
            privateKey.decrypt(password);
        }
        if (privateKey.primaryKey.encrypted !== null) {
            throw "Could not decrypt private key.";
        }

        return openpgp.decrypt(options)
        .then(plaintext => plaintext.data)
        .catch(function(err) {
            throw "Could not decrypt message: " + err;
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
        let publicKey = args[0],
            privateKey = args[1],
            password = args[2],
            publicKeys,
            privateKeys;

        try {
            publicKeys = openpgp.key.readArmored(publicKey).keys;
        } catch (err) {
            throw "Could not read public key: " + err;
        }

        try {
            privateKeys = openpgp.key.readArmored(privateKey).keys;
        } catch (err) {
            throw "Could not read private key: " + err;
        }

        if (password) {
            privateKeys[0].decrypt(password);
        }
        if (privateKeys[0].primaryKey.encrypted !== null) {
            throw "Could not decrypt private key.";
        }

        let options = {
            data: input,
            publicKeys: publicKeys,
            privateKeys: privateKeys,
        };

        return openpgp.encrypt(options)
        .then(signedData => signedData.data)
        .catch(function(err) {
            throw "Could not sign input: " + err;
        });
    },


    /**
     * Verifies the signed input using PGP.
     *
     * @param {string} input - signed input to verify
     * @param {Object[]} args
     * @returns {string} - the original message, and a summary of the verification process
     */
    runVerify: function (input, args) {
        let publicKey = args[0],
            privateKey = args[1],
            password = args[2],
            publicKeys,
            privateKeys,
            message;

        try {
            publicKeys = openpgp.key.readArmored(publicKey).keys;
        } catch (err) {
            throw "Could not read public key: " + err;
        }

        try {
            privateKeys = openpgp.key.readArmored(privateKey).keys;
        } catch (err) {
            throw "Could not read private key: " + err;
        }

        if (password) {
            privateKeys[0].decrypt(password);
        }
        if (privateKeys[0].primaryKey.encrypted !== null) {
            throw "Could not decrypt private key.";
        }

        try {
            message = openpgp.message.readArmored(input);
        } catch (err) {
            throw "Could not read encrypted message: " + err;
        }

        let packetContainingAlgorithms = message.packets.filterByTag(
            openpgp.enums.packet.publicKeyEncryptedSessionKey
        )[0];

        let verification = {
            verified: false,
            pkAlgorithm: packetContainingAlgorithms.publicKeyAlgorithm,
            sessionAlgorithm: packetContainingAlgorithms.sessionKeyAlgorithm,
            author: publicKeys[0].users[0].userId.userid,
            recipient: privateKeys[0].users[0].userId.userid,
            keyID: "",
            message: "",
        };

        return openpgp.decrypt({
            message: message,
            publicKeys: publicKeys,
            privateKey: privateKeys[0],
        })
        .then(decrypted => {
            if (decrypted.signatures) {
                // valid is either true or null, casting required.
                verification.verified = !!decrypted.signatures[0].valid;
                verification.keyID = decrypted.signatures[0].keyid.toHex();
            }

            return [
                "Verified: " + verification.verified,
                "Key ID: " + verification.keyID,
                "Encrypted for: " + verification.recipient,
                "Signed by: " + verification.author,
                "Signed with: " +
                verification.pkAlgorithm +
                "/" +
                verification.sessionAlgorithm,
                "\n",
                decrypted.data,
            ].join("\n");

        })
        .catch(function(err) {
            throw "Could not decrypt and verify message: " + err;
        });
    },


    /**
     * Signs the input using PGP and outputs the plaintext, the raw PGP signature, and the ASCII armoured signature files.
     *
     * @param {string} input - data to be signed
     * @param {Object[]} args
     * @returns {HTML} - HTML file display of message, armoured signature, and bytes signature
     */
    runSignDetached: function (input, args) {
        let privateKey = args[0],
            password = args[1],
            privateKeys;

        try {
            privateKeys = openpgp.key.readArmored(privateKey).keys;
        } catch (err) {
            throw "Could not read private key: " + err;
        }

        if (password) {
            privateKeys[0].decrypt(password);
        }
        if (privateKeys[0].primaryKey.encrypted !== null) {
            throw "Could not decrypt private key.";
        }

        let bytes = openpgp.util.str2Uint8Array(input);
        let message = openpgp.message.fromBinary(bytes);

        let signedMessage = message.sign(privateKeys);
        let signature = signedMessage.packets.filterByTag(openpgp.enums.packet.signature);
        let rawSignatureBytes = signature.write();

        let armouredMessage = openpgp.armor.encode(
            openpgp.enums.armor.message,
            rawSignatureBytes
        );
        armouredMessage = armouredMessage.replace(
            "-----BEGIN PGP MESSAGE-----\r\n",
            "-----BEGIN PGP SIGNATURE-----\r\n"
        );
        armouredMessage = armouredMessage.replace(
            "-----END PGP MESSAGE-----\r\n",
            "-----END PGP SIGNATURE-----\r\n"
        );

        let files = [{
            fileName: "msg",
            size: input.length,
            contents: input,
            bytes: bytes,
        }, {
            fileName: "msg.asc",
            size: armouredMessage.length,
            contents: armouredMessage,
            bytes: openpgp.util.str2Uint8Array(armouredMessage),
        }, {
            fileName: "msg.sig",
            size: rawSignatureBytes.length,
            contents: openpgp.util.Uint8Array2str(rawSignatureBytes),
            bytes: rawSignatureBytes,
        }];

        return Utils.displayFilesAsHTML(files);
    },


    /**
     * Verifies the detached signature and input using PGP.
     *
     * @param {string} input - signed input to verify
     * @param {Object[]} args
     * @returns {string} - the original message, and a summary of the verification process
     */
    runVerifyDetached: function (input, args) {
        let publicKey = args[0],
            armouredSignature = args[1],
            publicKeys,
            message;

        try {
            publicKeys = openpgp.key.readArmored(publicKey).keys;
        } catch (err) {
            throw "Could not read public key: " + err;
        }

        try {
            message = openpgp.message.readSignedContent(
                input,
                armouredSignature
            );
        } catch (err) {
            throw "Could not read armoured signature or message: " + err;
        }

        let packetContainingSignature = message.packets.filterByTag(
            openpgp.enums.packet.signature
        )[0];

        let verification = {
            verified: false,
            pkAlgorithm: publicKeys[0].primaryKey.algorithm,
            author: publicKeys[0].users[0].userId.userid,
            date: packetContainingSignature.created,
            keyID: "",
            message: "",
        };

        return Promise.resolve(message.verify(publicKeys))
        .then(function(signatures) {
            if (signatures && signatures.length) {
                verification.verified = !!signatures[0].valid;
                verification.keyID = signatures[0].keyid.toHex();
            }

            return [
                "Verified: " + verification.verified,
                "Key ID: " + verification.keyID,
                "Signed on: " + verification.date,
                "Signed by: " + verification.author,
                "Signed with: " + verification.pkAlgorithm,
                "\n",
                input,
            ].join("\n");

        })
        .catch(function(err) {
            throw "Could not verify message: " + err;
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
        let privateKey = args[0],
            password = args[1],
            privateKeys;

        try {
            privateKeys = openpgp.key.readArmored(privateKey).keys;
        } catch (err) {
            throw "Could not read private key: " + err;
        }

        if (password) {
            privateKeys[0].decrypt(password);
        }
        if (privateKeys[0].primaryKey.encrypted !== null) {
            throw "Could not decrypt private key.";
        }

        let options = {
            data: input,
            privateKeys: privateKeys,
        };

        return openpgp.sign(options)
        .then(signedData => signedData.data)
        .catch(function(err) {
            throw "Could not clearsign input: " + err;
        });
    },


    /**
     * Verifies the clearsigned input using PGP.
     *
     * @param {string} input - signed input to verify
     * @param {Object[]} args
     * @returns {string} - the original message, and a summary of the verification process
     */
    runVerifyCleartext: function (input, args) {
        let publicKey = args[0],
            publicKeys,
            message;

        try {
            publicKeys = openpgp.key.readArmored(publicKey).keys;
        } catch (err) {
            throw "Could not read public key: " + err;
        }

        try {
            message = openpgp.cleartext.readArmored(input);
        } catch (err) {
            throw "Could not read input message: " + err;
        }

        let packetContainingSignature = message.packets.filterByTag(
            openpgp.enums.packet.signature
        )[0];

        let verification = {
            verified: false,
            pkAlgorithm: publicKeys[0].primaryKey.algorithm,
            author: publicKeys[0].users[0].userId.userid,
            date: packetContainingSignature.created,
            keyID: "",
            message: message.text,
        };

        return openpgp.verify({
            message: message,
            publicKeys: publicKeys,
        })
        .then(verifiedData => {
            if (verifiedData.signatures) {
                // valid is either true or null, casting required.
                verification.verified = !!verifiedData.signatures[0].valid;
                verification.keyID = verifiedData.signatures[0].keyid.toHex();
            }

            return [
                "Verified: " + verification.verified,
                "Key ID: " + verification.keyID,
                "Signed on: " + verification.date,
                "Signed by: " + verification.author,
                "Signed with: " + verification.pkAlgorithm,
                "\n",
                verification.message,
            ].join("\n");
        })
        .catch(function(err) {
            throw "Could not verify message: " + err;
        });
    },


    /**
     * Generates a PGP key pair.
     *
     * @param {string} input is ignored
     * @param {Object[]} args
     * @returns {string} - armoured public key and private key separated by whitespace.
     */
    runGenKeyPair: function (input, args) {
        let password = args[0],
            keySize = parseInt(args[1], 10),
            name = args[2],
            email = args[3];

        let options = {
            numBits: keySize,
            userIds: [{name: name, email: email}],
        };

        if (password) {
            options.passphrase = password;
        }

        return openpgp.generateKey(options)
        .then(key => {
            return [
                key.publicKeyArmored,
                key.privateKeyArmored,
            ].join(""); // Preceding and trailing newlines are already generated.
        })
        .catch(function(err) {
            throw "Could not generate key pair: " + err;
        });
    },


    /**
     * Turns a PGP clearsigned message into a detached signature.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {HTML} - HTML file display of message, armoured signature, and bytes signature
     */
    runDetachClearsig: function (input, args) {
        let message;

        try {
            message = openpgp.cleartext.readArmored(input);
        } catch (err) {
            throw "Could not read input message: " + err;
        }

        let cleartext = message.getText();
        let clearbytes = openpgp.util.str2Uint8Array(cleartext);

        let signature = message.packets.filterByTag(openpgp.enums.packet.signature);
        let rawSignatureBytes = signature.write();

        let armouredMessage = openpgp.armor.encode(
            openpgp.enums.armor.message,
            rawSignatureBytes
        );
        armouredMessage = armouredMessage.replace(
            "-----BEGIN PGP MESSAGE-----\r\n",
            "-----BEGIN PGP SIGNATURE-----\r\n"
        );
        armouredMessage = armouredMessage.replace(
            "-----END PGP MESSAGE-----\r\n",
            "-----END PGP SIGNATURE-----\r\n"
        );

        let files = [{
            fileName: "msg",
            size: cleartext.length,
            contents: cleartext,
            bytes: clearbytes,
        }, {
            fileName: "msg.asc",
            size: armouredMessage.length,
            contents: armouredMessage,
            bytes: openpgp.util.str2Uint8Array(armouredMessage),
        }, {
            fileName: "msg.sig",
            size: rawSignatureBytes.length,
            contents: openpgp.util.Uint8Array2str(rawSignatureBytes),
            bytes: rawSignatureBytes,
        }];

        return Utils.displayFilesAsHTML(files);
    },


    /**
     * Turns raw PGP bytes into an ASCII armoured string.
     *
     * @param {byteArray} input
     * @param {Object[]} args
     * @returns {string} - armoured public key and private key separated by whitespace.
     */
    runAddArmour: function (input, args) {
        let armourType = PGP.ARMOUR_TYPE_MAPPING[args[0]];
        return openpgp.armor.encode(armourType, input);
    },


    /**
     * Turns an ASCII armoured string into raw PGP bytes.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {byteArray}
     */
    runRemoveArmour: function (input, args) {
        let decoded = openpgp.armor.decode(input);
        let uint8bytes = decoded.data;
        let bytes = Array.prototype.slice.call(uint8bytes);
        return bytes;
    },
};

export default PGP;
