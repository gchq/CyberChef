/**
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

import Operation from "../Operation";
import JSSHA3 from "js-sha3";
import OperationError from "../errors/OperationError";

/**
 * Keccak operation
 */
class Keccak extends Operation {

    /**
     * Keccak constructor
     */
    constructor() {
        super();

        this.name = "Keccak";
        this.module = "Hashing";
        this.description = "The Keccak hash algorithm was designed by Guido Bertoni, Joan Daemen, Micha\xebl Peeters, and Gilles Van Assche, building upon RadioGat\xfan. It was selected as the winner of the SHA-3 design competition.<br><br>This version of the algorithm is Keccak[c=2d] and differs from the SHA-3 specification.";
        this.inputType = "ArrayBuffer";
        this.outputType = "string";
        this.args = [
            {
                "name": "Size",
                "type": "option",
                "value": ["512", "384", "256", "224"]
            }
        ];
    }

    /**
     * @param {ArrayBuffer} input
     * @param {Object[]} args
     * @returns {string}
     */
    run(input, args) {
        const size = parseInt(args[0], 10);
        let algo;

        switch (size) {
            case 224:
                algo = JSSHA3.keccak224;
                break;
            case 384:
                algo = JSSHA3.keccak384;
                break;
            case 256:
                algo = JSSHA3.keccak256;
                break;
            case 512:
                algo = JSSHA3.keccak512;
                break;
            default:
                throw new OperationError("Invalid size");
        }

        return algo(input);
    }

}

export default Keccak;
