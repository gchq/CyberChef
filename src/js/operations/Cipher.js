/* globals CryptoJS, blowfish */

/**
 * Cipher operations.
 *
 * @author n1474335 [n1474335@gmail.com] & Matt C [matt@artemisbot.pw]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @namespace
 */
var Cipher = {
    
    /**
     * @constant
     * @default
     */
    IO_FORMAT1: ["Hex", "Base64", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1"],
    /**
     * @constant
     * @default
     */
    IO_FORMAT2: ["UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1", "Hex", "Base64"],
    /**
     * @constant
     * @default
     */
    IO_FORMAT3: ["Hex", "Base64", "UTF16", "UTF16LE", "UTF16BE", "Latin1"],
    /**
     * @constant
     * @default
     */
    IO_FORMAT4: ["Latin1", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Hex", "Base64"],
    /**
     * @constant
     * @default
     */
    MODES: ["CBC", "CFB", "CTR", "OFB", "ECB"],
    /**
     * @constant
     * @default
     */
    PADDING: ["Pkcs7", "Iso97971", "AnsiX923", "Iso10126", "ZeroPadding", "NoPadding"],
    /**
     * @constant
     * @default
     */
    RESULT_TYPE: ["Show all", "Ciphertext", "Key", "IV", "Salt"],
    
    
    /**
     * Runs encryption operations using the CryptoJS framework.
     *
     * @private
     * @param {function} algo - The CryptoJS algorithm to use
     * @param {byte_array} input
     * @param {function} args
     * @returns {string}
     */
    _enc: function (algo, input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || ""),
            iv = Utils.format[args[1].option].parse(args[1].string || ""),
            salt = Utils.format[args[2].option].parse(args[2].string || ""),
            mode = CryptoJS.mode[args[3]],
            padding = CryptoJS.pad[args[4]],
            result_option = args[5].toLowerCase(),
            output_format = args[6];
        
        if (iv.sigBytes === 0) {
            // Use passphrase rather than key. Need to convert it to a string.
            key = key.toString(CryptoJS.enc.Latin1);
        }
        
        var encrypted = algo.encrypt(input, key, {
            salt: salt.sigBytes > 0 ? salt : false,
            iv: iv.sigBytes > 0 ? iv : null,
            mode: mode,
            padding: padding
        });
        
        var result = "";
        if (result_option == "show all") {
            result += "Key:  " + encrypted.key.toString(Utils.format[output_format]);
            result += "\nIV:   " + encrypted.iv.toString(Utils.format[output_format]);
            if (encrypted.salt) result += "\nSalt: " + encrypted.salt.toString(Utils.format[output_format]);
            result += "\n\nCiphertext: " + encrypted.ciphertext.toString(Utils.format[output_format]);
        } else {
            result = encrypted[result_option].toString(Utils.format[output_format]);
        }
        
        return result;
    },
    
    
    /**
     * Runs decryption operations using the CryptoJS framework.
     *
     * @private
     * @param {function} algo - The CryptoJS algorithm to use
     * @param {byte_array} input
     * @param {function} args
     * @returns {string}
     */
    _dec: function (algo, input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string || ""),
            iv = Utils.format[args[1].option].parse(args[1].string || ""),
            salt = Utils.format[args[2].option].parse(args[2].string || ""),
            mode = CryptoJS.mode[args[3]],
            padding = CryptoJS.pad[args[4]],
            input_format = args[5],
            output_format = args[6];
        
        // The ZeroPadding option causes a crash when the input length is 0
        if (!input.length) {
            return "No input";
        } 
        
        var ciphertext = Utils.format[input_format].parse(input);
        
        if (iv.sigBytes === 0) {
            // Use passphrase rather than key. Need to convert it to a string.
            key = key.toString(CryptoJS.enc.Latin1);
        }
        
        var decrypted = algo.decrypt({
                ciphertext: ciphertext,
                salt: salt.sigBytes > 0 ? salt : false
            }, key, {
                iv: iv.sigBytes > 0 ? iv : null,
                mode: mode,
                padding: padding
            });
        
        var result;
        try {
            result = decrypted.toString(Utils.format[output_format]);
        } catch (err) {
            result = "Decrypt error: " + err.message;
        }
        
        return result;
    },
    
    
    /**
     * AES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_aes_enc: function (input, args) {
        return Cipher._enc(CryptoJS.AES, input, args);
    },
    
    
    /**
     * AES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_aes_dec: function (input, args) {
        return Cipher._dec(CryptoJS.AES, input, args);
    },
    
    
    /**
     * DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_des_enc: function (input, args) {
        return Cipher._enc(CryptoJS.DES, input, args);
    },
    
    
    /**
     * DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_des_dec: function (input, args) {
        return Cipher._dec(CryptoJS.DES, input, args);
    },
    
    
    /**
     * Triple DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_triple_des_enc: function (input, args) {
        return Cipher._enc(CryptoJS.TripleDES, input, args);
    },
    
    
    /**
     * Triple DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_triple_des_dec: function (input, args) {
        return Cipher._dec(CryptoJS.TripleDES, input, args);
    },
    
    
    /**
     * Rabbit Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_rabbit_enc: function (input, args) {
        return Cipher._enc(CryptoJS.Rabbit, input, args);
    },
    
    
    /**
     * Rabbit Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_rabbit_dec: function (input, args) {
        return Cipher._dec(CryptoJS.Rabbit, input, args);
    },
    
    
    /**
     * @constant
     * @default
     */
    BLOWFISH_MODES: ["ECB", "CBC", "PCBC", "CFB", "OFB", "CTR"],
    /**
     * @constant
     * @default
     */
    BLOWFISH_OUTPUT_TYPES: ["Base64", "Hex", "String", "Raw"],
    
    /**
     * Blowfish Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_blowfish_enc: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string).toString(Utils.format.Latin1),
            mode = args[1],
            output_format = args[2];
            
        if (key.length === 0) return "Enter a key";
        
        var enc_hex = blowfish.encrypt(input, key, {
                outputType: 1,
                cipherMode: Cipher.BLOWFISH_MODES.indexOf(mode)
            }),
            enc = CryptoJS.enc.Hex.parse(enc_hex);
            
        return enc.toString(Utils.format[output_format]);
    },
    
    
    /**
     * Blowfish Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_blowfish_dec: function (input, args) {
        var key = Utils.format[args[0].option].parse(args[0].string).toString(Utils.format.Latin1),
            mode = args[1],
            input_format = args[2];
            
        if (key.length === 0) return "Enter a key";
        
        input = Utils.format[input_format].parse(input);
        
        return blowfish.decrypt(input.toString(CryptoJS.enc.Base64), key, {
            outputType: 0, // This actually means inputType. The library is weird.
            cipherMode: Cipher.BLOWFISH_MODES.indexOf(mode)
        });
    },
    
    
    /**
     * @constant
     * @default
     */
    KDF_KEY_SIZE: 256,
    /**
     * @constant
     * @default
     */
    KDF_ITERATIONS: 1,
    
    /**
     * Derive PBKDF2 key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_pbkdf2: function (input, args) {
        var key_size = args[0] / 32,
            iterations = args[1],
            salt = CryptoJS.enc.Hex.parse(args[2] || ""),
            input_format = args[3],
            output_format = args[4],
            passphrase = Utils.format[input_format].parse(input),
            key = CryptoJS.PBKDF2(passphrase, salt, { keySize: key_size, iterations: iterations });
        
        return key.toString(Utils.format[output_format]);
    },
    
    
    /**
     * Derive EVP key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_evpkdf: function (input, args) {
        var key_size = args[0] / 32,
            iterations = args[1],
            salt = CryptoJS.enc.Hex.parse(args[2] || ""),
            input_format = args[3],
            output_format = args[4],
            passphrase = Utils.format[input_format].parse(input),
            key = CryptoJS.EvpKDF(passphrase, salt, { keySize: key_size, iterations: iterations });
        
        return key.toString(Utils.format[output_format]);
    },
    
    
    /**
     * RC4 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_rc4: function (input, args) {
        var message = Utils.format[args[1]].parse(input),
            passphrase = Utils.format[args[0].option].parse(args[0].string),
            encrypted = CryptoJS.RC4.encrypt(message, passphrase);
            
        return encrypted.ciphertext.toString(Utils.format[args[2]]);
    },
    
    
    /**
     * @constant
     * @default
     */
    RC4DROP_BYTES: 768,
    
    /**
     * RC4 Drop operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_rc4drop: function (input, args) {
        var message = Utils.format[args[1]].parse(input),
            passphrase = Utils.format[args[0].option].parse(args[0].string),
            drop = args[3],
            encrypted = CryptoJS.RC4Drop.encrypt(message, passphrase, { drop: drop });
            
        return encrypted.ciphertext.toString(Utils.format[args[2]]);
    },
    

    /**
     * @constant
     * @default
     */
    VIG_ENC_KEY: "cipher",

    /**
     * Vigenere cipher encode.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_vigenc: function (input, args) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz",
            keyword = args[0].toLowerCase(),
            output = "",
            fail = 0,
            keyIndex,
            msgIndex,
            chr;
        if (keyword) {
            if (/^[a-zA-Z]+$/.test(keyword)) {
                for (var i = 0; i < input.length; i++) {
                    if (alphabet.indexOf(input[i]) >= 0) {
                        chr = keyword[(i - fail) % keyword.length];             //Gets the corresponding character of keyword for current letter, accounting for chars not in alphabet
                        keyIndex = alphabet.indexOf(chr);                       //Gets location in vigenere square of keyword char
                        msgIndex = alphabet.indexOf(input[i]);                  //Gets location in vigenere square of message char
                        output += alphabet[(keyIndex + msgIndex) % 26];        //Gets encoded letter by finding sum of indexes modulo 26 and finding the letter corresponding to that
                    } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                        chr = keyword[(i - fail) % keyword.length].toLowerCase();
                        keyIndex = alphabet.indexOf(chr);
                        msgIndex = alphabet.indexOf(input[i].toLowerCase());
                        output += alphabet[(keyIndex + msgIndex) % 26].toUpperCase();
                    } else {
                        output += input[i];
                        fail++
                    }
                }
            } else {
                throw "Keyword can only consist of letters.";
            }
        } else {
            throw "A keyword is required.";
        }
        return output;
    },
    /**
     * @constant
     * @default
     */
    VIG_DEC_KEY: "cipher",

    /**
     * Vigenere cipher decode.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run_vigdec: function (input, args) {
        var alphabet = "abcdefghijklmnopqrstuvwxyz",
            keyword = args[0].toLowerCase(),
            output = "",
            fail = 0,
            keyIndex,
            msgIndex,
            chr;
        if (keyword) {
            if (/^[a-zA-Z]+$/.test(keyword)) {
                for (var i = 0; i < input.length; i++) {
                    if (alphabet.indexOf(input[i]) >= 0) {
                        chr = keyword[(i - fail) % keyword.length];
                        keyIndex = alphabet.indexOf(chr);
                        msgIndex = alphabet.indexOf(input[i]);
                        output += alphabet[(msgIndex - keyIndex + alphabet.length ) % 26]; //subtract indexes from each other, add 26 just in case the value is negative, modulo to remove if neccessary
                    } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                        chr = keyword[(i - fail) % keyword.length].toLowerCase();
                        keyIndex = alphabet.indexOf(chr);
                        msgIndex = alphabet.indexOf(input[i].toLowerCase());
                        output += alphabet[(msgIndex + alphabet.length - keyIndex) % 26].toUpperCase();
                    } else {
                        output += input[i];
                        fail++
                    }
                }
            } else {
                throw "Keyword can only consist of letters.";
            }
        } else {
            throw "A keyword is required.";
        }
        return output;
    }
};


/**
 * Overwriting the CryptoJS OpenSSL key derivation function so that it is possible to not pass a
 * salt in.
 
 * @param {string} password - The password to derive from.
 * @param {number} keySize - The size in words of the key to generate.
 * @param {number} ivSize - The size in words of the IV to generate.
 * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be
 *                 generated randomly. If set to false, no salt will be added.
 *
 * @returns {CipherParams} A cipher params object with the key, IV, and salt.
 *
 * @static
 *
 * @example
 * // Randomly generates a salt
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
 * // Uses the salt 'saltsalt'
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
 * // Does not use a salt
 * var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, false);
 */
CryptoJS.kdf.OpenSSL.execute = function (password, keySize, ivSize, salt) {
    // Generate random salt if no salt specified and not set to false
    // This line changed from `if (!salt) {` to the following
    if (salt === undefined || salt === null) {
        salt = CryptoJS.lib.WordArray.random(64/8);
    }

    // Derive key and IV
    var key = CryptoJS.algo.EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

    // Separate key and IV
    var iv = CryptoJS.lib.WordArray.create(key.words.slice(keySize), ivSize * 4);
    key.sigBytes = keySize * 4;

    // Return params
    return CryptoJS.lib.CipherParams.create({ key: key, iv: iv, salt: salt });
};
