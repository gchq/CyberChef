/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import OperationError from "../errors/OperationError.mjs";
import GostDigest from "../vendor/gost/gostDigest.mjs";
import { toHexFast } from "../lib/Hex.mjs";

/**
 * Streebog operation
 */
class Streebog extends Operation {
    /**
     * Streebog constructor
     */
    constructor() {
        super();

        this.name = "Streebog";
        this.module = "Hashing";
        this.description
            = "Streebog is a cryptographic hash function defined in the Russian national standard GOST R 34.11-2012 <i>Information Technology \u2013 Cryptographic Information Security \u2013 Hash Function</i>. It was created to replace an obsolete GOST hash function defined in the old standard GOST R 34.11-94, and as an asymmetric reply to SHA-3 competition by the US National Institute of Standards and Technology.";
        this.infoURL = "https://wikipedia.org/wiki/Streebog";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Digest length",
                "type": "option",
                "value": ["256", "512"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const [length] = args;

        const algorithm = {
            version: 2012,
            mode: "HASH",
            length: parseInt(length, 10)
        };

        try {
            const gostDigest = new GostDigest(algorithm);

            return toHexFast(gostDigest.digest(input));
        } catch (err) {
            throw new OperationError(err);
        }
    }
}

export default Streebog;
