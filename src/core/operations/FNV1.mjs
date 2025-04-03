/**
 * @author TheIndra55 [theindra@protonmail.com]
 * @copyright Crown Copyright 2023
 * @license Apache-2.0
 */

import Operation from "../Operation.mjs";
import Utils from "../Utils.mjs";
import {fnv1, FNV_OPTIONS} from "../lib/FNV.mjs";

/**
 * FNV-1 operation
 */
class FNV1 extends Operation {

    /**
     * FNV1 constructor
     */
    constructor() {
        super();

        this.name = "FNV-1";
        this.module = "Default";
        this.description = "Fowler-Noll-Vo (or FNV) is a non-cryptographic hash function created by Glenn Fowler, Landon Curt Noll, and Kiem-Phong Vo.";
        this.infoURL = "https://wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV-1_hash";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                name: "Size",
                type: "option",
                value: ["32", "64", "128", "256"],
                defaultIndex: 0
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const size = Number(args[0]),
            options = FNV_OPTIONS[size];

        input = new Uint8Array(input);

        const hash = fnv1(input, options);

        return Utils.hex(hash);
    }

}

export default FNV1;
