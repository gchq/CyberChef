/**
 * @author Tan Zhen Yong [tzy@beyondthesprawl.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import Utils from "../Utils.mjs";
import argon2 from "argon2-browser";

/**
 * Argon2 operation
 */
class Argon2 extends Operation {
    /**
     * Argon2 constructor
     */
    constructor() {
        super();

        this.name = "Argon2";
        this.module = "Crypto";
        this.description
            = "Argon2 is a key derivation function that was selected as the winner of the Password Hashing Competition in July 2015. It was designed by Alex Biryukov, Daniel Dinu, and Dmitry Khovratovich from the University of Luxembourg.<br><br>Enter the password in the input to generate its hash.";
        this.infoURL = "https://wikipedia.org/wiki/Argon2";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [
            {
                "name": "Salt",
                "type": "toggleString",
                "value": "somesalt",
                "toggleValues": ["UTF8", "Hex", "Base64", "Latin1"]
            },
            {
                "name": "Iterations",
                "type": "number",
                "value": 3
            },
            {
                "name": "Memory (KiB)",
                "type": "number",
                "value": 4096
            },
            {
                "name": "Parallelism",
                "type": "number",
                "value": 1
            },
            {
                "name": "Hash length (bytes)",
                "type": "number",
                "value": 32
            },
            {
                "name": "Type",
                "type": "option",
                "value": ["Argon2i", "Argon2d", "Argon2id"],
                "defaultIndex": 0
            },
            {
                "name": "Output format",
                "type": "option",
                "value": ["Encoded hash", "Hex hash", "Raw hash"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    async run(input, args) {
        const argon2Types = {
            "Argon2i": argon2.ArgonType.Argon2i,
            "Argon2d": argon2.ArgonType.Argon2d,
            "Argon2id": argon2.ArgonType.Argon2id
        };

        const salt = Utils.convertToByteString(args[0].string || "", args[0].option),
            time = args[1],
            mem = args[2],
            parallelism = args[3],
            hashLen = args[4],
            type = argon2Types[args[5]],
            outFormat = args[6];

        try {
            const result = await argon2.hash({
                pass: input,
                salt,
                time,
                mem,
                parallelism,
                hashLen,
                type
            });

            switch (outFormat) {
                case "Hex hash":
                    return result.hashHex;
                case "Raw hash":
                    return Utils.arrayBufferToStr(result.hash);
                case "Encoded hash":
                default:
                    return result.encoded;
            }
        } catch (err) {
            throw new OperationError(`Error: ${err.message}`);
        }
    }
}

export default Argon2;
