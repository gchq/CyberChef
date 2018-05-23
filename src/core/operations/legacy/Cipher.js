import Utils from "../Utils.js";
import forge from "imports-loader?jQuery=>null!node-forge/dist/forge.min.js";
import BigNumber from "bignumber.js";


/**
 * Cipher operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Cipher = {

    /**
     * @constant
     * @default
     */
    IO_FORMAT1: ["Hex", "UTF8", "Latin1", "Base64"],
    /**
    * @constant
    * @default
    */
    IO_FORMAT2: ["UTF8", "Latin1", "Hex", "Base64"],
    /**
    * @constant
    * @default
    */
    IO_FORMAT3: ["Raw", "Hex"],
    /**
    * @constant
    * @default
    */
    IO_FORMAT4: ["Hex", "Raw"],


    /**
     * RC2 Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRc2Enc: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            inputType = args[2],
            outputType = args[3],
            cipher = forge.rc2.createEncryptionCipher(key);

        input = Utils.convertToByteString(input, inputType);

        cipher.start(iv || null);
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    },


    /**
     * RC2 Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRc2Dec: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteString(args[1].string, args[1].option),
            inputType = args[2],
            outputType = args[3],
            decipher = forge.rc2.createDecryptionCipher(key);

        input = Utils.convertToByteString(input, inputType);

        decipher.start(iv || null);
        decipher.update(forge.util.createBuffer(input));
        decipher.finish();

        return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
    },


    /**
     * @constant
     * @default
     */
    KDF_KEY_SIZE: 128,
    /**
     * @constant
     * @default
     */
    KDF_ITERATIONS: 1,
    /**
     * @constant
     * @default
     */
    HASHERS: ["SHA1", "SHA256", "SHA384", "SHA512", "MD5"],

    /**
     * Derive PBKDF2 key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runPbkdf2: function (input, args) {
        const passphrase = Utils.convertToByteString(args[0].string, args[0].option),
            keySize = args[1],
            iterations = args[2],
            hasher = args[3],
            salt = Utils.convertToByteString(args[4].string, args[4].option) ||
                forge.random.getBytesSync(keySize),
            derivedKey = forge.pkcs5.pbkdf2(passphrase, salt, iterations, keySize / 8, hasher.toLowerCase());

        return forge.util.bytesToHex(derivedKey);
    },


    /**
     * @constant
     * @default
     */
    PRNG_BYTES: 32,
    /**
     * @constant
     * @default
     */
    PRNG_OUTPUT: ["Hex", "Integer", "Byte array", "Raw"],

    /**
     * Pseudo-Random Number Generator operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runPRNG: function(input, args) {
        const numBytes = args[0],
            outputAs = args[1];

        let bytes;

        if (ENVIRONMENT_IS_WORKER() && self.crypto) {
            bytes = self.crypto.getRandomValues(new Uint8Array(numBytes));
            bytes = Utils.arrayBufferToStr(bytes.buffer);
        } else {
            bytes = forge.random.getBytesSync(numBytes);
        }

        let value = new BigNumber(0),
            i;

        switch (outputAs) {
            case "Hex":
                return forge.util.bytesToHex(bytes);
            case "Integer":
                for (i = bytes.length - 1; i >= 0; i--) {
                    value = value.times(256).plus(bytes.charCodeAt(i));
                }
                return value.toFixed();
            case "Byte array":
                return JSON.stringify(Utils.strToCharcode(bytes));
            case "Raw":
            default:
                return bytes;
        }
    },

};

export default Cipher;
