import Checksum from "../../operations/Checksum.js";
import Hash from "../../operations/Hash.js";


/**
 * Hashing module.
 *
 * Libraries:
 *  - CryptoJS
 *  - CryptoApi
 *  - ./Checksum.js
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 */
let OpModules = typeof self === "undefined" ? {} : self.OpModules || {};

OpModules.Hashing = {
    "Analyse hash":         Hash.runAnalyse,
    "Generate all hashes":  Hash.runAll,
    "MD2":                  Hash.runMD2,
    "MD4":                  Hash.runMD4,
    "MD5":                  Hash.runMD5,
    "SHA0":                 Hash.runSHA0,
    "SHA1":                 Hash.runSHA1,
    "SHA224":               Hash.runSHA224,
    "SHA256":               Hash.runSHA256,
    "SHA384":               Hash.runSHA384,
    "SHA512":               Hash.runSHA512,
    "SHA3":                 Hash.runSHA3,
    "RIPEMD-160":           Hash.runRIPEMD160,
    "HMAC":                 Hash.runHMAC,
    "Fletcher-8 Checksum":  Checksum.runFletcher8,
    "Fletcher-16 Checksum": Checksum.runFletcher16,
    "Fletcher-32 Checksum": Checksum.runFletcher32,
    "Fletcher-64 Checksum": Checksum.runFletcher64,
    "Adler-32 Checksum":    Checksum.runAdler32,
    "CRC-32 Checksum":      Checksum.runCRC32,
    "TCP/IP Checksum":      Checksum.runTCPIP,
};

export default OpModules;
