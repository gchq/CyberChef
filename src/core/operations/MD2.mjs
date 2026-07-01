/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import {runHash} from "../lib/Hash.mjs";
import OperationError from "../errors/OperationError.mjs";

/**
 * MD2 operation
 */
class MD2 extends Operation {

    /**
     * MD2 constructor
     */
    constructor() {
        super();

        this.name = "MD2";
        this.module = "Crypto";
        this.description = "The MD2 (Message-Digest 2) algorithm is a cryptographic hash function developed by Ronald Rivest in 1989. The algorithm is optimized for 8-bit computers.<br><br>Although MD2 is no longer considered secure, even as of 2014, it remains in use in public key infrastructures as part of certificates generated with MD2 and RSA. The message digest algorithm consists, by default, of 18 rounds.";
        this.infoURL = "https://wikipedia.org/wiki/MD2_(cryptography)";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Rounds",
                type: "number",
                value: 18,
                min: 0
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const rounds = args[0] ?? 18;

        if (!Number.isInteger(rounds) || rounds < 0)
            throw new OperationError("Rounds must be a non-negative integer");

        return runHash("md2", input, {rounds});
    }

}

export default MD2;
