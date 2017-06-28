import Utils from "../Utils.js";
import CryptoJS from "crypto-js";
import {blowfish as Blowfish} from "sladex-blowfish";


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
     * @param {byteArray} input
     * @param {function} args
     * @returns {string}
     */
    _enc: function (algo, input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || ""),
            iv = Utils.format[args[1].option].parse(args[1].string || ""),
            salt = Utils.format[args[2].option].parse(args[2].string || ""),
            mode = CryptoJS.mode[args[3]],
            padding = CryptoJS.pad[args[4]],
            resultOption = args[5].toLowerCase(),
            outputFormat = args[6];

        if (iv.sigBytes === 0) {
            // Use passphrase rather than key. Need to convert it to a string.
            key = key.toString(CryptoJS.enc.Latin1);
        }

        const encrypted = algo.encrypt(input, key, {
            salt: salt.sigBytes > 0 ? salt : false,
            iv: iv.sigBytes > 0 ? iv : null,
            mode: mode,
            padding: padding
        });

        let result = "";
        if (resultOption === "show all") {
            result += "Key:  " + encrypted.key.toString(Utils.format[outputFormat]);
            result += "\nIV:   " + encrypted.iv.toString(Utils.format[outputFormat]);
            if (encrypted.salt) result += "\nSalt: " + encrypted.salt.toString(Utils.format[outputFormat]);
            result += "\n\nCiphertext: " + encrypted.ciphertext.toString(Utils.format[outputFormat]);
        } else {
            result = encrypted[resultOption].toString(Utils.format[outputFormat]);
        }

        return result;
    },


    /**
     * Runs decryption operations using the CryptoJS framework.
     *
     * @private
     * @param {function} algo - The CryptoJS algorithm to use
     * @param {byteArray} input
     * @param {function} args
     * @returns {string}
     */
    _dec: function (algo, input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string || ""),
            iv = Utils.format[args[1].option].parse(args[1].string || ""),
            salt = Utils.format[args[2].option].parse(args[2].string || ""),
            mode = CryptoJS.mode[args[3]],
            padding = CryptoJS.pad[args[4]],
            inputFormat = args[5],
            outputFormat = args[6];

        // The ZeroPadding option causes a crash when the input length is 0
        if (!input.length) {
            return "No input";
        }

        const ciphertext = Utils.format[inputFormat].parse(input);

        if (iv.sigBytes === 0) {
            // Use passphrase rather than key. Need to convert it to a string.
            key = key.toString(CryptoJS.enc.Latin1);
        }

        const decrypted = algo.decrypt({
            ciphertext: ciphertext,
            salt: salt.sigBytes > 0 ? salt : false
        }, key, {
            iv: iv.sigBytes > 0 ? iv : null,
            mode: mode,
            padding: padding
        });

        let result;
        try {
            result = decrypted.toString(Utils.format[outputFormat]);
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
    runAesEnc: function (input, args) {
        return Cipher._enc(CryptoJS.AES, input, args);
    },


    /**
     * AES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAesDec: function (input, args) {
        return Cipher._dec(CryptoJS.AES, input, args);
    },


    /**
     * DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDesEnc: function (input, args) {
        return Cipher._enc(CryptoJS.DES, input, args);
    },


    /**
     * DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDesDec: function (input, args) {
        return Cipher._dec(CryptoJS.DES, input, args);
    },


    /**
     * Triple DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTripleDesEnc: function (input, args) {
        return Cipher._enc(CryptoJS.TripleDES, input, args);
    },


    /**
     * Triple DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTripleDesDec: function (input, args) {
        return Cipher._dec(CryptoJS.TripleDES, input, args);
    },


    /**
     * Rabbit Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRabbitEnc: function (input, args) {
        return Cipher._enc(CryptoJS.Rabbit, input, args);
    },


    /**
     * Rabbit Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRabbitDec: function (input, args) {
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
    runBlowfishEnc: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string).toString(Utils.format.Latin1),
            mode = args[1],
            outputFormat = args[2];

        if (key.length === 0) return "Enter a key";

        let encHex = Blowfish.encrypt(input, key, {
                outputType: 1,
                cipherMode: Cipher.BLOWFISH_MODES.indexOf(mode)
            }),
            enc = CryptoJS.enc.Hex.parse(encHex);

        return enc.toString(Utils.format[outputFormat]);
    },


    /**
     * Blowfish Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBlowfishDec: function (input, args) {
        let key = Utils.format[args[0].option].parse(args[0].string).toString(Utils.format.Latin1),
            mode = args[1],
            inputFormat = args[2];

        if (key.length === 0) return "Enter a key";

        input = Utils.format[inputFormat].parse(input);

        return Blowfish.decrypt(input.toString(CryptoJS.enc.Base64), key, {
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
     * @constant
     * @default
     */
    HASHERS: ["MD5", "SHA1", "SHA224", "SHA256", "SHA384", "SHA512", "SHA3", "RIPEMD160"],

    /**
     * Derive PBKDF2 key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runPbkdf2: function (input, args) {
        let keySize = args[0] / 32,
            iterations = args[1],
            hasher = args[2],
            salt = CryptoJS.enc.Hex.parse(args[3] || ""),
            inputFormat = args[4],
            outputFormat = args[5],
            passphrase = Utils.format[inputFormat].parse(input),
            key = CryptoJS.PBKDF2(passphrase, salt, {
                keySize: keySize,
                hasher: CryptoJS.algo[hasher],
                iterations: iterations,
            });

        return key.toString(Utils.format[outputFormat]);
    },


    /**
     * Derive EVP key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEvpkdf: function (input, args) {
        let keySize = args[0] / 32,
            iterations = args[1],
            hasher = args[2],
            salt = CryptoJS.enc.Hex.parse(args[3] || ""),
            inputFormat = args[4],
            outputFormat = args[5],
            passphrase = Utils.format[inputFormat].parse(input),
            key = CryptoJS.EvpKDF(passphrase, salt, {
                keySize: keySize,
                hasher: CryptoJS.algo[hasher],
                iterations: iterations,
            });

        return key.toString(Utils.format[outputFormat]);
    },


    /**
     * RC4 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRc4: function (input, args) {
        let message = Utils.format[args[1]].parse(input),
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
    runRc4drop: function (input, args) {
        let message = Utils.format[args[1]].parse(input),
            passphrase = Utils.format[args[0].option].parse(args[0].string),
            drop = args[3],
            encrypted = CryptoJS.RC4Drop.encrypt(message, passphrase, { drop: drop });

        return encrypted.ciphertext.toString(Utils.format[args[2]]);
    },


    /**
     * Vigenère Encode operation.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runVigenereEnc: function (input, args) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz",
            key = args[0].toLowerCase(),
            output = "",
            fail = 0,
            keyIndex,
            msgIndex,
            chr;

        if (!key) return "No key entered";
        if (!/^[a-zA-Z]+$/.test(key)) return "The key must consist only of letters";

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                // Get the corresponding character of key for the current letter, accounting
                // for chars not in alphabet
                chr = key[(i - fail) % key.length];
                // Get the location in the vigenere square of the key char
                keyIndex = alphabet.indexOf(chr);
                // Get the location in the vigenere square of the message char
                msgIndex = alphabet.indexOf(input[i]);
                // Get the encoded letter by finding the sum of indexes modulo 26 and finding
                // the letter corresponding to that
                output += alphabet[(keyIndex + msgIndex) % 26];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                chr = key[(i - fail) % key.length].toLowerCase();
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i].toLowerCase());
                output += alphabet[(keyIndex + msgIndex) % 26].toUpperCase();
            } else {
                output += input[i];
                fail++;
            }
        }

        return output;
    },


    /**
     * Vigenère Decode operation.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runVigenereDec: function (input, args) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz",
            key = args[0].toLowerCase(),
            output = "",
            fail = 0,
            keyIndex,
            msgIndex,
            chr;

        if (!key) return "No key entered";
        if (!/^[a-zA-Z]+$/.test(key)) return "The key must consist only of letters";

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                chr = key[(i - fail) % key.length];
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i]);
                // Subtract indexes from each other, add 26 just in case the value is negative,
                // modulo to remove if neccessary
                output += alphabet[(msgIndex - keyIndex + alphabet.length) % 26];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                chr = key[(i - fail) % key.length].toLowerCase();
                keyIndex = alphabet.indexOf(chr);
                msgIndex = alphabet.indexOf(input[i].toLowerCase());
                output += alphabet[(msgIndex + alphabet.length - keyIndex) % 26].toUpperCase();
            } else {
                output += input[i];
                fail++;
            }
        }

        return output;
    },


    /**
     * @constant
     * @default
     */
    AFFINE_A: 1,
    /**
     * @constant
     * @default
     */
    AFFINE_B: 0,

    /**
     * Affine Cipher Encode operation.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAffineEnc: function (input, args) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz",
            a = args[0],
            b = args[1],
            output = "";

        if (!/^\+?(0|[1-9]\d*)$/.test(a) || !/^\+?(0|[1-9]\d*)$/.test(b)) {
            return "The values of a and b can only be integers.";
        }

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                // Uses the affine function ax+b % m = y (where m is length of the alphabet)
                output += alphabet[((a * alphabet.indexOf(input[i])) + b) % 26];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                // Same as above, accounting for uppercase
                output += alphabet[((a * alphabet.indexOf(input[i].toLowerCase())) + b) % 26].toUpperCase();
            } else {
                // Non-alphabetic characters
                output += input[i];
            }
        }
        return output;
    },


    /**
     * Affine Cipher Decode operation.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAffineDec: function (input, args) {
        let alphabet = "abcdefghijklmnopqrstuvwxyz",
            a = args[0],
            b = args[1],
            output = "",
            aModInv;

        if (!/^\+?(0|[1-9]\d*)$/.test(a) || !/^\+?(0|[1-9]\d*)$/.test(b)) {
            return "The values of a and b can only be integers.";
        }

        if (Utils.gcd(a, 26) !== 1) {
            return "The value of a must be coprime to 26.";
        }

        // Calculates modular inverse of a
        aModInv = Utils.modInv(a, 26);

        for (let i = 0; i < input.length; i++) {
            if (alphabet.indexOf(input[i]) >= 0) {
                // Uses the affine decode function (y-b * A') % m = x (where m is length of the alphabet and A' is modular inverse)
                output += alphabet[Utils.mod((alphabet.indexOf(input[i]) - b) * aModInv, 26)];
            } else if (alphabet.indexOf(input[i].toLowerCase()) >= 0) {
                // Same as above, accounting for uppercase
                output += alphabet[Utils.mod((alphabet.indexOf(input[i].toLowerCase()) - b) * aModInv, 26)].toUpperCase();
            } else {
                // Non-alphabetic characters
                output += input[i];
            }
        }
        return output;
    },


    /**
     * Atbash Cipher Encode operation.
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAtbash: function (input, args) {
        return Cipher.runAffineEnc(input, [25, 25]);
    },

    /**
     * Generates a polybius square for the given keyword
     *
     * @private
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} keyword
     * @returns {string}
     */
    _genPolybiusSquare: function (keyword) {
        const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        let polybius = [],
            polString = "";
        keyword.split("").unique().forEach(letter => {
            polString += letter;
        });
        polString = `${polString}${alpha}`.split("").unique().join("");
        for (let i = 0; i < 5; i++) {
            polybius[i] = polString.substr(i*5, 5).split("");
        }
        return polybius;
    },

    /**
     * Bifid Cipher Encode operation
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBifidEnc: function (input, args) {
        const keyword = args[0].toUpperCase().replace("J", "I"),
            alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        let output = "",
            xCo = [],
            yCo = [],
            structure = [],
            count = 0,
            trans;
        if (keyword.split("").unique().length > 25) return "The alphabet keyword must be less than 25 characters.";
        if (!/^[a-zA-Z]+$/.test(keyword) && keyword.split("").unique().length > 0) return "The key must consist only of letters";
        const polybius = Cipher._genPolybiusSquare(keyword);
        input.replace("J", "I").split("").forEach((letter) => {
            let alpInd = alpha.split("").indexOf(letter.toLocaleUpperCase()) >= 0,
                polInd;
            if (alpInd) {
                for (let i = 0; i < 5; i++) {
                    polInd = polybius[i].indexOf(letter.toLocaleUpperCase());
                    if (polInd >= 0) {
                        xCo.push(polInd);
                        yCo.push(i);
                    }
                }
                if (alpha.split("").indexOf(letter) >= 0) {
                    structure.push(true);
                } else if (alpInd) {
                    structure.push(false);
                }
            } else {
                structure.push(letter);
            }
        });
        trans = `${yCo.join("")}${xCo.join("")}`;
        structure.forEach(pos => {
            if (typeof pos === "boolean") {
                let coords = trans.substr(2*count, 2).split("");
                if (pos) {
                    output += polybius[coords[0]][coords[1]];
                } else {
                    output += polybius[coords[0]][coords[1]].toLocaleLowerCase();
                }
                count++;
            } else {
                output += pos;
            }
        });
        return output;
    },

    /**
     * Bifid Cipher Decode operation
     *
     * @author Matt C [matt@artemisbot.uk]
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBifidDec: function (input, args) {
        const keyword = args[0].toUpperCase().replace("J", "I"),
            alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        let output = "",
            structure = [],
            count = 0,
            trans = "";
        if (keyword.split("").unique().length > 25) return "The alphabet keyword must be less than 25 characters.";
        if (!/^[a-zA-Z]+$/.test(keyword) && keyword.split("").unique().length > 0) return "The key must consist only of letters";
        const polybius = Cipher._genPolybiusSquare(keyword);
        input.replace("J", "I").split("").forEach((letter) => {
            let alpInd = alpha.split("").indexOf(letter.toLocaleUpperCase()) >= 0,
                polInd;
            if (alpInd) {
                for (let i = 0; i < 5; i++) {
                    polInd = polybius[i].indexOf(letter.toLocaleUpperCase());
                    if (polInd >= 0) {
                        trans += `${i}${polInd}`;
                    }
                }
                if (alpha.split("").indexOf(letter) >= 0) {
                    structure.push(true);
                } else if (alpInd) {
                    structure.push(false);
                }
            } else {
                structure.push(letter);
            }
        });
        structure.forEach(pos => {
            if (typeof pos === "boolean") {
                let coords = [trans[count], trans[count+trans.length/2]];
                if (pos) {
                    output += polybius[coords[0]][coords[1]];
                } else {
                    output += polybius[coords[0]][coords[1]].toLocaleLowerCase();
                }
                count++;
            } else {
                output += pos;
            }
        });
        return output;
    },

    /**
     * @constant
     * @default
     */
    SUBS_PLAINTEXT: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    /**
     * @constant
     * @default
     */
    SUBS_CIPHERTEXT: "XYZABCDEFGHIJKLMNOPQRSTUVW",

    /**
     * Substitute operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runSubstitute: function (input, args) {
        let plaintext = Utils.expandAlphRange(args[0]).join(),
            ciphertext = Utils.expandAlphRange(args[1]).join(),
            output = "",
            index = -1;

        if (plaintext.length !== ciphertext.length) {
            output = "Warning: Plaintext and Ciphertext lengths differ\n\n";
        }

        for (let i = 0; i < input.length; i++) {
            index = plaintext.indexOf(input[i]);
            output += index > -1 && index < ciphertext.length ? ciphertext[index] : input[i];
        }

        return output;
    },

};

export default Cipher;


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
    const key = CryptoJS.algo.EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

    // Separate key and IV
    const iv = CryptoJS.lib.WordArray.create(key.words.slice(keySize), ivSize * 4);
    key.sigBytes = keySize * 4;

    // Return params
    return CryptoJS.lib.CipherParams.create({ key: key, iv: iv, salt: salt });
};
