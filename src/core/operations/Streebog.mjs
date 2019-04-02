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
        this.args = [
            {
                "name": "Version",
                "type": "option",
                "value": ["2012", "1994"]
            },
            // Paramset sBox for GOST 28147-89. Used only if version = 1994
            {
                "name": "S-Box",
                "type": "option",
                "value": [
                    "D-A",
                    "D-SC",
                    "E-TEST",
                    "E-A",
                    "E-B",
                    "E-C",
                    "E-D",
                    "E-SC",
                    "E-Z",
                    "D-TEST"
                ]
            },
            // 512 bits digest, valid only for algorithm "Streebog"
            {
                "name": "Length",
                "type": "option",
                "value": ["256", "512"]
            }
        ];
    }

    /**
     * @param {string} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        try {
            const version = parseInt(args[0], 10);
            let sBox = args[1];
            let length = parseInt(args[2], 10);

            // 1994 old-style 256 bits digest based on GOST 28147-89
            if (version === 1994) {
                length = 256;
            }

            if (version === 2012) {
                sBox = "";
            }

            const gostDigest = new GostDigest({name: "GOST R 34.11", version, sBox, length });
            const gostCoding = new GostCoding();


            const decode = gostCoding.Chars.decode(input);
            const hexEncode = gostCoding.Hex.encode(gostDigest.digest(decode));

            return hexEncode.replace(/[^\-A-Fa-f0-9]/g, "").toLowerCase();
        } catch (err) {
            throw new OperationError(`Invalid Input, Details ${err.message}`);
        }
    }

}

export default Streebog;
