/**
 * @author n1474335 [n1474335@gmail.com]
 * @author john19696 [john19696@protonmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import MD2 from "./MD2.mjs";
import MD4 from "./MD4.mjs";
import MD5 from "./MD5.mjs";
import MD6 from "./MD6.mjs";
import SHA0 from "./SHA0.mjs";
import SHA1 from "./SHA1.mjs";
import SHA2 from "./SHA2.mjs";
import SHA3 from "./SHA3.mjs";
import Keccak from "./Keccak.mjs";
import Shake from "./Shake.mjs";
import RIPEMD from "./RIPEMD.mjs";
import HAS160 from "./HAS160.mjs";
import Whirlpool from "./Whirlpool.mjs";
import SSDEEP from "./SSDEEP.mjs";
import CTPH from "./CTPH.mjs";
import Fletcher8Checksum from "./Fletcher8Checksum.mjs";
import Fletcher16Checksum from "./Fletcher16Checksum.mjs";
import Fletcher32Checksum from "./Fletcher32Checksum.mjs";
import Fletcher64Checksum from "./Fletcher64Checksum.mjs";
import Adler32Checksum from "./Adler32Checksum.mjs";
import CRC8Checksum from "./CRC8Checksum.mjs";
import CRC16Checksum from "./CRC16Checksum.mjs";
import CRC32Checksum from "./CRC32Checksum.mjs";
import BLAKE2b from "./BLAKE2b.mjs";
import BLAKE2s from "./BLAKE2s.mjs";
import Streebog from "./Streebog.mjs";
import GOSTHash from "./GOSTHash.mjs";
import LMHash from "./LMHash.mjs";
import NTHash from "./NTHash.mjs";
import OperationError from "../errors/OperationError.mjs";

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
        this.args = [
            {
                name: "Length (bits)",
                type: "option",
                value: ["All", "128", "160", "224", "256", "320", "384", "512"]
            },
            {
                name: "Include names",
                type: "boolean",
                value: true
            }
        ];
        this.hashes = [
            { name: "MD2", algo: new MD2(), inputType: "arrayBuffer", params: [] },
            { name: "MD4", algo: new MD4(), inputType: "arrayBuffer", params: [] },
            { name: "MD5", algo: new MD5(), inputType: "arrayBuffer", params: [] },
            { name: "MD6", algo: new MD6(), inputType: "str", params: [] },
            { name: "SHA0", algo: new SHA0(), inputType: "arrayBuffer", params: [] },
            { name: "SHA1", algo: new SHA1(), inputType: "arrayBuffer", params: [] },
            { name: "SHA2 224", algo: new SHA2(), inputType: "arrayBuffer", params: ["224"] },
            { name: "SHA2 256", algo: new SHA2(), inputType: "arrayBuffer", params: ["256"] },
            { name: "SHA2 384", algo: new SHA2(), inputType: "arrayBuffer", params: ["384"] },
            { name: "SHA2 512", algo: new SHA2(), inputType: "arrayBuffer", params: ["512"] },
            { name: "SHA3 224", algo: new SHA3(), inputType: "arrayBuffer", params: ["224"] },
            { name: "SHA3 256", algo: new SHA3(), inputType: "arrayBuffer", params: ["256"] },
            { name: "SHA3 384", algo: new SHA3(), inputType: "arrayBuffer", params: ["384"] },
            { name: "SHA3 512", algo: new SHA3(), inputType: "arrayBuffer", params: ["512"] },
            { name: "Keccak 224", algo: new Keccak(), inputType: "arrayBuffer", params: ["224"] },
            { name: "Keccak 256", algo: new Keccak(), inputType: "arrayBuffer", params: ["256"] },
            { name: "Keccak 384", algo: new Keccak(), inputType: "arrayBuffer", params: ["384"] },
            { name: "Keccak 512", algo: new Keccak(), inputType: "arrayBuffer", params: ["512"] },
            { name: "Shake 128", algo: new Shake(), inputType: "arrayBuffer", params: ["128", 256] },
            { name: "Shake 256", algo: new Shake(), inputType: "arrayBuffer", params: ["256", 512] },
            { name: "RIPEMD-128", algo: new RIPEMD(), inputType: "arrayBuffer", params: ["128"] },
            { name: "RIPEMD-160", algo: new RIPEMD(), inputType: "arrayBuffer", params: ["160"] },
            { name: "RIPEMD-256", algo: new RIPEMD(), inputType: "arrayBuffer", params: ["256"] },
            { name: "RIPEMD-320", algo: new RIPEMD(), inputType: "arrayBuffer", params: ["320"] },
            { name: "HAS-160", algo: new HAS160(), inputType: "arrayBuffer", params: [] },
            { name: "Whirlpool-0", algo: new Whirlpool(), inputType: "arrayBuffer", params: ["Whirlpool-0"] },
            { name: "Whirlpool-T", algo: new Whirlpool(), inputType: "arrayBuffer", params: ["Whirlpool-T"] },
            { name: "Whirlpool", algo: new Whirlpool(), inputType: "arrayBuffer", params: ["Whirlpool"] },
            {
                name: "BLAKE2b-128",
                algo: new BLAKE2b(),
                inputType: "arrayBuffer",
                params: ["128", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2b-160",
                algo: new BLAKE2b(),
                inputType: "arrayBuffer",
                params: ["160", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2b-256",
                algo: new BLAKE2b(),
                inputType: "arrayBuffer",
                params: ["256", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2b-384",
                algo: new BLAKE2b(),
                inputType: "arrayBuffer",
                params: ["384", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2b-512",
                algo: new BLAKE2b(),
                inputType: "arrayBuffer",
                params: ["512", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2s-128",
                algo: new BLAKE2s(),
                inputType: "arrayBuffer",
                params: ["128", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2s-160",
                algo: new BLAKE2s(),
                inputType: "arrayBuffer",
                params: ["160", "Hex", { string: "", option: "UTF8" }]
            },
            {
                name: "BLAKE2s-256",
                algo: new BLAKE2s(),
                inputType: "arrayBuffer",
                params: ["256", "Hex", { string: "", option: "UTF8" }]
            },
            { name: "Streebog-256", algo: new Streebog(), inputType: "arrayBuffer", params: ["256"] },
            { name: "Streebog-512", algo: new Streebog(), inputType: "arrayBuffer", params: ["512"] },
            {
                name: "GOST",
                algo: new GOSTHash(),
                inputType: "arrayBuffer",
                params: ["GOST 28147 (1994)", "256", "D-A"]
            },
            { name: "LM Hash", algo: new LMHash(), inputType: "str", params: [] },
            { name: "NT Hash", algo: new NTHash(), inputType: "str", params: [] },
            { name: "SSDEEP", algo: new SSDEEP(), inputType: "str" },
            { name: "CTPH", algo: new CTPH(), inputType: "str" }
        ];
        this.checksums = [
            { name: "Fletcher-8", algo: new Fletcher8Checksum(), inputType: "byteArray", params: [] },
            { name: "Fletcher-16", algo: new Fletcher16Checksum(), inputType: "byteArray", params: [] },
            { name: "Fletcher-32", algo: new Fletcher32Checksum(), inputType: "byteArray", params: [] },
            { name: "Fletcher-64", algo: new Fletcher64Checksum(), inputType: "byteArray", params: [] },
            { name: "Adler-32", algo: new Adler32Checksum(), inputType: "byteArray", params: [] },
            { name: "CRC-8", algo: new CRC8Checksum(), inputType: "arrayBuffer", params: ["CRC-8"] },
            { name: "CRC-16", algo: new CRC16Checksum(), inputType: "arrayBuffer", params: [] },
            { name: "CRC-32", algo: new CRC32Checksum(), inputType: "arrayBuffer", params: [] }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [length, includeNames] = args;
        this.inputArrayBuffer = input;
        this.inputStr = Utils.arrayBufferToStr(input, false);
        this.inputByteArray = new Uint8Array(input);

        let digest,
            output = "";
        // iterate over each of the hashes
        this.hashes.forEach((hash) => {
            digest = this.executeAlgo(hash.algo, hash.inputType, hash.params || []);
            output += this.formatDigest(digest, length, includeNames, hash.name);
        });

        if (length === "All") {
            output += "\nChecksums:\n";
            this.checksums.forEach((checksum) => {
                digest = this.executeAlgo(checksum.algo, checksum.inputType, checksum.params || []);
                output += this.formatDigest(digest, length, includeNames, checksum.name);
            });
        }

        return output;
    }

    /**
     * Executes a hash or checksum algorithm
     *
     * @param {Function} algo - The hash or checksum algorithm
     * @param {string} inputType
     * @param {Object[]} [params=[]]
     * @returns {string}
     */
    executeAlgo(algo, inputType, params = []) {
        let digest = null;
        switch (inputType) {
            case "arrayBuffer":
                digest = algo.run(this.inputArrayBuffer, params);
                break;
            case "str":
                digest = algo.run(this.inputStr, params);
                break;
            case "byteArray":
                digest = algo.run(this.inputByteArray, params);
                break;
            default:
                throw new OperationError("Unknown hash input type: " + inputType);
        }

        return digest;
    }

    /**
     * Formats the digest depending on user-specified arguments
     * @param {string} digest
     * @param {string} length
     * @param {boolean} includeNames
     * @param {string} name
     * @returns {string}
     */
    formatDigest(digest, length, includeNames, name) {
        if (length !== "All" && digest.length * 4 !== parseInt(length, 10)) return "";

        if (!includeNames) return digest + "\n";

        return `${name}:${" ".repeat(13 - name.length)}${digest}\n`;
    }
}

export default GenerateAllHashes;
