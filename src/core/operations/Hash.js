import Utils from "../Utils.js";
import CryptoJS from "crypto-js";
import CryptoApi from "crypto-api";
import Checksum from "./Checksum.js";


/**
 * Hashing operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
const Hash = {

    /**
     * MD2 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMD2: function (input, args) {
        return Utils.toHexFast(CryptoApi.hash("md2", input, {}));
    },


    /**
     * MD4 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMD4: function (input, args) {
        return Utils.toHexFast(CryptoApi.hash("md4", input, {}));
    },


    /**
     * MD5 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runMD5: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input); // Cast to WordArray
        return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * SHA0 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA0: function (input, args) {
        return Utils.toHexFast(CryptoApi.hash("sha0", input, {}));
    },


    /**
     * SHA1 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA1: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.SHA1(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * SHA224 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA224: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.SHA224(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * SHA256 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA256: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * SHA384 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA384: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.SHA384(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * SHA512 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA512: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.SHA512(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * @constant
     * @default
     */
    SHA3_LENGTH: ["512", "384", "256", "224"],

    /**
     * SHA3 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSHA3: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        let sha3Length = args[0],
            options = {
                outputLength: parseInt(sha3Length, 10)
            };
        return CryptoJS.SHA3(input, options).toString(CryptoJS.enc.Hex);
    },


    /**
     * RIPEMD-160 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRIPEMD160: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        return CryptoJS.RIPEMD160(input).toString(CryptoJS.enc.Hex);
    },


    /**
     * @constant
     * @default
     */
    HMAC_FUNCTIONS: ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512", "SHA3", "RIPEMD-160"],

    /**
     * HMAC operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runHMAC: function (input, args) {
        const hashFunc = args[1];
        input = CryptoJS.enc.Latin1.parse(input);
        const execute = {
            "MD5": CryptoJS.HmacMD5(input, args[0]),
            "SHA1": CryptoJS.HmacSHA1(input, args[0]),
            "SHA224": CryptoJS.HmacSHA224(input, args[0]),
            "SHA256": CryptoJS.HmacSHA256(input, args[0]),
            "SHA384": CryptoJS.HmacSHA384(input, args[0]),
            "SHA512": CryptoJS.HmacSHA512(input, args[0]),
            "SHA3": CryptoJS.HmacSHA3(input, args[0]),
            "RIPEMD-160": CryptoJS.HmacRIPEMD160(input, args[0]),
        };
        return execute[hashFunc].toString(CryptoJS.enc.Hex);
    },


    /**
     * Generate all hashes operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAll: function (input, args) {
        let byteArray = Utils.strToByteArray(input),
            output = "MD2:         " + Hash.runMD2(input, []) +
                "\nMD4:         " + Hash.runMD4(input, []) +
                "\nMD5:         " + Hash.runMD5(input, []) +
                "\nSHA0:        " + Hash.runSHA0(input, []) +
                "\nSHA1:        " + Hash.runSHA1(input, []) +
                "\nSHA2 224:    " + Hash.runSHA224(input, []) +
                "\nSHA2 256:    " + Hash.runSHA256(input, []) +
                "\nSHA2 384:    " + Hash.runSHA384(input, []) +
                "\nSHA2 512:    " + Hash.runSHA512(input, []) +
                "\nSHA3 224:    " + Hash.runSHA3(input, ["224"]) +
                "\nSHA3 256:    " + Hash.runSHA3(input, ["256"]) +
                "\nSHA3 384:    " + Hash.runSHA3(input, ["384"]) +
                "\nSHA3 512:    " + Hash.runSHA3(input, ["512"]) +
                "\nRIPEMD-160:  " + Hash.runRIPEMD160(input, []) +
                "\n\nChecksums:" +
                "\nFletcher-8:  " + Checksum.runFletcher8(byteArray, []) +
                "\nFletcher-16: " + Checksum.runFletcher16(byteArray, []) +
                "\nFletcher-32: " + Checksum.runFletcher32(byteArray, []) +
                "\nFletcher-64: " + Checksum.runFletcher64(byteArray, []) +
                "\nAdler-32:    " + Checksum.runAdler32(byteArray, []) +
                "\nCRC-32:      " + Checksum.runCRC32(byteArray, []);

        return output;
    },


    /**
     * Analyse hash operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAnalyse: function(input, args) {
        input = input.replace(/\s/g, "");

        let output = "",
            byteLength = input.length / 2,
            bitLength = byteLength * 8,
            possibleHashFunctions = [];

        if (!/^[a-f0-9]+$/i.test(input)) {
            return "Invalid hash";
        }

        output += "Hash length: " + input.length + "\n" +
            "Byte length: " + byteLength + "\n" +
            "Bit length:  " + bitLength + "\n\n" +
            "Based on the length, this hash could have been generated by one of the following hashing functions:\n";

        switch (bitLength) {
            case 4:
                possibleHashFunctions = [
                    "Fletcher-4",
                    "Luhn algorithm",
                    "Verhoeff algorithm",
                ];
                break;
            case 8:
                possibleHashFunctions = [
                    "Fletcher-8",
                ];
                break;
            case 16:
                possibleHashFunctions = [
                    "BSD checksum",
                    "CRC-16",
                    "SYSV checksum",
                    "Fletcher-16"
                ];
                break;
            case 32:
                possibleHashFunctions = [
                    "CRC-32",
                    "Fletcher-32",
                    "Adler-32",
                ];
                break;
            case 64:
                possibleHashFunctions = [
                    "CRC-64",
                    "RIPEMD-64",
                    "SipHash",
                ];
                break;
            case 128:
                possibleHashFunctions = [
                    "MD5",
                    "MD4",
                    "MD2",
                    "HAVAL-128",
                    "RIPEMD-128",
                    "Snefru",
                    "Tiger-128",
                ];
                break;
            case 160:
                possibleHashFunctions = [
                    "SHA-1",
                    "SHA-0",
                    "FSB-160",
                    "HAS-160",
                    "HAVAL-160",
                    "RIPEMD-160",
                    "Tiger-160",
                ];
                break;
            case 192:
                possibleHashFunctions = [
                    "Tiger",
                    "HAVAL-192",
                ];
                break;
            case 224:
                possibleHashFunctions = [
                    "SHA-224",
                    "SHA3-224",
                    "ECOH-224",
                    "FSB-224",
                    "HAVAL-224",
                ];
                break;
            case 256:
                possibleHashFunctions = [
                    "SHA-256",
                    "SHA3-256",
                    "BLAKE-256",
                    "ECOH-256",
                    "FSB-256",
                    "GOST",
                    "Grøstl-256",
                    "HAVAL-256",
                    "PANAMA",
                    "RIPEMD-256",
                    "Snefru",
                ];
                break;
            case 320:
                possibleHashFunctions = [
                    "RIPEMD-320",
                ];
                break;
            case 384:
                possibleHashFunctions = [
                    "SHA-384",
                    "SHA3-384",
                    "ECOH-384",
                    "FSB-384",
                ];
                break;
            case 512:
                possibleHashFunctions = [
                    "SHA-512",
                    "SHA3-512",
                    "BLAKE-512",
                    "ECOH-512",
                    "FSB-512",
                    "Grøstl-512",
                    "JH",
                    "MD6",
                    "Spectral Hash",
                    "SWIFFT",
                    "Whirlpool",
                ];
                break;
            case 1024:
                possibleHashFunctions = [
                    "Fowler-Noll-Vo",
                ];
                break;
            default:
                possibleHashFunctions = [
                    "Unknown"
                ];
                break;
        }

        return output + possibleHashFunctions.join("\n");
    },

};

export default Hash;
