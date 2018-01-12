import Utils from "../Utils.js";
import CryptoJS from "crypto-js";
import forge from "imports-loader?jQuery=>null!node-forge/dist/forge.min.js";
import {blowfish as Blowfish} from "sladex-blowfish";
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
     * @constant
     * @default
     */
    AES_MODES: ["CBC", "CFB", "OFB", "CTR", "GCM", "ECB"],

    /**
     * AES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAesEnc: function (input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if ([16, 24, 32].indexOf(key.length) < 0) {
            return `Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`;
        }

        input = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher("AES-" + mode, key);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        if (outputType === "Hex") {
            if (mode === "GCM") {
                return cipher.output.toHex() + "\n\n" +
                    "Tag: " + cipher.mode.tag.toHex();
            }
            return cipher.output.toHex();
        } else {
            if (mode === "GCM") {
                return cipher.output.getBytes() + "\n\n" +
                    "Tag: " + cipher.mode.tag.getBytes();
            }
            return cipher.output.getBytes();
        }
    },


    /**
     * AES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runAesDec: function (input, args) {
        const key = Utils.convertToByteArray(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4],
            gcmTag = Utils.convertToByteString(args[5].string, args[5].option);

        if ([16, 24, 32].indexOf(key.length) < 0) {
            return `Invalid key length: ${key.length} bytes

The following algorithms will be used based on the size of the key:
  16 bytes = AES-128
  24 bytes = AES-192
  32 bytes = AES-256`;
        }

        input = Utils.convertToByteString(input, inputType);

        const decipher = forge.cipher.createDecipher("AES-" + mode, key);
        decipher.start({
            iv: iv,
            tag: gcmTag
        });
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
        } else {
            return "Unable to decrypt input with these parameters.";
        }
    },


    /**
     * @constant
     * @default
     */
    DES_MODES: ["CBC", "CFB", "OFB", "CTR", "ECB"],

    /**
     * DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDesEnc: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 8) {
            return `Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher("DES-" + mode, key);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    },


    /**
     * DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runDesDec: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 8) {
            return `Invalid key length: ${key.length} bytes

DES uses a key length of 8 bytes (64 bits).
Triple DES uses a key length of 24 bytes (192 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const decipher = forge.cipher.createDecipher("DES-" + mode, key);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
        } else {
            return "Unable to decrypt input with these parameters.";
        }
    },


    /**
     * Triple DES Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTripleDesEnc: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 24) {
            return `Invalid key length: ${key.length} bytes

Triple DES uses a key length of 24 bytes (192 bits).
DES uses a key length of 8 bytes (64 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const cipher = forge.cipher.createCipher("3DES-" + mode, key);
        cipher.start({iv: iv});
        cipher.update(forge.util.createBuffer(input));
        cipher.finish();

        return outputType === "Hex" ? cipher.output.toHex() : cipher.output.getBytes();
    },


    /**
     * Triple DES Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runTripleDesDec: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length !== 24) {
            return `Invalid key length: ${key.length} bytes

Triple DES uses a key length of 24 bytes (192 bits).
DES uses a key length of 8 bytes (64 bits).`;
        }

        input = Utils.convertToByteString(input, inputType);

        const decipher = forge.cipher.createDecipher("3DES-" + mode, key);
        decipher.start({iv: iv});
        decipher.update(forge.util.createBuffer(input));
        const result = decipher.finish();

        if (result) {
            return outputType === "Hex" ? decipher.output.toHex() : decipher.output.getBytes();
        } else {
            return "Unable to decrypt input with these parameters.";
        }
    },


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
    BLOWFISH_MODES: ["CBC", "PCBC", "CFB", "OFB", "CTR", "ECB"],
    /**
     * @constant
     * @default
     */
    BLOWFISH_OUTPUT_TYPES: ["Hex", "Base64", "Raw"],

    /**
     * Lookup table for Blowfish output types.
     *
     * @private
     */
    _BLOWFISH_OUTPUT_TYPE_LOOKUP: {
        Base64: 0, Hex: 1, String: 2, Raw: 3
    },
    /**
     * Lookup table for Blowfish modes.
     *
     * @private
     */
    _BLOWFISH_MODE_LOOKUP: {
        ECB: 0, CBC: 1, PCBC: 2, CFB: 3, OFB: 4, CTR: 5
    },

    /**
     * Blowfish Encrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBlowfishEnc: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length === 0) return "Enter a key";

        input = Utils.convertToByteString(input, inputType);

        Blowfish.setIV(Utils.toBase64(iv), 0);

        const enc = Blowfish.encrypt(input, key, {
            outputType: Cipher._BLOWFISH_OUTPUT_TYPE_LOOKUP[outputType],
            cipherMode: Cipher._BLOWFISH_MODE_LOOKUP[mode]
        });

        return outputType === "Raw" ? Utils.byteArrayToChars(enc) : enc   ;
    },


    /**
     * Blowfish Decrypt operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runBlowfishDec: function (input, args) {
        const key = Utils.convertToByteString(args[0].string, args[0].option),
            iv = Utils.convertToByteArray(args[1].string, args[1].option),
            mode = args[2],
            inputType = args[3],
            outputType = args[4];

        if (key.length === 0) return "Enter a key";

        input = inputType === "Raw" ? Utils.strToByteArray(input) : input;

        Blowfish.setIV(Utils.toBase64(iv), 0);

        const result = Blowfish.decrypt(input, key, {
            outputType: Cipher._BLOWFISH_OUTPUT_TYPE_LOOKUP[inputType], // This actually means inputType. The library is weird.
            cipherMode: Cipher._BLOWFISH_MODE_LOOKUP[mode]
        });

        return outputType === "Hex" ? Utils.toHexFast(Utils.strToByteArray(result)) : result;
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
     * Derive EVP key operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runEvpkdf: function (input, args) {
        const passphrase = Utils.convertToByteString(args[0].string, args[0].option),
            keySize = args[1] / 32,
            iterations = args[2],
            hasher = args[3],
            salt = Utils.convertToByteString(args[4].string, args[4].option),
            key = CryptoJS.EvpKDF(passphrase, salt, {
                keySize: keySize,
                hasher: CryptoJS.algo[hasher],
                iterations: iterations,
            });

        return key.toString(CryptoJS.enc.Hex);
    },


    /**
     * @constant
     * @default
     */
    RC4_KEY_FORMAT: ["UTF8", "UTF16", "UTF16LE", "UTF16BE", "Latin1", "Hex", "Base64"],
    /**
     * @constant
     * @default
     */
    CJS_IO_FORMAT: ["Latin1", "UTF8", "UTF16", "UTF16LE", "UTF16BE", "Hex", "Base64"],


    /**
     * RC4 operation.
     *
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    runRc4: function (input, args) {
        let message = Cipher._format[args[1]].parse(input),
            passphrase = Cipher._format[args[0].option].parse(args[0].string),
            encrypted = CryptoJS.RC4.encrypt(message, passphrase);

        return encrypted.ciphertext.toString(Cipher._format[args[2]]);
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
        let message = Cipher._format[args[1]].parse(input),
            passphrase = Cipher._format[args[0].option].parse(args[0].string),
            drop = args[3],
            encrypted = CryptoJS.RC4Drop.encrypt(message, passphrase, { drop: drop });

        return encrypted.ciphertext.toString(Cipher._format[args[2]]);
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
                    value = value.mul(256).plus(bytes.charCodeAt(i));
                }
                return value.toFixed();
            case "Byte array":
                return JSON.stringify(Utils.strToCharcode(bytes));
            case "Raw":
            default:
                return bytes;
        }
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
     * @param {string} keyword - Must be upper case
     * @returns {string}
     */
    _genPolybiusSquare: function (keyword) {
        const alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
        const polArray = `${keyword}${alpha}`.split("").unique();
        let polybius = [];

        for (let i = 0; i < 5; i++) {
            polybius[i] = polArray.slice(i*5, i*5 + 5);
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
        const keywordStr = args[0].toUpperCase().replace("J", "I"),
            keyword = keywordStr.split("").unique(),
            alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

        let output = "",
            xCo = [],
            yCo = [],
            structure = [],
            count = 0;

        if (keyword.length > 25)
            return "The alphabet keyword must be less than 25 characters.";

        if (!/^[a-zA-Z]+$/.test(keywordStr) && keyword.length > 0)
            return "The key must consist only of letters";

        const polybius = Cipher._genPolybiusSquare(keywordStr);

        input.replace("J", "I").split("").forEach(letter => {
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

        const trans = `${yCo.join("")}${xCo.join("")}`;

        structure.forEach(pos => {
            if (typeof pos === "boolean") {
                let coords = trans.substr(2*count, 2).split("");

                output += pos ?
                    polybius[coords[0]][coords[1]] :
                    polybius[coords[0]][coords[1]].toLocaleLowerCase();
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
        const keywordStr = args[0].toUpperCase().replace("J", "I"),
            keyword = keywordStr.split("").unique(),
            alpha = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

        let output = "",
            structure = [],
            count = 0,
            trans = "";

        if (keyword.length > 25)
            return "The alphabet keyword must be less than 25 characters.";

        if (!/^[a-zA-Z]+$/.test(keywordStr) && keyword.length > 0)
            return "The key must consist only of letters";

        const polybius = Cipher._genPolybiusSquare(keywordStr);

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

                output += pos ?
                    polybius[coords[0]][coords[1]] :
                    polybius[coords[0]][coords[1]].toLocaleLowerCase();
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
        let plaintext = Utils.expandAlphRange(args[0]).join(""),
            ciphertext = Utils.expandAlphRange(args[1]).join(""),
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


    /**
     * A mapping of string formats to their classes in the CryptoJS library.
     *
     * @private
     * @constant
     */
    _format: {
        "Hex":     CryptoJS.enc.Hex,
        "Base64":  CryptoJS.enc.Base64,
        "UTF8":    CryptoJS.enc.Utf8,
        "UTF16":   CryptoJS.enc.Utf16,
        "UTF16LE": CryptoJS.enc.Utf16LE,
        "UTF16BE": CryptoJS.enc.Utf16BE,
        "Latin1":  CryptoJS.enc.Latin1,
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


/**
 * Override for the CryptoJS Hex encoding parser to remove whitespace before attempting to parse
 * the hex string.
 *
 * @param {string} hexStr
 * @returns {CryptoJS.lib.WordArray}
 */
CryptoJS.enc.Hex.parse = function (hexStr) {
    // Remove whitespace
    hexStr = hexStr.replace(/\s/g, "");

    // Shortcut
    const hexStrLength = hexStr.length;

    // Convert
    const words = [];
    for (let i = 0; i < hexStrLength; i += 2) {
        words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    }

    return new CryptoJS.lib.WordArray.init(words, hexStrLength / 2);
};
