/**
 * @author mshwed [m@ttshwed.com]
 * @copyright Crown Copyright 2019
 * @license Apache-2.0
 */

import Operation from "../Operation";
import OperationError from "../errors/OperationError";
import * as GostDigest from "../vendor/streebog/gostDigest";
import * as GostCoding from "../vendor/streebog/gostCoding";

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
        this.module = "Crypto";
        this.description = "Streebog is a cryptographic hash function defined in the Russian national standard GOST R 34.11-2012 Information Technology \u2013 Cryptographic Information Security \u2013 Hash Function. It was created to replace an obsolete GOST hash function defined in the old standard GOST R 34.11-94, and as an asymmetric reply to SHA-3 competition by the US National Institute of Standards and Technology.";
        this.infoURL = "https://en.wikipedia.org/wiki/Streebog";
        this.inputType = "string";
        this.outputType = "string";
        this.args = [];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const gostDigest = new GostDigest({name: 'GOST R 34.11', version: 1994});
            const gostCoding = new GostCoding();

            const decode = gostCoding.Chars.decode(input, 'utf8');
            let hexEncode = gostCoding.Hex.encode(gostDigest.digest(decode))
            
            return hexEncode.replace(/[^\-A-Fa-f0-9]/g, '').toLowerCase();; 
        } catch (err) {
            console.log(err)
            throw new OperationError("Test");
        }
    }

}

export default Streebog;
