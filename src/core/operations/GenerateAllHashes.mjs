/**
 * @author john19696 [john19696@protonmail.com]
 * @copyright Crown Copyright 2023
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
                "name": "Length",
                "type": "option",
                "value": [
                    "All", "32", "40", "56", "64", "80", "96", "128"
                ]
            },
            {
                "name": "Output hash names",
                "type": "boolean",
                "value": true
            },
        ];
        this.hashes = [
            {"name": "MD2", "hash": (new MD2()), "type": "arrayBuffer", params: []},
            {"name": "MD4", "hash": (new MD4()), "type": "arrayBuffer", params: []},
            {"name": "MD5", "hash": (new MD5()), "type": "arrayBuffer", params: []},
            {"name": "MD6", "hash": (new MD6()), "type": "str", params: []},
            {"name": "SHA0", "hash": (new SHA0()), "type": "arrayBuffer", params: []},
            {"name": "SHA1", "hash": (new SHA1()), "type": "arrayBuffer", params: []},
            {"name": "SHA2 224", "hash": (new SHA2()), "type": "arrayBuffer", params: ["224"]},
            {"name": "SHA2 256", "hash": (new SHA2()), "type": "arrayBuffer", params: ["256"]},
            {"name": "SHA2 384", "hash": (new SHA2()), "type": "arrayBuffer", params: ["384"]},
            {"name": "SHA2 512", "hash": (new SHA2()), "type": "arrayBuffer", params: ["512"]},
            {"name": "SHA3 224", "hash": (new SHA3()), "type": "arrayBuffer", params: ["224"]},
            {"name": "SHA3 256", "hash": (new SHA3()), "type": "arrayBuffer", params: ["256"]},
            {"name": "SHA3 384", "hash": (new SHA3()), "type": "arrayBuffer", params: ["384"]},
            {"name": "SHA3 512", "hash": (new SHA3()), "type": "arrayBuffer", params: ["512"]},
            {"name": "Keccak 224", "hash": (new Keccak()), "type": "arrayBuffer", params: ["224"]},
            {"name": "Keccak 256", "hash": (new Keccak()), "type": "arrayBuffer", params: ["256"]},
            {"name": "Keccak 384", "hash": (new Keccak()), "type": "arrayBuffer", params: ["384"]},
            {"name": "Keccak 512", "hash": (new Keccak()), "type": "arrayBuffer", params: ["512"]},
            {"name": "Shake 128", "hash": (new Shake()), "type": "arrayBuffer", params: ["128", 256]},
            {"name": "Shake 256", "hash": (new Shake()), "type": "arrayBuffer", params: ["256", 512]},
            {"name": "RIPEMD-128", "hash": (new RIPEMD()), "type": "arrayBuffer", params: ["128"]},
            {"name": "RIPEMD-160", "hash": (new RIPEMD()), "type": "arrayBuffer", params: ["160"]},
            {"name": "RIPEMD-256", "hash": (new RIPEMD()), "type": "arrayBuffer", params: ["256"]},
            {"name": "RIPEMD-320", "hash": (new RIPEMD()), "type": "arrayBuffer", params: ["320"]},
            {"name": "HAS-160", "hash": (new HAS160()), "type": "arrayBuffer", params: []},
            {"name": "Whirlpool-0", "hash": (new Whirlpool()), "type": "arrayBuffer", params: ["Whirlpool-0"]},
            {"name": "Whirlpool-T", "hash": (new Whirlpool()), "type": "arrayBuffer", params: ["Whirlpool-T"]},
            {"name": "Whirlpool", "hash": (new Whirlpool()), "type": "arrayBuffer", params: ["Whirlpool"]},
            {"name": "BLAKE2b-128", "hash": (new BLAKE2b), "type": "arrayBuffer", params: ["128", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2b-160", "hash": (new BLAKE2b), "type": "arrayBuffer", params: ["160", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2b-256", "hash": (new BLAKE2b), "type": "arrayBuffer", params: ["256", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2b-384", "hash": (new BLAKE2b), "type": "arrayBuffer", params: ["384", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2b-512", "hash": (new BLAKE2b), "type": "arrayBuffer", params: ["512", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2s-128", "hash": (new BLAKE2s), "type": "arrayBuffer", params: ["128", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2s-160", "hash": (new BLAKE2s), "type": "arrayBuffer", params: ["160", "Hex", {string: "", option: "UTF8"}]},
            {"name": "BLAKE2s-256", "hash": (new BLAKE2s), "type": "arrayBuffer", params: ["256", "Hex", {string: "", option: "UTF8"}]},
            {"name": "Streebog-256", "hash": (new Streebog), "type": "arrayBuffer", params: ["256"]},
            {"name": "Streebog-512", "hash": (new Streebog), "type": "arrayBuffer", params: ["512"]},
            {"name": "GOST", "hash": (new GOSTHash), "type": "arrayBuffer", params: ["D-A"]},
            {"name": "SSDEEP", "hash": (new SSDEEP()), "type": "str"},
            {"name": "CTPH", "hash": (new CTPH()), "type": "str"}
        ];
        this.checksums = [
            {"name":  "Fletcher-8:   ", "checksum": (new Fletcher8Checksum), "type": "byteArray", "params": []},
            {"name":  "Fletcher-16:  ", "checksum": (new Fletcher16Checksum), "type": "byteArray", "params": []},
            {"name":  "Fletcher-32:  ", "checksum": (new Fletcher32Checksum), "type": "byteArray", "params": []},
            {"name":  "Fletcher-64:  ", "checksum": (new Fletcher64Checksum), "type": "byteArray", "params": []},
            {"name":  "Adler-32:     ", "checksum": (new Adler32Checksum), "type": "byteArray", "params": []},
            {"name":  "CRC-8:        ", "checksum": (new CRC8Checksum), "type": "arrayBuffer", "params": ["CRC-8"]},
            {"name":  "CRC-16:       ", "checksum": (new CRC16Checksum), "type": "arrayBuffer", "params": []},
            {"name":  "CRC-32:       ", "checksum": (new CRC32Checksum), "type": "arrayBuffer", "params": []}
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const length = args[0];
        const names = args[1];

        const arrayBuffer = input,
            str = Utils.arrayBufferToStr(arrayBuffer, false),
            byteArray = new Uint8Array(arrayBuffer);

        let value, output = "";
        // iterate over each of the hashes
        this.hashes.forEach(function (hash) {
            // calculate the hash value
            if (hash.type === "arrayBuffer") {
                value = hash.hash.run(arrayBuffer, hash.params);
            } else if (hash.type === "str") {
                if ("params" in hash) {
                    value = hash.hash.run(str, hash.params);
                } else {
                    value = hash.hash.run(str);
                }
            }
            // output the values base on the args: length & names
            if (length === "All" || value.length === parseInt(length, 10)) {
                if (names) {
                    output += hash.name + ":" + " ".repeat(13-hash.name.length);
                }
                output += value + "\n";
            }
        });

        if (length === "All") {
            output += "\nChecksums:" +
                "\nFletcher-8:   " + (new Fletcher8Checksum).run(byteArray, []) +
                "\nFletcher-16:  " + (new Fletcher16Checksum).run(byteArray, []) +
                "\nFletcher-32:  " + (new Fletcher32Checksum).run(byteArray, []) +
                "\nFletcher-64:  " + (new Fletcher64Checksum).run(byteArray, []) +
                "\nAdler-32:     " + (new Adler32Checksum).run(byteArray, []) +
                "\nCRC-8:        " + (new CRC8Checksum).run(arrayBuffer, ["CRC-8"]) +
                "\nCRC-16:       " + (new CRC16Checksum).run(arrayBuffer, []) +
                "\nCRC-32:       " + (new CRC32Checksum).run(arrayBuffer, []);
        }

        return output;
    }

}

export default GenerateAllHashes;
