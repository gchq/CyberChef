import Cipher from "../../operations/Cipher.js";


/**
 * Ciphers module.
 *
 * Libraries:
 *  - CryptoJS
 *  - Blowfish
 *  - Forge
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Ciphers = {
    "AES Encrypt":          Cipher.runAesEnc,
    "AES Decrypt":          Cipher.runAesDec,
    "Blowfish Encrypt":     Cipher.runBlowfishEnc,
    "Blowfish Decrypt":     Cipher.runBlowfishDec,
    "DES Encrypt":          Cipher.runDesEnc,
    "DES Decrypt":          Cipher.runDesDec,
    "Triple DES Encrypt":   Cipher.runTripleDesEnc,
    "Triple DES Decrypt":   Cipher.runTripleDesDec,
    "Derive PBKDF2 key":    Cipher.runPbkdf2,
    "Derive EVP key":       Cipher.runEvpkdf,
    "RC4":                  Cipher.runRc4,
    "RC4 Drop":             Cipher.runRc4drop,
    "Vigenère Encode":      Cipher.runVigenereEnc,
    "Vigenère Decode":      Cipher.runVigenereDec,
    "Bifid Cipher Encode":  Cipher.runBifidEnc,
    "Bifid Cipher Decode":  Cipher.runBifidDec,
    "Affine Cipher Encode": Cipher.runAffineEnc,
    "Affine Cipher Decode": Cipher.runAffineDec,
    "Atbash Cipher":        Cipher.runAtbash,
    "Substitute":           Cipher.runSubstitute,
};

export default OpModules;
