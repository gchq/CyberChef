/* globals CryptoJS, Checksum */

/**
 * Hashing operations.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Hash = {
    
    /**
     * MD5 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_md5: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input); // Cast to WordArray
        return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
    },
    
    
    /**
     * SHA1 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_sha1: function (input, args) {
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
    run_sha224: function (input, args) {
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
    run_sha256: function (input, args) {
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
    run_sha384: function (input, args) {
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
    run_sha512: function (input, args) {
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
    run_sha3: function (input, args) {
        input = CryptoJS.enc.Latin1.parse(input);
        var sha3_length = args[0],
            options = {
                outputLength: parseInt(sha3_length, 10)
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
    run_ripemd160: function (input, args) {
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
    run_hmac: function (input, args) {
        var hash_func = args[1];
        input = CryptoJS.enc.Latin1.parse(input);
        var execute = {
            "MD5": CryptoJS.HmacMD5(input, args[0]),
            "SHA1": CryptoJS.HmacSHA1(input, args[0]),
            "SHA224": CryptoJS.HmacSHA224(input, args[0]),
            "SHA256": CryptoJS.HmacSHA256(input, args[0]),
            "SHA384": CryptoJS.HmacSHA384(input, args[0]),
            "SHA512": CryptoJS.HmacSHA512(input, args[0]),
            "SHA3": CryptoJS.HmacSHA3(input, args[0]),
            "RIPEMD-160": CryptoJS.HmacRIPEMD160(input, args[0]),
        };
        return execute[hash_func].toString(CryptoJS.enc.Hex);
    },
    
    
    /**
     * Generate all hashes operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_all: function (input, args) {
        var byte_array = Utils.str_to_byte_array(input),
            output = "MD5:         " + Hash.run_md5(input, []) +
                "\nSHA1:        " + Hash.run_sha1(input, []) +
                "\nSHA2 224:    " + Hash.run_sha224(input, []) +
                "\nSHA2 256:    " + Hash.run_sha256(input, []) +
                "\nSHA2 384:    " + Hash.run_sha384(input, []) +
                "\nSHA2 512:    " + Hash.run_sha512(input, []) +
                "\nSHA3 224:    " + Hash.run_sha3(input, ["224"]) +
                "\nSHA3 256:    " + Hash.run_sha3(input, ["256"]) +
                "\nSHA3 384:    " + Hash.run_sha3(input, ["384"]) +
                "\nSHA3 512:    " + Hash.run_sha3(input, ["512"]) +
                "\nRIPEMD-160:  " + Hash.run_ripemd160(input, []) +
                "\n\nChecksums:" +
                "\nFletcher-16: " + Checksum.run_fletcher16(byte_array, []) +
                "\nAdler-32:    " + Checksum.run_adler32(byte_array, []) +
                "\nCRC-32:      " + Checksum.run_crc32(byte_array, []);
                
        return output;
    },
    
    
    /**
     * Analyse hash operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_analyse: function(input, args) {
        input = input.replace(/\s/g, "");
    
        var output = "",
            byte_length = input.length / 2,
            bit_length = byte_length * 8,
            possible_hash_functions = [];
        
        if (!/^[a-f0-9]+$/i.test(input)) {
            return "Invalid hash";
        }
        
        output += "Hash length: " + input.length + "\n" +
            "Byte length: " + byte_length + "\n" +
            "Bit length:  " + bit_length + "\n\n" +
            "Based on the length, this hash could have been generated by one of the following hashing functions:\n";
                
        switch (bit_length) {
            case 4:
                possible_hash_functions = [
                    "Fletcher-4",
                    "Luhn algorithm",
                    "Verhoeff algorithm",
                ];
                break;
            case 8:
                possible_hash_functions = [
                    "Fletcher-8",
                ];
                break;
            case 16:
                possible_hash_functions = [
                    "BSD checksum",
                    "CRC-16",
                    "SYSV checksum",
                    "Fletcher-16"
                ];
                break;
            case 32:
                possible_hash_functions = [
                    "CRC-32",
                    "Fletcher-32",
                    "Adler-32",
                ];
                break;
            case 64:
                possible_hash_functions = [
                    "CRC-64",
                    "RIPEMD-64",
                    "SipHash",
                ];
                break;
            case 128:
                possible_hash_functions = [
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
                possible_hash_functions = [
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
                possible_hash_functions = [
                    "Tiger",
                    "HAVAL-192",
                ];
                break;
            case 224:
                possible_hash_functions = [
                    "SHA-224",
                    "SHA3-224",
                    "ECOH-224",
                    "FSB-224",
                    "HAVAL-224",
                ];
                break;
            case 256:
                possible_hash_functions = [
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
                possible_hash_functions = [
                    "RIPEMD-320",
                ];
                break;
            case 384:
                possible_hash_functions = [
                    "SHA-384",
                    "SHA3-384",
                    "ECOH-384",
                    "FSB-384",
                ];
                break;
            case 512:
                possible_hash_functions = [
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
                possible_hash_functions = [
                    "Fowler-Noll-Vo",
                ];
                break;
            default:
                possible_hash_functions = [
                    "Unknown"
                ];
                break;
        }
        
        return output + possible_hash_functions.join("\n");
    },
    
};
