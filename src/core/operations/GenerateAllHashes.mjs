/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import Utils from "../Utils";
import MD2 from "./MD2";
import MD4 from "./MD4";
import MD5 from "./MD5";
import MD6 from "./MD6";
import SHA0 from "./SHA0";
import SHA1 from "./SHA1";
import SHA2 from "./SHA2";
import SHA3 from "./SHA3";
import Keccak from "./Keccak";
import Shake from "./Shake";
import RIPEMD from "./RIPEMD";
import HAS160 from "./HAS160";
import Whirlpool from "./Whirlpool";
import SSDEEP from "./SSDEEP";
import CTPH from "./CTPH";
import Fletcher8Checksum from "./Fletcher8Checksum";
import Fletcher16Checksum from "./Fletcher16Checksum";
import Fletcher32Checksum from "./Fletcher32Checksum";
import Fletcher64Checksum from "./Fletcher64Checksum";
import Adler32Checksum from "./Adler32Checksum";
import CRC16Checksum from "./CRC16Checksum";
import CRC32Checksum from "./CRC32Checksum";
import BLAKE2b from "./BLAKE2b";
import BLAKE2s from "./BLAKE2s";

/**
 * Generate all hashes operation
 */
class GenerateAllHashes extends Operation {

    /**
     * GenerateAllHashes constructor
     */
    constructor() {
        super();

        this.name = "Generate all hashes";
        this.module = "Crypto";
        this.description = "Generates all available hashes and checksums for the input.";
        this.infoURL = "https://wikipedia.org/wiki/Comparison_of_cryptographic_hash_functions";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const arrayBuffer = input,
            str = Utils.arrayBufferToStr(arrayBuffer, false),
            byteArray = new Uint8Array(arrayBuffer),
            output = "MD2:         " + (new MD2()).run(arrayBuffer, []) +
                "\nMD4:         " + (new MD4()).run(arrayBuffer, []) +
                "\nMD5:         " + (new MD5()).run(arrayBuffer, []) +
                "\nMD6:         " + (new MD6()).run(str, []) +
                "\nSHA0:        " + (new SHA0()).run(arrayBuffer, []) +
                "\nSHA1:        " + (new SHA1()).run(arrayBuffer, []) +
                "\nSHA2 224:    " + (new SHA2()).run(arrayBuffer, ["224"]) +
                "\nSHA2 256:    " + (new SHA2()).run(arrayBuffer, ["256"]) +
                "\nSHA2 384:    " + (new SHA2()).run(arrayBuffer, ["384"]) +
                "\nSHA2 512:    " + (new SHA2()).run(arrayBuffer, ["512"]) +
                "\nSHA3 224:    " + (new SHA3()).run(arrayBuffer, ["224"]) +
                "\nSHA3 256:    " + (new SHA3()).run(arrayBuffer, ["256"]) +
                "\nSHA3 384:    " + (new SHA3()).run(arrayBuffer, ["384"]) +
                "\nSHA3 512:    " + (new SHA3()).run(arrayBuffer, ["512"]) +
                "\nKeccak 224:  " + (new Keccak()).run(arrayBuffer, ["224"]) +
                "\nKeccak 256:  " + (new Keccak()).run(arrayBuffer, ["256"]) +
                "\nKeccak 384:  " + (new Keccak()).run(arrayBuffer, ["384"]) +
                "\nKeccak 512:  " + (new Keccak()).run(arrayBuffer, ["512"]) +
                "\nShake 128:   " + (new Shake()).run(arrayBuffer, ["128", 256]) +
                "\nShake 256:   " + (new Shake()).run(arrayBuffer, ["256", 512]) +
                "\nRIPEMD-128:  " + (new RIPEMD()).run(arrayBuffer, ["128"]) +
                "\nRIPEMD-160:  " + (new RIPEMD()).run(arrayBuffer, ["160"]) +
                "\nRIPEMD-256:  " + (new RIPEMD()).run(arrayBuffer, ["256"]) +
                "\nRIPEMD-320:  " + (new RIPEMD()).run(arrayBuffer, ["320"]) +
                "\nHAS-160:     " + (new HAS160()).run(arrayBuffer, []) +
                "\nWhirlpool-0: " + (new Whirlpool()).run(arrayBuffer, ["Whirlpool-0"]) +
                "\nWhirlpool-T: " + (new Whirlpool()).run(arrayBuffer, ["Whirlpool-T"]) +
                "\nWhirlpool:   " + (new Whirlpool()).run(arrayBuffer, ["Whirlpool"]) +
                "\nSSDEEP:      " + (new SSDEEP()).run(str) +
                "\nCTPH:        " + (new CTPH()).run(str) +
                "\nBLAKE2b-512: " + (new BLAKE2b).run(str, ["512", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2b-384: " + (new BLAKE2b).run(str, ["384", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2b-256: " + (new BLAKE2b).run(str, ["256", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2b-160: " + (new BLAKE2b).run(str, ["160", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2b-128: " + (new BLAKE2b).run(str, ["128", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2s-256: " + (new BLAKE2s).run(str, ["256", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2s-160: " + (new BLAKE2s).run(str, ["160", "Hex", {string: "", option: "UTF8"}]) +
                "\nBLAKE2s-128: " + (new BLAKE2s).run(str, ["128", "Hex", {string: "", option: "UTF8"}]) +
                "\n\nChecksums:" +
                "\nFletcher-8:  " + (new Fletcher8Checksum).run(byteArray, []) +
                "\nFletcher-16: " + (new Fletcher16Checksum).run(byteArray, []) +
                "\nFletcher-32: " + (new Fletcher32Checksum).run(byteArray, []) +
                "\nFletcher-64: " + (new Fletcher64Checksum).run(byteArray, []) +
                "\nAdler-32:    " + (new Adler32Checksum).run(byteArray, []) +
                "\nCRC-16:      " + (new CRC16Checksum).run(str, []) +
                "\nCRC-32:      " + (new CRC32Checksum).run(str, []);

        return output;
    }

}

export default GenerateAllHashes;
